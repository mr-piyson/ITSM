import type { RowDataPacket } from "mysql2";

import db from "@/lib/database";

/**
 * Typed access to the MES pool for the access control module.
 *
 * The pool is shared with every other module, so DATETIME/TIMESTAMP columns are
 * read as strings on a per-query basis instead of changing the pool
 * configuration. Group validity windows are compared and sliced as strings, and
 * inflating them into `Date` objects would shift them by the process timezone.
 */

type BindScalar = string | number | boolean | Date | Buffer | null;
type BindValue = BindScalar | BindScalar[];

function bindScalar(value: unknown): BindScalar {
	if (value === undefined || value === null) return null;
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		value instanceof Date
	) {
		return value;
	}
	if (Buffer.isBuffer(value)) return value;
	return String(value);
}

/**
 * Arrays must stay arrays: mysql2 expands them into a placeholder list for
 * `IN (?)`. Coercing one to a string would produce `IN ('1,2,3')`, which
 * matches nothing and fails silently.
 */
function bindable(values: readonly unknown[]): BindValue[] {
	return values.map((value) =>
		Array.isArray(value) ? value.map(bindScalar) : bindScalar(value),
	);
}

/** Thrown for access control queries that cannot be completed. */
export class AcQueryError extends Error {
	readonly sql: string;

	constructor(message: string, sql: string, cause?: unknown) {
		super(message, { cause });
		this.name = "AcQueryError";
		this.sql = sql;
	}
}

/**
 * Expands array binds into one `?` per element.
 *
 * `pool.execute()` runs a prepared statement, and MySQL prepared statements do
 * not expand a single `?` into a list, so `WHERE id IN (?)` with `[[1, 2]]`
 * would look for the literal string "1,2" and silently match nothing.
 * (Only the unprepared `pool.query()` expands arrays.) Rewriting the statement
 * to `IN (?, ?)` keeps values parameterized, so this stays injection safe.
 *
 * Assumes every `?` in the statement is a placeholder, which holds for the
 * hand-written SQL in this module.
 */
function expandPlaceholders(
	sql: string,
	values: readonly BindValue[],
): { sql: string; values: BindScalar[] } {
	if (!values.some((value) => Array.isArray(value))) {
		return { sql, values: values as BindScalar[] };
	}

	const outSql: string[] = [];
	const outValues: BindScalar[] = [];
	let cursor = 0;

	for (const char of sql) {
		if (char !== "?" || cursor >= values.length) {
			outSql.push(char);
			continue;
		}
		const value = values[cursor++];
		if (Array.isArray(value)) {
			// An empty list can never match; a bare `IN ()` is a syntax error.
			outSql.push(
				value.length === 0 ? "NULL" : value.map(() => "?").join(", "),
			);
			outValues.push(...value);
		} else {
			outSql.push("?");
			outValues.push(value);
		}
	}

	return { sql: outSql.join(""), values: outValues };
}

async function runQuery<T>(
	sql: string,
	values: readonly unknown[],
): Promise<T[]> {
	try {
		const bound = bindable(values);
		const expanded = expandPlaceholders(sql, bound);
		const [rows] = await db.mes.execute({
			sql: expanded.sql,
			values: expanded.values,
			dateStrings: true,
		});
		return rows as unknown as T[];
	} catch (error) {
		throw new AcQueryError("Access control query failed", sql, error);
	}
}

export async function acQuery<T extends RowDataPacket>(
	sql: string,
	values: readonly unknown[] = [],
): Promise<T[]> {
	return runQuery<T>(sql, values);
}

export async function acQueryOne<T extends RowDataPacket>(
	sql: string,
	values: readonly unknown[] = [],
): Promise<T | null> {
	const rows = await runQuery<T>(sql, values);
	return rows[0] ?? null;
}

export async function acCount(
	sql: string,
	values: readonly unknown[] = [],
): Promise<number> {
	const rows = await runQuery<RowDataPacket & { total?: number }>(sql, values);
	return Number(rows[0]?.total ?? 0);
}

export function asString(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	const text = String(value);
	return text === "" ? null : text;
}

export function asNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

export function asInt(value: unknown): number {
	return Number(asNumber(value) ?? 0);
}

export function asBool(value: unknown): boolean {
	const parsed = asNumber(value);
	return parsed !== null && parsed !== 0;
}

export function clampPageSize(value: number, fallback: number, max: number) {
	if (!Number.isFinite(value) || value < 1) return fallback;
	return Math.min(Math.floor(value), max);
}

export function pageCount(total: number, perPage: number): number {
	if (perPage < 1) return 0;
	return Math.ceil(total / perPage);
}
