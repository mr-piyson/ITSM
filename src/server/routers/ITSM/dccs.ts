import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type DccItem = {
	id: number;
	name: string;
	ipAddress: string | null;
	cardReaderId: number | null;
	dccCode: string | null;
	cardReaderIp: string | null;
	screenInch: string | null;
	toggles: boolean;
	scanner: boolean;
	cardReader: boolean;
	paperPrinter: boolean;
	rfidLabelPrinter: boolean;
	lightTower: boolean;
	checkIntervalSeconds: number;
	lastCheckedAt: string | null;
	lastStatus: "connected" | "disconnected" | null;
};

export type DccLogItem = {
	id: number;
	status: string;
	dccReachable: boolean;
	dccPingLatencyMs: number | null;
	readerReachable: boolean;
	readerPingLatencyMs: number | null;
	checkedAt: string | null;
	user: number | null;
};

export type DccDetail = DccItem & {
	logs: DccLogItem[];
};

export type DccDashboard = {
	total: number;
	connected: number;
	disconnected: number;
	unchecked: number;
	avgLatencyMs: number | null;
};

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => (value === "" ? null : value))
		.nullable();

const booleanField = z.boolean();

const createSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(100),
	ipAddress: optionalText(50),
	cardReaderId: z.coerce.number().int().positive().nullable(),
	dccCode: optionalText(20),
	cardReaderIp: optionalText(50),
	screenInch: optionalText(20),
	toggles: booleanField,
	scanner: booleanField,
	cardReader: booleanField,
	paperPrinter: booleanField,
	rfidLabelPrinter: booleanField,
	lightTower: booleanField,
	checkIntervalSeconds: z.coerce.number().int().min(30).max(86400),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: createSchema,
});

function toStringValue(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toNullableNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	const num = Number(value);
	return Number.isNaN(num) ? null : num;
}

function toDateTimeString(value: unknown): string | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString();
	}
	if (typeof value === "string") {
		return value.replace(" ", "T");
	}
	return null;
}

function toBool(value: unknown): boolean {
	return value === 1 || value === true || value === "1";
}

function toDcc(row: Row): DccItem {
	return {
		id: Number(row.id),
		name: String(row.name ?? ""),
		ipAddress: toStringValue(row.ip_address),
		cardReaderId: toNullableNumber(row.card_reader_id),
		dccCode: toStringValue(row.dcc_code),
		cardReaderIp: toStringValue(row.card_reader_ip),
		screenInch: toStringValue(row.screen_inch),
		toggles: toBool(row.toggles),
		scanner: toBool(row.scanner),
		cardReader: toBool(row.card_reader),
		paperPrinter: toBool(row.paper_printer),
		rfidLabelPrinter: toBool(row.rfid_label_printer),
		lightTower: toBool(row.light_tower),
		checkIntervalSeconds: Number(row.check_interval_seconds ?? 300),
		lastCheckedAt: toDateTimeString(row.last_checked_at),
		lastStatus:
			row.last_status === "connected" || row.last_status === "disconnected"
				? row.last_status
				: null,
	};
}

function toDccLog(row: Row): DccLogItem {
	return {
		id: Number(row.id),
		status: String(row.status ?? ""),
		dccReachable: toBool(row.dcc_reachable),
		dccPingLatencyMs: toNullableNumber(row.dcc_ping_latency_ms),
		readerReachable: toBool(row.reader_reachable),
		readerPingLatencyMs: toNullableNumber(row.reader_ping_latency_ms),
		checkedAt: toDateTimeString(row.checked_at),
		user: toNullableNumber(row.user),
	};
}

const DCC_SELECT = `id, name, ip_address, card_reader_id, dcc_code, card_reader_ip,
	screen_inch, toggles, scanner, card_reader, paper_printer, rfid_label_printer,
	light_tower, check_interval_seconds, last_checked_at, last_status`;

export const dccsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<DccItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT ${DCC_SELECT}
			 FROM dccs
			 WHERE inActive = 0
			 ORDER BY dcc_code ASC`,
		);
		return rows.map(toDcc);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<DccDetail | null> => {
			const [[dccRows], [logRows]] = await Promise.all([
				ctx.db.iss.execute<Row[]>(
					`SELECT ${DCC_SELECT}
					 FROM dccs
					 WHERE id = ?
					 LIMIT 1`,
					[input.id],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT id, status, dcc_reachable, dcc_ping_latency_ms,
					        reader_reachable, reader_ping_latency_ms, checked_at, \`user\`
					 FROM dcc_connectivity_logs
					 WHERE dcc_id = ?
					 ORDER BY checked_at DESC, id DESC
					 LIMIT 100`,
					[input.id],
				),
			]);

			if (!dccRows[0]) {
				return null;
			}

			return {
				...toDcc(dccRows[0]),
				logs: logRows.map(toDccLog),
			};
		}),

	logs: protectedProcedure
		.input(
			z.object({
				dccId: z.coerce.number().int().positive(),
				limit: z.coerce.number().int().min(1).max(500).default(200),
			}),
		)
		.query(async ({ ctx, input }): Promise<DccLogItem[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT id, status, dcc_reachable, dcc_ping_latency_ms,
				        reader_reachable, reader_ping_latency_ms, checked_at, \`user\`
				 FROM dcc_connectivity_logs
				 WHERE dcc_id = ?
				 ORDER BY checked_at DESC, id DESC
				 LIMIT ?`,
				[input.dccId, input.limit],
			);
			return rows.map(toDccLog);
		}),

	dashboard: protectedProcedure.query(
		async ({ ctx }): Promise<DccDashboard> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT
					COUNT(*) AS total,
					SUM(CASE WHEN last_status = 'connected' THEN 1 ELSE 0 END) AS connected,
					SUM(CASE WHEN last_status = 'disconnected' THEN 1 ELSE 0 END) AS disconnected,
					SUM(CASE WHEN last_status IS NULL THEN 1 ELSE 0 END) AS unchecked
				 FROM dccs
				 WHERE inActive = 0`,
			);
			const row = rows[0];
			const [latencyRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT AVG(latency_ms) AS avgLatency
				 FROM (
					SELECT dcc_ping_latency_ms AS latency_ms
					FROM dcc_connectivity_logs
					WHERE dcc_ping_latency_ms IS NOT NULL
					  AND checked_at >= NOW() - INTERVAL 1 DAY
					UNION ALL
					SELECT reader_ping_latency_ms AS latency_ms
					FROM dcc_connectivity_logs
					WHERE reader_ping_latency_ms IS NOT NULL
					  AND checked_at >= NOW() - INTERVAL 1 DAY
				 ) t`,
			);
			return {
				total: Number(row?.total ?? 0),
				connected: Number(row?.connected ?? 0),
				disconnected: Number(row?.disconnected ?? 0),
				unchecked: Number(row?.unchecked ?? 0),
				avgLatencyMs: toNullableNumber(latencyRows[0]?.avgLatency),
			};
		},
	),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO dccs
				 (name, ip_address, card_reader_id, dcc_code, card_reader_ip, screen_inch,
				  toggles, scanner, card_reader, paper_printer, rfid_label_printer, light_tower,
				  check_interval_seconds, inActive, \`user\`)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
				[
					input.name,
					input.ipAddress ?? "",
					input.cardReaderId,
					input.dccCode ?? "",
					input.cardReaderIp ?? "",
					input.screenInch ?? "",
					input.toggles ? 1 : 0,
					input.scanner ? 1 : 0,
					input.cardReader ? 1 : 0,
					input.paperPrinter ? 1 : 0,
					input.rfidLabelPrinter ? 1 : 0,
					input.lightTower ? 1 : 0,
					input.checkIntervalSeconds,
					ctx.user.id,
				],
			);
			const id = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'dccs', ?)`,
				[ctx.user.id, id],
			);

			return { success: true, id };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE dccs
				 SET name = ?, ip_address = ?, card_reader_id = ?, dcc_code = ?,
				     card_reader_ip = ?, screen_inch = ?, toggles = ?, scanner = ?,
				     card_reader = ?, paper_printer = ?, rfid_label_printer = ?,
				     light_tower = ?, check_interval_seconds = ?
				 WHERE id = ?`,
				[
					data.name,
					data.ipAddress ?? "",
					data.cardReaderId,
					data.dccCode ?? "",
					data.cardReaderIp ?? "",
					data.screenInch ?? "",
					data.toggles ? 1 : 0,
					data.scanner ? 1 : 0,
					data.cardReader ? 1 : 0,
					data.paperPrinter ? 1 : 0,
					data.rfidLabelPrinter ? 1 : 0,
					data.lightTower ? 1 : 0,
					data.checkIntervalSeconds,
					id,
				],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'dccs', ?)`,
					[ctx.user.id, id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE dccs SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'dccs', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	checkConnectivity: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(
			async ({ ctx, input }): Promise<{ success: boolean; status: string }> => {
				const [rows] = await ctx.db.iss.execute<Row[]>(
					`SELECT ip_address, card_reader_ip
					 FROM dccs
					 WHERE id = ? AND inActive = 0
					 LIMIT 1`,
					[input.id],
				);
				const row = rows[0];
				if (!row) {
					return { success: false, status: "not found" };
				}

				const { runPing } = await import("@/lib/dcc-connectivity");
				const [piPing, readerPing] = await Promise.all([
					row.ip_address
						? runPing(String(row.ip_address))
						: { reachable: false, latencyMs: null },
					row.card_reader_ip
						? runPing(String(row.card_reader_ip))
						: { reachable: false, latencyMs: null },
				]);

				const status: "connected" | "disconnected" =
					piPing.reachable && readerPing.reachable
						? "connected"
						: "disconnected";

				await ctx.db.iss.execute(
					`INSERT INTO dcc_connectivity_logs
					 (dcc_id, status, dcc_reachable, dcc_ping_latency_ms,
					  reader_reachable, reader_ping_latency_ms, \`user\`)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						input.id,
						status,
						piPing.reachable ? 1 : 0,
						piPing.latencyMs,
						readerPing.reachable ? 1 : 0,
						readerPing.latencyMs,
						ctx.user.id,
					],
				);

				await ctx.db.iss.execute(
					`UPDATE dccs SET last_checked_at = NOW(), last_status = ? WHERE id = ?`,
					[status, input.id],
				);

				return { success: true, status };
			},
		),

	ping: protectedProcedure
		.input(
			z.object({
				targets: z
					.array(
						z.object({
							id: z.string().trim().min(1).max(64),
							host: z.string().trim().min(1).max(255),
						}),
					)
					.min(1)
					.max(200),
			}),
		)
		.mutation(
			async ({
				input,
			}): Promise<
				{ id: string; reachable: boolean; latencyMs: number | null }[]
			> => {
				const { runPing } = await import("@/lib/dcc-connectivity");
				return Promise.all(
					input.targets.map(async (target) => {
						try {
							const result = await runPing(target.host);
							return { id: target.id, ...result };
						} catch {
							return { id: target.id, reachable: false, latencyMs: null };
						}
					}),
				);
			},
		),
});
