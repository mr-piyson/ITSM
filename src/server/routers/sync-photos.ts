import { TRPCError } from "@trpc/server";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import type { OracleConnection } from "@/lib/database";
import { protectedProcedure, router } from "@/server/trpc";

export type SyncPhotoEmployee = {
	id: number;
	empId: number;
	empCode: string;
	name: string;
	department: string;
	imageUrl: string;
	oraclePicPath: string | null;
	syncStatus: "synced" | "different" | "not_in_oracle" | "no_photo";
};

export type SyncPhotoFailure = {
	empCode: string;
	message: string;
};

export type SyncAllResult = {
	total: number;
	skipped: number;
	succeeded: number;
	failed: number;
	failures: SyncPhotoFailure[];
};

export type SyncPhotoListResult = {
	rows: SyncPhotoEmployee[];
	total: number;
};

type EmployeePhotoRow = RowDataPacket & {
	id: number;
	emp_id: number;
	emp_code: string;
	name: string;
	department: string | null;
	filename: string | null;
	image_url: string | null;
};

type SyncAllRow = RowDataPacket & {
	emp_code: string;
	image_url: string;
};

type CountRow = RowDataPacket & {
	total: number | string;
};

const PHOTO_URL_EXPR = `CONCAT('http://intranet.bfginternational.com:88/storage/employee/', MD5(e.id), '/', r.filename, '.jpg')`;

const EMPLOYEE_PATH_TABLE = "T633_EMPL_MASTER";
const ORACLE_READ_BATCH_SIZE = 1000;
const MAX_IN_CLAUSES_PER_STATEMENT = 10;
const SYNC_BATCH_SIZE = 500;

const UPDATE_PIC_PATH_SQL = `UPDATE ${EMPLOYEE_PATH_TABLE} SET EMP_PIC_PATH = :1 WHERE EMPL_CODE = :2`;

function buildBulkUpdateSql(rowCount: number): string {
	const rows: string[] = [];
	for (let i = 0; i < rowCount; i++) {
		rows.push(
			`SELECT :${i * 2 + 1} AS EMPL_CODE, :${i * 2 + 2} AS EMP_PIC_PATH FROM DUAL`,
		);
	}
	return `MERGE INTO ${EMPLOYEE_PATH_TABLE} t
		USING (${rows.join(" UNION ALL ")}) s
		ON (t.EMPL_CODE = s.EMPL_CODE)
		WHEN MATCHED THEN UPDATE SET t.EMP_PIC_PATH = s.EMP_PIC_PATH`;
}

async function fetchEmpPicPaths(
	conn: OracleConnection,
	empCodes: string[],
): Promise<Map<string, string | null>> {
	const result = new Map<string, string | null>();

	// Oracle caps each IN list at 1000 expressions, so UNION multiple IN
	// clauses into one statement to keep the read to a single round trip.
	for (
		let start = 0;
		start < empCodes.length;
		start += ORACLE_READ_BATCH_SIZE * MAX_IN_CLAUSES_PER_STATEMENT
	) {
		const codes = empCodes.slice(
			start,
			start + ORACLE_READ_BATCH_SIZE * MAX_IN_CLAUSES_PER_STATEMENT,
		);

		const statements: string[] = [];
		let bindIndex = 1;
		for (let i = 0; i < codes.length; i += ORACLE_READ_BATCH_SIZE) {
			const batch = codes.slice(i, i + ORACLE_READ_BATCH_SIZE);
			const placeholders = batch.map(() => `:${bindIndex++}`).join(",");
			statements.push(
				`SELECT EMPL_CODE, EMP_PIC_PATH FROM ${EMPLOYEE_PATH_TABLE} WHERE EMPL_CODE IN (${placeholders})`,
			);
		}

		const { rows } = await conn.execute(statements.join(" UNION ALL "), codes);
		for (const row of (rows ?? []) as [string, string | null][]) {
			result.set(row[0], row[1] || null);
		}
	}

	return result;
}

export const syncPhotosRouter = router({
	list: protectedProcedure
		.input(
			z.object({
				q: z.string().max(100).default(""),
				page: z.coerce.number().int().min(1).default(1),
				pageSize: z.coerce.number().int().min(10).max(100).default(30),
			}),
		)
		.query(async ({ ctx, input }): Promise<SyncPhotoListResult> => {
			const search = input.q.trim();

			const fromClause = `FROM mes.employees e
				LEFT JOIN mes.resources r ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'`;

			let whereClause = "WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL";
			const params: string[] = [];

			if (search) {
				whereClause +=
					" AND (e.emp_id LIKE ? OR e.emp_code LIKE ? OR e.name LIKE ? OR e.department LIKE ?)";
				params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
			}

			const [countRows] = await ctx.db.mes.query<CountRow[]>(
				`SELECT COUNT(*) AS total ${fromClause} ${whereClause}`,
				params,
			);
			const total = Number(countRows[0]?.total ?? 0);

			const [rows] = await ctx.db.mes.query<EmployeePhotoRow[]>(
				`SELECT e.id, e.emp_id, e.emp_code, e.name, e.department,
					r.filename, ${PHOTO_URL_EXPR} AS image_url
				 ${fromClause}
				 ${whereClause}
				 ORDER BY e.emp_id ASC
				 LIMIT ? OFFSET ?`,
				[...params, input.pageSize, (input.page - 1) * input.pageSize],
			);

			const employees = rows as EmployeePhotoRow[];

			let oracleMap = new Map<string, string | null>();
			if (employees.length > 0) {
				const pool = await ctx.db.mis;
				const conn = await pool.getConnection();
				try {
					oracleMap = await fetchEmpPicPaths(
						conn,
						employees.map((e) => e.emp_code),
					);
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: `Failed to read Oracle EMP_PIC_PATH: ${
							error instanceof Error ? error.message : "unknown error"
						}`,
					});
				} finally {
					await conn.release();
				}
			}

			return {
				total,
				rows: employees.map((emp) => {
					const empCode = emp.emp_code;
					const imageUrl = emp.image_url || "";
					const oraclePath = oracleMap.get(empCode) ?? null;

					let syncStatus: SyncPhotoEmployee["syncStatus"] = "no_photo";
					if (imageUrl && oraclePath === imageUrl) syncStatus = "synced";
					else if (imageUrl && oraclePath) syncStatus = "different";
					else if (imageUrl) syncStatus = "not_in_oracle";

					return {
						id: emp.id,
						empId: emp.emp_id,
						empCode,
						name: emp.name,
						department: emp.department ?? "",
						imageUrl,
						oraclePicPath: oraclePath,
						syncStatus,
					};
				}),
			};
		}),

	syncOne: protectedProcedure
		.input(
			z.object({
				empCode: z.string().min(1).max(50),
				imageUrl: z.url(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const pool = await ctx.db.mis;
			const conn = await pool.getConnection();

			try {
				const result = await conn.execute(
					UPDATE_PIC_PATH_SQL,
					[input.imageUrl, input.empCode],
					{ autoCommit: true },
				);

				if ((result.rowsAffected ?? 0) === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `No Oracle record found for ${input.empCode}`,
					});
				}

				return { empCode: input.empCode, imageUrl: input.imageUrl };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Oracle update failed: ${
						error instanceof Error ? error.message : "unknown error"
					}`,
				});
			} finally {
				await conn.release();
			}
		}),

	syncAll: protectedProcedure.mutation(
		async ({ ctx }): Promise<SyncAllResult> => {
			const pool = await ctx.db.mis;
			const conn = await pool.getConnection();
			const failures: SyncPhotoFailure[] = [];
			let total = 0;
			let succeeded = 0;
			let skipped = 0;

			try {
				let offset = 0;
				while (true) {
					const [rows] = await ctx.db.mes.query<SyncAllRow[]>(
						`SELECT e.emp_code, ${PHOTO_URL_EXPR} AS image_url
						 FROM mes.employees e
						 INNER JOIN mes.resources r ON r.uid = e.id AND r.model = 'employee' AND r.attr = 'photo'
						 WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL
						 ORDER BY e.emp_id ASC
						 LIMIT ? OFFSET ?`,
						[SYNC_BATCH_SIZE, offset],
					);
					const employees = rows as SyncAllRow[];
					if (employees.length === 0) {
						break;
					}

					total += employees.length;
					const oracleMap = await fetchEmpPicPaths(
						conn,
						employees.map((e) => e.emp_code),
					);

					const pending = new Map<string, string>();
					for (const emp of employees) {
						if (oracleMap.get(emp.emp_code) !== emp.image_url) {
							pending.set(emp.emp_code, emp.image_url);
						}
					}
					skipped += employees.length - pending.size;

					const binds = Array.from(pending).flatMap(([empCode, imageUrl]) => [
						empCode,
						imageUrl,
					]);
					if (binds.length > 0) {
						try {
							await conn.execute(buildBulkUpdateSql(pending.size), binds);
							succeeded += pending.size;
						} catch {
							for (const [empCode, imageUrl] of pending) {
								try {
									await conn.execute(UPDATE_PIC_PATH_SQL, [imageUrl, empCode]);
									succeeded++;
								} catch (error) {
									failures.push({
										empCode,
										message:
											error instanceof Error ? error.message : "Unknown error",
									});
								}
							}
						}
					}

					offset += employees.length;
					if (employees.length < SYNC_BATCH_SIZE) {
						break;
					}
				}

				await conn.commit();
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Oracle sync failed: ${
						error instanceof Error ? error.message : "unknown error"
					}`,
				});
			} finally {
				await conn.release();
			}

			return {
				total,
				skipped,
				succeeded,
				failed: failures.length,
				failures,
			};
		},
	),
});
