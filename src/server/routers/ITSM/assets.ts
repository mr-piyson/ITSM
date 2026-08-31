import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

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
	empID: number | null;
	owner: string | null;
	empImg: string | null;
};

export type EmployeeItem = {
	empID: number;
	name: string;
	image: string | null;
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
	empID: z.number().int().optional(),
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
	empID: z.number().int().optional(),
});

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
		empID:
			row.empID === null || row.empID === undefined ? null : Number(row.empID),
		owner: toString(row.owner),
		empImg: toString(row.empImg),
	};
}

export const assetsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<AssetItem[]> => {
		const [rows] = await ctx.db.iss.execute<AssetRow[]>(`
			SELECT a.*, e.name as owner, e.image as empImg
			FROM assets a
			LEFT JOIN employees e ON e.empID = a.empID
			WHERE a.inActive = 0
			ORDER BY a.id DESC
		`);
		return rows.map(normalizeAsset);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<AssetDetail | null> => {
			const [assetQuery, logsQuery] = await Promise.all([
				ctx.db.iss.execute<AssetRow[]>(
					`
					SELECT a.*, e.name as owner, e.image as empImg
					FROM assets a
					LEFT JOIN employees e ON e.empID = a.empID
					WHERE a.id = ?
					LIMIT 1
				`,
					[input.id],
				),
				ctx.db.iss.execute<AssetRow[]>(
					`
					SELECT
						e1.name as old,
						e2.name as new,
						a.date,
						e2.image
					FROM assestOwnerUpdateLogs a
					LEFT JOIN employees e1 ON e1.empID = a.oldOwnerEmpID
					LEFT JOIN employees e2 ON e2.empID = a.newOwnerID
					WHERE a.assetID = ?
					ORDER BY a.date ASC
				`,
					[input.id],
				),
			]);

			const [assetRows] = assetQuery;
			const [logRows] = logsQuery;

			if (!assetRows[0]) {
				return null;
			}

			const logs: AssetNote[] = logRows.map((row) => ({
				old: String(row.old ?? ""),
				new: String(row.new ?? ""),
				date: (row.date as Date).toISOString(),
				image: String(row.image ?? ""),
			}));

			const latestLog = logs[logs.length - 1];
			const asset = normalizeAsset(assetRows[0]);

			return {
				...asset,
				owner: latestLog?.new || asset.owner,
				empImg: latestLog?.image || asset.empImg,
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

			if (data.empID !== undefined) {
				const [oldRows] = await ctx.db.iss.execute<AssetRow[]>(
					`SELECT a.empID, e.name as ownerName
					 FROM assets a
					 LEFT JOIN employees e ON e.empID = a.empID
					 WHERE a.id = ?
					 LIMIT 1`,
					[id],
				);
				const oldEmpID = oldRows[0] ? Number(oldRows[0].empID ?? 0) : 0;
				const newEmpID = Number(data.empID ?? 0);
				if (newEmpID !== oldEmpID) {
					await ctx.db.iss.execute(
						`INSERT INTO assestOwnerUpdateLogs
						 (user, oldOwnerEmpID, oldOwnerText, newOwnerID, date, assetID)
						 VALUES (?, ?, ?, ?, NOW(), ?)`,
						[
							ctx.user.id,
							oldEmpID,
							oldRows[0]?.ownerName ? String(oldRows[0].ownerName) : null,
							newEmpID,
							id,
						],
					);
				}
			}

			const entries = Object.entries(data).filter(
				([, value]) => value !== undefined,
			);

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
				  processor, os, memory, hdd, ip, empID, specification, inActive,
				  department, firmwareVer, image)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
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
					input.empID ?? 0,
					input.specification ?? null,
					input.department ?? null,
					input.firmwareVer ?? null,
					input.image ?? null,
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

	employees: protectedProcedure.query(
		async ({ ctx }): Promise<EmployeeItem[]> => {
			const [rows] = await ctx.db.iss.execute<AssetRow[]>(
				`SELECT empID, name, image FROM employees WHERE inActive = 0 ORDER BY name ASC`,
			);
			return rows.map((row) => ({
				empID: Number(row.empID),
				name: String(row.name ?? ""),
				image: toString(row.image),
			}));
		},
	),

	uploadImage: protectedProcedure
		.input(z.object({ dataUrl: z.string().min(1) }))
		.mutation(async ({ input }): Promise<{ image: string }> => {
			const match =
				/^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,(.+)$/i.exec(
					input.dataUrl,
				);
			if (!match) {
				throw new Error("Invalid image data");
			}

			const [, mimeType, base64] = match;
			const extension = mimeType.toLowerCase() === "jpeg" ? "jpg" : mimeType;
			const buffer = Buffer.from(base64, "base64");

			if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
				throw new Error("Image must be between 1 byte and 5 MB");
			}

			const fileName = `asset-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
			const dir = path.join(process.cwd(), "ISS", "itemsImages");
			await mkdir(dir, { recursive: true });
			await writeFile(path.join(dir, fileName), buffer);

			return { image: fileName };
		}),
});
