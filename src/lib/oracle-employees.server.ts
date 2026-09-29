import db, { type OracleConnection, type OraclePool } from "@/lib/database";

export type PickEmployee = {
	emplCode: string;
	name: string;
	image: string | null;
};

export type OracleEmployeeInfo = PickEmployee & {
	email: string | null;
};

type Row = unknown[];

const BASE_SELECT = `SELECT tem.EMPL_CODE, tem.EMPL_PNAME, tem.EMP_PIC_PATH, tem.EMAIL_ID
	 FROM T633_EMPL_MASTER tem`;

/**
 * Employees that can be selected as an asset owner / provide recipient /
 * booking employee: currently on payroll, not a visitor and not a
 * `-0` suffixed record.
 */
const PICKABLE_FILTER = `tem.LEFT_DATE IS NULL
	   AND tem.T627_DESGN_CODE != 'VISIT'
	   AND tem.EMPL_CODE NOT LIKE '%-0%'`;

const CHUNK_SIZE = 500;

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toEmployee(row: Row): OracleEmployeeInfo {
	return {
		emplCode: String(row[0] ?? "").trim(),
		name: toString(row[1]) ?? "",
		image: toString(row[2]),
		email: toString(row[3]),
	};
}

async function withOracleConnection<T>(
	run: (conn: OracleConnection) => Promise<T>,
): Promise<T> {
	const pool: OraclePool = await db.mis;
	const conn = await pool.getConnection();
	try {
		return await run(conn);
	} finally {
		await conn.release();
	}
}

export async function listPickableEmployees(): Promise<PickEmployee[]> {
	const rows = await withOracleConnection(async (conn) => {
		const result = await conn.execute(
			`${BASE_SELECT}
			 WHERE ${PICKABLE_FILTER}
			 ORDER BY tem.EMPL_PNAME ASC`,
		);
		return (result.rows ?? []) as Row[];
	});

	return rows.map((row) => {
		const employee = toEmployee(row);
		return {
			emplCode: employee.emplCode,
			name: employee.name,
			image: employee.image,
		};
	});
}

/**
 * Resolves stored `EMPL_CODE` values back to employee details.
 *
 * Deliberately unfiltered by `LEFT_DATE` so historical records (provides,
 * bookings, owner changes) still render the name of someone who has since
 * left the company. Codes with no Oracle record are simply absent from the
 * returned map — callers should render them as blank.
 */
export async function getEmployeesByCodes(
	codes: Iterable<string | number | null | undefined>,
): Promise<Map<string, OracleEmployeeInfo>> {
	const unique = new Set<string>();
	for (const code of codes) {
		if (code === null || code === undefined) continue;
		const trimmed = String(code).trim();
		if (!trimmed || trimmed === "0" || trimmed === "0000") continue;
		unique.add(trimmed);
	}

	const map = new Map<string, OracleEmployeeInfo>();
	const list = [...unique];
	if (list.length === 0) {
		return map;
	}

	for (let index = 0; index < list.length; index += CHUNK_SIZE) {
		const chunk = list.slice(index, index + CHUNK_SIZE);
		const binds = chunk.map((_, offset) => `:${offset + 1}`);
		const rows = await withOracleConnection(async (conn) => {
			const result = await conn.execute(
				`${BASE_SELECT}
				 WHERE tem.EMPL_CODE IN (${binds.join(", ")})`,
				chunk,
			);
			return (result.rows ?? []) as Row[];
		});
		for (const row of rows) {
			const employee = toEmployee(row);
			map.set(employee.emplCode, employee);
		}
	}

	return map;
}
