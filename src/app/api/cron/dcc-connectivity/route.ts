import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

import { checkCronSecret } from "@/lib/cron";
import { runPing } from "@/lib/dcc-connectivity";
import db from "@/lib/database";

export const dynamic = "force-dynamic";

type Row = RowDataPacket & Record<string, unknown>;

function toTimestamp(value: unknown): number | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.getTime();
	}
	if (typeof value === "string") {
		const iso = value.replace(" ", "T");
		const parsed = new Date(iso);
		return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
	}
	return null;
}

/**
 * Cron job: checks the connectivity of every active DCC (Raspberry Pi + its
 * card reader) at its configured interval, and stores a connectivity log row
 * tracking both devices per check.
 *
 * The external scheduler (systemd timer / crontab / Vercel cron) should hit
 * GET /api/cron/dcc-connectivity on a frequent cadence (e.g. every minute).
 * Each device is only actually checked once its check_interval_seconds has
 * elapsed since the last check.
 */
export async function GET(request: Request) {
	const unauthorized = checkCronSecret(request);
	if (unauthorized) {
		return unauthorized;
	}

	const [rows] = await db.iss.execute<Row[]>(
		`SELECT id, ip_address, card_reader_ip, check_interval_seconds, last_checked_at
		 FROM dccs
		 WHERE inActive = 0`,
	);

	if (rows.length === 0) {
		return NextResponse.json({ ok: true, checked: 0, skipped: 0 });
	}

	const now = Date.now();

	const rawRows = rows as {
		id: number;
		ip_address: string | null;
		card_reader_ip: string | null;
		check_interval_seconds: number;
		last_checked_at: unknown;
	}[];

	const due = rawRows.filter((row) => {
		const last = toTimestamp(row.last_checked_at);
		if (last === null) {
			return true;
		}
		const intervalMs = Number(row.check_interval_seconds || 300) * 1000;
		return now - last >= intervalMs;
	});

	const results = await Promise.all(
		due.map(async (row) => {
			const [piPing, readerPing] = await Promise.all([
				row.ip_address
					? runPing(row.ip_address)
					: { reachable: false, latencyMs: null },
				row.card_reader_ip
					? runPing(row.card_reader_ip)
					: { reachable: false, latencyMs: null },
			]);

			const status: "connected" | "disconnected" =
				piPing.reachable && readerPing.reachable ? "connected" : "disconnected";

			await db.iss.execute<ResultSetHeader>(
				`INSERT INTO dcc_connectivity_logs
				 (dcc_id, status, dcc_reachable, dcc_ping_latency_ms,
				  reader_reachable, reader_ping_latency_ms, \`user\`)
				 VALUES (?, ?, ?, ?, ?, ?, 0)`,
				[
					row.id,
					status,
					piPing.reachable ? 1 : 0,
					piPing.latencyMs,
					readerPing.reachable ? 1 : 0,
					readerPing.latencyMs,
				],
			);

			await db.iss.execute(
				`UPDATE dccs SET last_checked_at = NOW(), last_status = ? WHERE id = ?`,
				[status, row.id],
			);

			return {
				id: row.id,
				status,
				dccReachable: piPing.reachable,
				readerReachable: readerPing.reachable,
			};
		}),
	);

	return NextResponse.json({
		ok: true,
		total: rawRows.length,
		checked: results.length,
		skipped: rawRows.length - results.length,
		results,
	});
}
