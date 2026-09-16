import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";
import { getAzureUserDetails, type AzureUserDetails } from "@/lib/azure-graph";

type Row = unknown[];

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
});
