import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";
import { getEmployeesByCodes } from "@/lib/oracle-employees.server";

type AssetRow = RowDataPacket & Record<string, unknown>;

export type Asset = AssetRow & { id: number };

export type AssetItem = {
	id: number;
	code: string;
	serialNumber: string;
	deviceName: string | null;
	type: string | null;
	location: string | null;
	manufacturer: string | null;
	model: string | null;
	department: string | null;
	processor: string | null;
	os: string | null;
	memory: string | null;
	hdd: string | null;
	ip: string | null;
	firmwareVer: string | null;
	macAddress: string | null;
	deviceStatus: string | null;
	specification: string | null;
	image: string | null;
	verified: string | null;
	purchaseDate: string | null;
	purchasePrice: string | null;
	warrantyDate: string | null;
	warrantyStatus: string | null;
	inActive: boolean;
	emplCode: string | null;
	owner: string | null;
	empImg: string | null;
};

export type AssetNote = {
	old: string;
	new: string;
	date: string;
	image: string;
};

export type AssetDetail = AssetItem & {
	ownerChangeLogs: AssetNote[];
};

const updateFieldsSchema = z.object({
	code: z.string().nullable().optional(),
	type: z.string().nullable().optional(),
	deviceStatus: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	department: z.string().nullable().optional(),
	purchaseDate: z.string().nullable().optional(),
	purchasePrice: z.string().nullable().optional(),
	deviceName: z.string().nullable().optional(),
	serialNumber: z.string().nullable().optional(),
	manufacturer: z.string().nullable().optional(),
	model: z.string().nullable().optional(),
	macAddress: z.string().nullable().optional(),
	ip: z.string().nullable().optional(),
	firmwareVer: z.string().nullable().optional(),
	warrantyDate: z.string().nullable().optional(),
	warrantyStatus: z.string().nullable().optional(),
	processor: z.string().nullable().optional(),
	os: z.string().nullable().optional(),
	memory: z.string().nullable().optional(),
	hdd: z.string().nullable().optional(),
	specification: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	emplCode: z.string().trim().max(20).nullable().optional(),
});

const createAssetSchema = z.object({
	code: z.string().min(1).max(10),
	serialNumber: z.string().min(1).max(50),
	type: z.string().min(1).max(50),
	location: z.string().max(50).nullable().optional(),
	department: z.string().max(100).nullable().optional(),
	deviceName: z.string().max(50).nullable().optional(),
	manufacturer: z.string().max(50).nullable().optional(),
	model: z.string().max(50).nullable().optional(),
	processor: z.string().max(50).nullable().optional(),
	os: z.string().max(50).nullable().optional(),
	memory: z.string().max(50).nullable().optional(),
	hdd: z.string().max(50).nullable().optional(),
	ip: z.string().max(50).nullable().optional(),
	firmwareVer: z.string().max(50).nullable().optional(),
	specification: z.string().nullable().optional(),
	image: z.string().max(200).nullable().optional(),
	emplCode: z.string().trim().max(20).nullable().optional(),
});

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

const execFileAsync = promisify(execFile);

type PingResult = {
	reachable: boolean;
	latencyMs: number | null;
};

async function runPing(host: string): Promise<PingResult> {
	const isWindows = process.platform === "win32";
	const args = isWindows
		? ["-n", "1", "-w", "2000", host]
		: ["-c", "1", "-W", "2", host];

	try {
		const { stdout } = await execFileAsync("ping", args, {
			timeout: 5000,
			windowsHide: true,
		});
		const match = /time[=<>]+\s*([\d.]+)/.exec(stdout);
		return {
			reachable: true,
			latencyMs: match ? Number(match[1]) : null,
		};
	} catch {
		return { reachable: false, latencyMs: null };
	}
}

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function normalizeAsset(row: AssetRow): AssetItem {
	return {
		id: Number(row.id),
		code: String(row.code ?? ""),
		serialNumber: String(row.serialNumber ?? ""),
		deviceName: toString(row.deviceName),
		type: toString(row.type),
		location: toString(row.location),
		manufacturer: toString(row.manufacturer),
		model: toString(row.model),
		department: toString(row.department),
		processor: toString(row.processor),
		os: toString(row.os),
		memory: toString(row.memory),
		hdd: toString(row.hdd),
		ip: toString(row.ip),
		firmwareVer: toString(row.firmwareVer),
		macAddress: toString(row.macAddress),
		deviceStatus: toString(row.deviceStatus),
		specification: toString(row.specification),
		image: toString(row.image),
		verified:
			row.verified && String(row.verified) !== "0000-00-00 00:00:00"
				? String(row.verified)
				: null,
		purchaseDate: toString(row.purchaseDate),
		purchasePrice: toString(row.purchasePrice),
		warrantyDate: toString(row.warrantyDate),
		warrantyStatus: toString(row.warrantyStatus),
		inActive: Boolean(row.inActive),
		emplCode: toString(row.emplCode),
		owner: toString(row.owner),
		empImg: toString(row.empImg),
	};
}

async function hydrateAssetOwners(items: AssetItem[]): Promise<AssetItem[]> {
	const employees = await getEmployeesByCodes(
		items.map((item) => item.emplCode),
	);
	return items.map((item) => {
		const employee = employees.get((item.emplCode ?? "").trim());
		return {
			...item,
			owner: employee?.name ?? null,
			empImg: employee?.image ?? null,
		};
	});
}

export const assetsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<AssetItem[]> => {
		const [rows] = await ctx.db.iss.execute<AssetRow[]>(`
			SELECT a.*
			FROM assets a
			WHERE a.inActive = 0
			ORDER BY a.id DESC
		`);
		return hydrateAssetOwners(rows.map(normalizeAsset));
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<AssetDetail | null> => {
			const [assetQuery, logsQuery] = await Promise.all([
				ctx.db.iss.execute<AssetRow[]>(
					`
					SELECT a.*
					FROM assets a
					WHERE a.id = ?
					LIMIT 1
				`,
					[input.id],
				),
				ctx.db.iss.execute<AssetRow[]>(
					`
					SELECT
						oldOwnerEmplCode,
						newOwnerEmplCode,
						date
					FROM assestOwnerUpdateLogs
					WHERE assetID = ?
					ORDER BY date ASC
				`,
					[input.id],
				),
			]);

			const [assetRows] = assetQuery;
			const [logRows] = logsQuery;

			if (!assetRows[0]) {
				return null;
			}

			const employees = await getEmployeesByCodes([
				assetRows[0].emplCode,
				...logRows.flatMap((row) => [
					row.oldOwnerEmplCode,
					row.newOwnerEmplCode,
				]),
			]);
			const nameOf = (code: unknown): string =>
				employees.get(String(code ?? "").trim())?.name ?? "";
			const imageOf = (code: unknown): string =>
				employees.get(String(code ?? "").trim())?.image ?? "";

			const logs: AssetNote[] = logRows.map((row) => ({
				old: nameOf(row.oldOwnerEmplCode),
				new: nameOf(row.newOwnerEmplCode),
				date: (row.date as Date).toISOString(),
				image: imageOf(row.newOwnerEmplCode),
			}));

			const asset = normalizeAsset(assetRows[0]);
			const owner = employees.get((asset.emplCode ?? "").trim());

			return {
				...asset,
				owner: owner?.name ?? null,
				empImg: owner?.image ?? null,
				ownerChangeLogs: logs,
			};
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				data: updateFieldsSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			let deviceStatusSync: string | null | undefined;

			if (data.emplCode !== undefined) {
				const [oldRows] = await ctx.db.iss.execute<AssetRow[]>(
					`SELECT emplCode, deviceStatus FROM assets WHERE id = ? LIMIT 1`,
					[id],
				);
				const oldEmplCode = oldRows[0] ? toString(oldRows[0].emplCode) : null;
				const newEmplCode = data.emplCode ?? null;
				if (newEmplCode !== oldEmplCode) {
					const previous = await getEmployeesByCodes([oldEmplCode]);
					await ctx.db.iss.execute(
						`INSERT INTO assestOwnerUpdateLogs
						 (user, oldOwnerEmplCode, oldOwnerText, newOwnerEmplCode, date, assetID)
						 VALUES (?, ?, ?, ?, NOW(), ?)`,
						[
							ctx.user.id,
							oldEmplCode,
							previous.get((oldEmplCode ?? "").trim())?.name ?? null,
							newEmplCode,
							id,
						],
					);
				}
				// Keep deviceStatus in sync with ownership: an asset without an
				// owner sits in the IT pool (Available), an assigned one is In Use.
				if (data.deviceStatus === undefined) {
					const currentStatus = oldRows[0]
						? toString(oldRows[0].deviceStatus)
						: null;
					if (!newEmplCode) {
						if (!currentStatus || currentStatus === "In Use") {
							deviceStatusSync = "Available";
						}
					} else if (!currentStatus || currentStatus === "Available") {
						deviceStatusSync = "In Use";
					}
				}
			}

			const entries = Object.entries(data).filter(
				([, value]) => value !== undefined,
			);
			if (deviceStatusSync !== undefined) {
				entries.push(["deviceStatus", deviceStatusSync]);
			}

			if (entries.length === 0) {
				return { success: true, affectedRows: 0 };
			}

			const columns = entries.map(([column]) => column);
			const values = entries.map(([, value]) => value);
			const setClause = columns.map((column) => `${column} = ?`).join(", ");

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE assets SET ${setClause} WHERE id = ?`,
				[...values, id],
			);

			return { success: true, affectedRows: result.affectedRows };
		}),

	create: protectedProcedure
		.input(createAssetSchema)
		.mutation(async ({ ctx, input }) => {
			const { db } = ctx;

			const [dupCode] = await db.iss.execute<AssetRow[]>(
				`SELECT id FROM assets WHERE code = ? LIMIT 1`,
				[input.code],
			);
			if (dupCode.length > 0) {
				throw new Error(`Asset code "${input.code}" already exists`);
			}

			const [dupSerial] = await db.iss.execute<AssetRow[]>(
				`SELECT id FROM assets WHERE serialNumber = ? LIMIT 1`,
				[input.serialNumber],
			);
			if (dupSerial.length > 0) {
				throw new Error(
					`Asset with serial number "${input.serialNumber}" already exists`,
				);
			}

			const [result] = await db.iss.execute<ResultSetHeader>(
				`INSERT INTO assets
				 (code, serialNumber, deviceName, type, location, manufacturer, model,
				  processor, os, memory, hdd, ip, emplCode, specification, inActive,
				  department, firmwareVer, image, deviceStatus)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
				[
					input.code,
					input.serialNumber,
					input.deviceName ?? null,
					input.type,
					input.location ?? null,
					input.manufacturer ?? null,
					input.model ?? null,
					input.processor ?? null,
					input.os ?? null,
					input.memory ?? null,
					input.hdd ?? null,
					input.ip ?? null,
					input.emplCode ?? null,
					input.specification ?? null,
					input.department ?? null,
					input.firmwareVer ?? null,
					input.image ?? null,
					input.emplCode ? "In Use" : "Available",
				],
			);

			const assetID = result.insertId;

			await db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'assets', ?)`,
				[ctx.user.id, assetID],
			);

			return { success: true, id: assetID };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE assets SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'assets', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	generateCode: protectedProcedure.mutation(
		async ({ ctx }): Promise<{ code: string }> => {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			for (let attempt = 0; attempt < 100; attempt++) {
				let code = "";
				for (let i = 0; i < 10; i++) {
					code += chars[Math.floor(Math.random() * chars.length)];
				}
				const [rows] = await ctx.db.iss.execute<AssetRow[]>(
					`SELECT id FROM assets WHERE code = ? LIMIT 1`,
					[code],
				);
				if (rows.length === 0) {
					return { code };
				}
			}
			throw new Error("Unable to generate a unique asset code, try again");
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
					.max(100),
			}),
		)
		.mutation(
			async ({
				input,
			}): Promise<
				{ id: string; reachable: boolean; latencyMs: number | null }[]
			> => {
				return Promise.all(
					input.targets.map(async (target) => {
						if (!IPV4_REGEX.test(target.host)) {
							return { id: target.id, reachable: false, latencyMs: null };
						}
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
