import type { RowDataPacket } from "mysql2";

import {
	AC_DEFAULT_PAGE_SIZE,
	AC_MAX_PAGE_SIZE,
	AC_TABLES,
	GROUP_DEFAULT_ORDER,
	GROUP_SEARCH_SQL,
} from "./constants";
import { parseCsvInts } from "./csv";
import {
	acCount,
	acQuery,
	acQueryOne,
	asInt,
	asNumber,
	asString,
	clampPageSize,
	pageCount,
} from "./query";
import type {
	AcGroupListArgs,
	AcGroupListInput,
	AcGroupListResult,
	AcGroupRecord,
	AcGroupSummary,
} from "./types";
import { AcGroupListInputSchema } from "./types";

type Row = RowDataPacket & Record<string, unknown>;

const GROUP_COLUMNS = `
	g.id,
	g.name,
	g.devices,
	g.start_datetime AS startDatetime,
	g.end_datetime AS endDatetime,
	g.repeated,
	g.current_activated AS currentActivated,
	g.activated_devices AS activatedDevices,
	g.activated_users AS activatedUsers,
	g.activated_at AS activatedAt,
	g.created_at AS createdAt,
	g.created_by AS createdBy,
	g.updated_at AS updatedAt,
	g.updated_by AS updatedBy,
	g.deleted_at AS deletedAt,
	g.deleted_by AS deletedBy`;

function toGroup(row: Row): AcGroupRecord {
	return {
		id: asInt(row.id),
		name: String(row.name ?? ""),
		devices: asString(row.devices),
		startDatetime: asString(row.startDatetime),
		endDatetime: asString(row.endDatetime),
		repeated: asInt(row.repeated),
		currentActivated: asInt(row.currentActivated),
		activatedDevices: asString(row.activatedDevices),
		activatedUsers: asString(row.activatedUsers),
		activatedAt: asString(row.activatedAt),
		createdAt: asString(row.createdAt),
		createdBy: asNumber(row.createdBy),
		updatedAt: asString(row.updatedAt),
		updatedBy: asNumber(row.updatedBy),
		deletedAt: asString(row.deletedAt),
		deletedBy: asNumber(row.deletedBy),
	};
}

function toSummary(row: Row): AcGroupSummary {
	return { id: asInt(row.id), name: String(row.name ?? "") };
}

export async function listAcGroups(
	args: AcGroupListArgs,
): Promise<AcGroupListResult> {
	const input: AcGroupListInput = AcGroupListInputSchema.parse(args);
	const perPage = clampPageSize(
		input.perPage,
		AC_DEFAULT_PAGE_SIZE,
		AC_MAX_PAGE_SIZE,
	);
	const page = Math.max(1, Math.floor(input.page));
	const where: string[] = [];
	const values: unknown[] = [];

	if (!input.includeDeleted) where.push("g.deleted_at IS NULL");

	if (input.q) {
		const fields =
			input.searchIn === "all"
				? Object.keys(GROUP_SEARCH_SQL)
				: [input.searchIn];
		const columns = fields
			.map((field) => GROUP_SEARCH_SQL[field])
			.filter((column): column is string => !!column);
		if (columns.length) {
			where.push(
				`(${columns.map((column) => `${column} LIKE ?`).join(" OR ")})`,
			);
			const like = `%${input.q}%`;
			values.push(...columns.map(() => like));
		}
	}

	const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
	const total = await acCount(
		`SELECT COUNT(*) AS total FROM ${AC_TABLES.groups} g ${whereSql}`,
		values,
	);

	const rows = await acQuery<Row>(
		`SELECT${GROUP_COLUMNS}
		 FROM ${AC_TABLES.groups} g
		 ${whereSql}
		 ORDER BY ${GROUP_DEFAULT_ORDER.join(", ")}
		 LIMIT ? OFFSET ?`,
		[...values, perPage, (page - 1) * perPage],
	);

	return {
		rows: rows.map(toGroup),
		total,
		page,
		perPage,
		pageCount: pageCount(total, perPage),
	};
}

export async function getAcGroup(id: number): Promise<AcGroupRecord | null> {
	const row = await acQueryOne<Row>(
		`SELECT${GROUP_COLUMNS} FROM ${AC_TABLES.groups} g WHERE g.id = ? LIMIT 1`,
		[id],
	);
	return row ? toGroup(row) : null;
}

/** Batched lookup so list views can label group tags without a query per row. */
export async function getAcGroupsByIds(
	ids: readonly number[],
): Promise<AcGroupSummary[]> {
	const unique = [...new Set(ids.filter((id) => Number.isInteger(id)))];
	if (unique.length === 0) return [];
	const rows = await acQuery<Row>(
		`SELECT g.id, g.name
		 FROM ${AC_TABLES.groups} g
		 WHERE g.deleted_at IS NULL AND g.id IN (?)`,
		[unique],
	);
	return rows.map(toSummary);
}

/**
 * Legacy membership test (access_control/groups/action.php:514). FIND_IN_SET is
 * the only option while the relation is stored as a CSV column.
 */
export async function usersInGroup(groupId: number): Promise<string[]> {
	const rows = await acQuery<Row>(
		`SELECT u.person_id AS personId
		 FROM ${AC_TABLES.users} u
		 WHERE FIND_IN_SET(?, u.access_group) AND u.deleted_at IS NULL
		 ORDER BY u.person_id ASC`,
		[groupId],
	);
	return rows.map((row) => String(row.personId ?? ""));
}

export async function countUsersInGroup(groupId: number): Promise<number> {
	return acCount(
		`SELECT COUNT(*) AS total
		 FROM ${AC_TABLES.users} u
		 WHERE FIND_IN_SET(?, u.access_group) AND u.deleted_at IS NULL`,
		[groupId],
	);
}

/**
 * Flattened device ids claimed by any of the given groups. The legacy code
 * diffed a nested PDO column fetch against a flat id list, which produced
 * spurious removals (inc/functions.php:7140-7144).
 */
export async function deviceIdsForGroups(
	groupIds: readonly number[],
): Promise<Set<number>> {
	const unique = [...new Set(groupIds.filter((id) => Number.isInteger(id)))];
	if (unique.length === 0) return new Set();

	const rows = await acQuery<Row>(
		`SELECT g.devices
		 FROM ${AC_TABLES.groups} g
		 WHERE g.deleted_at IS NULL AND g.id IN (?)`,
		[unique],
	);

	const deviceIds = new Set<number>();
	for (const row of rows) {
		for (const deviceId of parseCsvInts(asString(row.devices))) {
			deviceIds.add(deviceId);
		}
	}
	return deviceIds;
}

/** Device ids of a single group. */
export async function deviceIdsForGroup(groupId: number): Promise<number[]> {
	const group = await getAcGroup(groupId);
	return parseCsvInts(group?.devices);
}
