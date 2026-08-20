import type { Pool } from "mysql2/promise";

import db from "@/lib/database";
import { publicProcedure, router } from "@/server/trpc";

type DbCheckResult = { ok: boolean; latency: number; error?: string };

async function checkMysql(pool: Pool): Promise<DbCheckResult> {
	const start = Date.now();
	try {
		await pool.execute("SELECT 1");
		return { ok: true, latency: Date.now() - start };
	} catch (e) {
		return {
			ok: false,
			latency: Date.now() - start,
			error: e instanceof Error ? e.message : String(e),
		};
	}
}

async function checkMssql(): Promise<DbCheckResult> {
	const start = Date.now();
	try {
		const pool = await db.erp;
		await pool.request().query("SELECT 1");
		return { ok: true, latency: Date.now() - start };
	} catch (e) {
		return {
			ok: false,
			latency: Date.now() - start,
			error: e instanceof Error ? e.message : String(e),
		};
	}
}

export const healthRouter = router({
	ping: publicProcedure.query(() => ({ message: "pong", ts: Date.now() })),

	dbStatus: publicProcedure.query(async () => {
		const [mes, iss, erp] = await Promise.all([
			checkMysql(db.mes),
			checkMysql(db.iss),
			checkMssql(),
		]);

		return { mes, iss, erp };
	}),
});
