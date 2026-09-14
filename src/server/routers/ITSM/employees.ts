import { protectedProcedure, router } from "@/server/trpc";

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
