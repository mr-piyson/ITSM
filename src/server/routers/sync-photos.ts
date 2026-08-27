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
	succeeded: number;
	failed: number;
	failures: SyncPhotoFailure[];
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

const PHOTO_URL_EXPR = `CONCAT('http://intranet.bfginternational.com:88/storage/employee/', MD5(e.id), '/', r.filename, '.jpg')`;

const EMPLOYEE_PATH_TABLE = "T633_EMPL_MASTER";
const ORACLE_READ_BATCH_SIZE = 1000;

async function fetchEmpPicPaths(
	conn: OracleConnection,
	empCodes: string[],
): Promise<Map<string, string | null>> {
	const result = new Map<string, string | null>();

	for (let i = 0; i < empCodes.length; i += ORACLE_READ_BATCH_SIZE) {
		const batch = empCodes.slice(i, i + ORACLE_READ_BATCH_SIZE);
		const placeholders = batch.map((_, j) => `:${j + 1}`).join(",");
		const { rows } = await conn.execute(
			`SELECT EMPL_CODE, EMP_PIC_PATH FROM ${EMPLOYEE_PATH_TABLE} WHERE EMPL_CODE IN (${placeholders})`,
			batch,
		);
		for (const row of (rows ?? []) as [string, string | null][]) {
			result.set(row[0], row[1] || null);
		}
	}

	return result;
}

export const syncPhotosRouter = router({
	list: protectedProcedure
		.input(z.object({ q: z.string().max(100).default("") }))
		.query(async ({ ctx, input }): Promise<SyncPhotoEmployee[]> => {
			const search = input.q.trim();

			let whereClause = "WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL";
			const params: string[] = [];

			if (search) {
				whereClause +=
					" AND (e.emp_id LIKE ? OR e.emp_code LIKE ? OR e.name LIKE ?)";
				params.push(`%${search}%`, `%${search}%`, `%${search}%`);
			}

			const [rows] = await ctx.db.mes.execute<EmployeePhotoRow[]>(
				`SELECT e.id, e.emp_id, e.emp_code, e.name, e.department,
					r.filename, ${PHOTO_URL_EXPR} AS image_url
				 FROM mes.employees e
				 LEFT JOIN mes.resources r ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'
				 ${whereClause}
				 ORDER BY e.emp_id ASC`,
				params,
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

			return employees.map((emp) => {
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
			});
		}),

	syncOne: protectedProcedure
		.input(
			z.object({
				empCode: z.string().min(1).max(50),
				imageUrl: z.string().url(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const pool = await ctx.db.mis;
			const conn = await pool.getConnection();

			try {
				const result = await conn.execute(
					`UPDATE ${EMPLOYEE_PATH_TABLE} SET EMP_PIC_PATH = :1 WHERE EMPL_CODE = :2`,
					[input.imageUrl, input.empCode],
				);

				if ((result.rowsAffected ?? 0) === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `No Oracle record found for ${input.empCode}`,
					});
				}

				await conn.commit();

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
			const [rows] = await ctx.db.mes.execute<SyncAllRow[]>(
				`SELECT e.emp_code, ${PHOTO_URL_EXPR} AS image_url
			 FROM mes.employees e
			 INNER JOIN mes.resources r ON r.uid = e.id AND r.model = 'employee' AND r.attr = 'photo'
			 WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL
			 ORDER BY e.emp_id ASC`,
			);

			const employees = rows as SyncAllRow[];

			if (employees.length === 0) {
				return { total: 0, succeeded: 0, failed: 0, failures: [] };
			}

			const pool = await ctx.db.mis;
			const conn = await pool.getConnection();
			const failures: SyncPhotoFailure[] = [];
			let succeeded = 0;

			try {
				for (const emp of employees) {
					try {
						await conn.execute(
							`UPDATE ${EMPLOYEE_PATH_TABLE} SET EMP_PIC_PATH = :1 WHERE EMPL_CODE = :2`,
							[emp.image_url, emp.emp_code],
						);
						succeeded++;
					} catch (error) {
						failures.push({
							empCode: emp.emp_code,
							message: error instanceof Error ? error.message : "Unknown error",
						});
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
				total: employees.length,
				succeeded,
				failed: failures.length,
				failures,
			};
		},
	),
});
