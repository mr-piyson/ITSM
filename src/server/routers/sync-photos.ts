import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

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

const PHOTO_URL_EXPR = `CONCAT('http://intranet.bfginternational.com:88/storage/employee/', MD5(e.id), '/', r.filename, '.jpg')`;

export const syncPhotosRouter = router({
	list: protectedProcedure
		.input(z.object({ q: z.string().default("") }))
		.query(async ({ ctx, input }): Promise<SyncPhotoEmployee[]> => {
			const search = input.q.trim();

			let whereClause = "WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL";
			const params: string[] = [];

			if (search) {
				whereClause +=
					" AND (e.emp_id LIKE ? OR e.emp_code LIKE ? OR e.name LIKE ?)";
				params.push(`%${search}%`, `%${search}%`, `%${search}%`);
			}

			const [rows] = await ctx.db.mes.execute<Row[]>(
				`SELECT e.id, e.emp_id, e.emp_code, e.name, e.department,
					r.filename, ${PHOTO_URL_EXPR} AS image_url
				 FROM mes.employees e
				 LEFT JOIN mes.resources r ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'
				 ${whereClause}
				 ORDER BY e.emp_id ASC`,
				params,
			);

			const employees = rows as {
				id: number;
				emp_id: number;
				emp_code: string;
				name: string;
				department: string;
				filename: string | null;
				image_url: string | null;
			}[];

			// Fetch Oracle EMP_PIC_PATH for these employees
			const oracleMap: Record<string, string | null> = {};

			if (employees.length > 0) {
				try {
					const pool = await ctx.db.mis;
					const conn = await pool.getConnection();
					try {
						const empCodes = employees.map((e) => e.emp_code);
						const BATCH_SIZE = 1000;
						for (let i = 0; i < empCodes.length; i += BATCH_SIZE) {
							const batch = empCodes.slice(i, i + BATCH_SIZE);
							const placeholders = batch.map((_, j) => `:${j + 1}`).join(",");
							const result = await conn.execute(
								`SELECT EMPL_CODE, EMP_PIC_PATH FROM T633_EMPL_MASTER WHERE EMPL_CODE IN (${placeholders})`,
								batch,
							);
							for (const row of result.rows as [string, string | null][]) {
								oracleMap[row[0]] = row[1] || null;
							}
						}
					} finally {
						conn.release();
					}
				} catch (e) {
					console.error("Oracle read error:", e);
				}
			}

			return employees.map((emp) => {
				const empCode = emp.emp_code;
				const imageUrl = emp.image_url || "";
				const oraclePath = oracleMap[empCode] || null;

				let syncStatus: SyncPhotoEmployee["syncStatus"] = "no_photo";
				if (imageUrl && oraclePath === imageUrl) syncStatus = "synced";
				else if (imageUrl && oraclePath) syncStatus = "different";
				else if (imageUrl) syncStatus = "not_in_oracle";

				return {
					id: emp.id,
					empId: emp.emp_id,
					empCode,
					name: emp.name,
					department: emp.department,
					imageUrl,
					oraclePicPath: oraclePath,
					syncStatus,
				};
			});
		}),

	syncOne: protectedProcedure
		.input(
			z.object({
				empCode: z.string(),
				imageUrl: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const pool = await ctx.db.mis;
				const conn = await pool.getConnection();
				let rowsAffected = 0;
				try {
					const result = await conn.execute(
						`UPDATE T633_EMPL_MASTER SET EMP_PIC_PATH = :1 WHERE EMPL_CODE = :2`,
						[input.imageUrl, input.empCode],
					);
					rowsAffected = result.rowsAffected ?? 0;
				} finally {
					conn.release();
				}

				if (rowsAffected === 0) {
					return {
						success: false,
						message: `No Oracle record found for ${input.empCode}`,
					};
				}

				return {
					success: true,
					message: `Photo synced for ${input.empCode}`,
					empCode: input.empCode,
					imageUrl: input.imageUrl,
				};
			} catch (e: unknown) {
				const message = e instanceof Error ? e.message : "Oracle update failed";
				console.error("Oracle update error:", e);
				return { success: false, message };
			}
		}),

	syncAll: protectedProcedure.mutation(async ({ ctx }) => {
		const [rows] = await ctx.db.mes.execute<Row[]>(
			`SELECT e.id, e.emp_id,
				${PHOTO_URL_EXPR} AS image_url
			 FROM mes.employees e
			 INNER JOIN mes.resources r ON r.uid = e.id AND r.model = 'employee' AND r.attr = 'photo'
			 WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL
			 ORDER BY e.emp_id ASC`,
		);

		const employees = rows as {
			id: number;
			emp_id: number;
			image_url: string;
		}[];

		if (employees.length === 0) {
			return { success: true, total: 0, successCount: 0, failCount: 0 };
		}

		const pool = await ctx.db.mis;
		const conn = await pool.getConnection();
		let successCount = 0;
		let failCount = 0;

		try {
			for (const emp of employees) {
				const empCode = String(emp.emp_id).padStart(4, "0");

				try {
					await conn.execute(
						`UPDATE T633_EMPL_MASTER SET EMP_PIC_PATH = :1 WHERE EMPL_CODE = :2`,
						[emp.image_url, empCode],
					);
					successCount++;
				} catch {
					failCount++;
				}
			}
		} finally {
			conn.release();
		}

		return {
			success: true,
			total: employees.length,
			successCount,
			failCount,
		};
	}),
});
