import { TRPCError } from "@trpc/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";
import {
	getAzureUserDetails,
	getAzureAccessSummaries,
	type AzureUserDetails,
} from "@/lib/azure-graph";
import type { AzureAccessSummary } from "@/lib/azure-license-summary";
import {
	listPickableEmployees,
	type PickEmployee,
} from "@/lib/oracle-employees.server";

type Row = unknown[];

export type { PickEmployee };

export type EmployeeTargetResult = {
	status: "updated" | "skipped" | "failed";
	message?: string;
};

export type EmployeeUpdateResults = {
	oracle: EmployeeTargetResult;
	iss: EmployeeTargetResult;
};

export type EmployeeItem = {
	emplCode: string;
	name: string | null;
	staffType: "S" | "W";
	email: string | null;
	onPayroll: string | null;
	picPath: string | null;
	createdOn: string | null;
	leftDate: string | null;
};

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function normalizeOracleEmployee(row: Row): EmployeeItem {
	return {
		emplCode: String(row[0] ?? ""),
		name: toString(row[1]),
		staffType: (String(row[2] ?? "W") === "S" ? "S" : "W") as "S" | "W",
		email: toString(row[3]),
		onPayroll: toString(row[4]),
		picPath: toString(row[5]),
		createdOn: toString(row[6]),
		leftDate: toString(row[7]),
	};
}

export const employeesRouter = router({
	byCode: protectedProcedure
		.input(z.object({ code: z.string().min(1) }))
		.query(async ({ ctx, input }): Promise<EmployeeItem | null> => {
			const oraclePool = await ctx.db.mis;
			const oracleConn = await oraclePool.getConnection();
			try {
				const result = await oracleConn.execute(
					`SELECT tem.EMPL_CODE, tem.EMPL_PNAME, tem.EMPL_STAFF_WORKR,
					        tem.EMAIL_ID, tem.EMPL_ON_PAYROLL, tem.EMP_PIC_PATH,
					        tem.CREATED_ON, tem.LEFT_DATE
					 FROM T633_EMPL_MASTER tem
					 WHERE tem.EMPL_CODE = :1
					   AND tem.T627_DESGN_CODE != 'VISIT'
					   AND tem.EMPL_CODE NOT LIKE '%-0%'`,
					[input.code],
				);
				const rows = (result.rows ?? []) as Row[];
				if (rows.length === 0) {
					return null;
				}
				return normalizeOracleEmployee(rows[0]);
			} finally {
				await oracleConn.release();
			}
		}),

	azureStatus: protectedProcedure
		.input(z.object({ email: z.string().min(1) }))
		.query(async ({ input }): Promise<{ azure: AzureUserDetails | null }> => {
			const azure = await getAzureUserDetails(input.email);
			return { azure };
		}),

	azureBatch: protectedProcedure
		.input(
			z.object({
				emails: z.array(z.string().min(1)).min(1).max(100),
			}),
		)
		.query(async ({ input }): Promise<Record<string, AzureAccessSummary>> => {
			return getAzureAccessSummaries(input.emails);
		}),

	list: protectedProcedure.query(async ({ ctx }): Promise<EmployeeItem[]> => {
		const oraclePool = await ctx.db.mis;
		const oracleConn = await oraclePool.getConnection();
		try {
			const result = await oracleConn.execute(
				`SELECT tem.EMPL_CODE, tem.EMPL_PNAME, tem.EMPL_STAFF_WORKR,
				        tem.EMAIL_ID, tem.EMPL_ON_PAYROLL, tem.EMP_PIC_PATH,
				        tem.CREATED_ON, tem.LEFT_DATE
				 FROM T633_EMPL_MASTER tem
				 WHERE tem.T627_DESGN_CODE != 'VISIT'
				   AND tem.EMPL_CODE NOT LIKE '%-0%'
				 ORDER BY tem.EMPL_CODE ASC`,
			);
			return ((result.rows ?? []) as Row[]).map(normalizeOracleEmployee);
		} finally {
			await oracleConn.release();
		}
	}),

	/**
	 * Employee picker source for asset owners, provide parties and bookings:
	 * active Oracle employees only.
	 */
	pickList: protectedProcedure.query(
		async (): Promise<PickEmployee[]> => listPickableEmployees(),
	),

	/**
	 * Update an employee's email across databases:
	 * - Oracle T633_EMPL_MASTER (master record): EMAIL_ID.
	 * - ISS users (app account): email.
	 * Writes are best-effort; each database result is reported separately.
	 */
	update: protectedProcedure
		.input(
			z.object({
				code: z.string().min(1),
				email: z
					.string()
					.trim()
					.max(200)
					.refine(
						(v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
						"Enter a valid email address",
					),
			}),
		)
		.mutation(async ({ ctx, input }): Promise<EmployeeUpdateResults> => {
			if (ctx.user.type !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only admins can edit employees",
				});
			}

			const email = input.email === "" ? null : input.email;

			const failed = (message: string): EmployeeTargetResult => ({
				status: "failed",
				message,
			});
			const skipped = (message: string): EmployeeTargetResult => ({
				status: "skipped",
				message,
			});

			// Oracle master record.
			let oracleResult: EmployeeTargetResult;
			try {
				const oraclePool = await ctx.db.mis;
				const conn = await oraclePool.getConnection();
				try {
					const result = await conn.execute(
						`UPDATE T633_EMPL_MASTER
						 SET EMAIL_ID = :1
						 WHERE EMPL_CODE = :2`,
						[email, input.code],
						{ autoCommit: true },
					);
					if ((result.rowsAffected ?? 0) === 0) {
						oracleResult = failed("Employee not found in Oracle");
					} else {
						oracleResult = { status: "updated" };
					}
				} finally {
					await conn.release();
				}
			} catch (error) {
				oracleResult = failed(
					error instanceof Error ? error.message : "Oracle update failed",
				);
			}

			// ISS app account (email).
			let issResult: EmployeeTargetResult;
			if (email === null) {
				issResult = skipped("No email set");
			} else {
				const empCode = Number(input.code);
				if (!Number.isFinite(empCode) || empCode <= 0) {
					issResult = skipped("No ISS user link");
				} else {
					try {
						const [rows] = await ctx.db.iss.execute<RowDataPacket[]>(
							`SELECT id FROM users WHERE email = ? AND empCode != ? LIMIT 1`,
							[email, empCode],
						);
						if (rows.length > 0) {
							issResult = failed("Email already used by another ISS user");
						} else {
							const [result] = await ctx.db.iss.execute<ResultSetHeader>(
								`UPDATE users
								 SET email = ?
								 WHERE empCode = ?`,
								[email, empCode],
							);
							issResult =
								result.affectedRows === 0
									? skipped("No ISS user account")
									: { status: "updated" };
						}
					} catch (error) {
						issResult = failed(
							error instanceof Error ? error.message : "ISS update failed",
						);
					}
				}
			}

			return {
				oracle: oracleResult,
				iss: issResult,
			};
		}),
});
