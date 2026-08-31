import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { PRINTER_ACTION_TYPES } from "@/lib/printer-constants";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type PrinterItem = {
	id: number;
	name: string;
	location: string;
	usedBy: string;
	department: string | null;
	printerLink: string | null;
	empID: number | null;
	img: string | null;
};

export type PrinterInfoItem = {
	manufacturer: string | null;
	model: string | null;
	serialNumber: string | null;
	firmware: string | null;
	RFID: boolean | null;
	darkness: string | null;
	printSpeed: number | null;
	tearOffAdjust: number | null;
	printMode: string | null;
	mediaType: string | null;
	sensorSelect: string | null;
	printMethod: string | null;
	printWidth: number | null;
	labelLength: number | null;
	labelTop: number | null;
	leftPosition: number | null;
};

export type PrinterActionItem = {
	id: number;
	actionType: string;
	actionDate: string;
	actionBy: string;
	note: string;
	itemID: number;
	itemName: string | null;
	requestedBy: string;
	recievedBy: string;
};

export type LinkedTonerItem = {
	id: number;
	name: string;
	brand: string;
	stock: number;
	img: string | null;
};

export type PrinterDetail = PrinterItem & {
	info: PrinterInfoItem | null;
	actions: PrinterActionItem[];
	linkedToners: LinkedTonerItem[];
};

const createSchema = z.object({
	name: z.string().trim().min(1, "Printer name is required").max(100),
	location: z.string().trim().min(1, "Location is required").max(100),
	usedBy: z.string().trim().min(1, "Used By is required").max(100),
	department: z.string().trim().max(100).optional().nullable(),
	printerLink: z.string().trim().max(50).optional().nullable(),
	rollPrinter: z.boolean().optional(),
	img: z.string().trim().max(200).optional().nullable(),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: z.object({
		name: z.string().trim().min(1, "Printer name is required").max(100),
		location: z.string().trim().min(1, "Location is required").max(100),
		usedBy: z.string().trim().min(1, "Used By is required").max(100),
		department: z.string().trim().max(100).optional().nullable(),
		printerLink: z.string().trim().max(50).optional().nullable(),
		img: z.string().trim().max(200).optional().nullable(),
	}),
});

const addActionSchema = z.object({
	printerID: z.coerce.number().int().positive(),
	actionType: z.enum(PRINTER_ACTION_TYPES),
	actionBy: z.string().trim().min(1, "Action By is required").max(100),
	actionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	note: z.string().trim().max(100).optional().default(""),
	tonerID: z.coerce.number().int().optional(),
	requestedBy: z.string().trim().max(50).optional().default(""),
	recievedBy: z.string().trim().max(50).optional().default(""),
});

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toDateString(value: unknown): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
		return value.slice(0, 10);
	}
	return String(value ?? "");
}

function toNullableNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	const num = Number(value);
	return Number.isNaN(num) ? null : num;
}

function toPrinter(row: Row): PrinterItem {
	return {
		id: Number(row.id),
		name: String(row.name ?? ""),
		location: String(row.location ?? ""),
		usedBy: String(row.usedBy ?? ""),
		department: toString(row.department),
		printerLink: toString(row.printerLink),
		empID:
			row.empID === null || row.empID === undefined ? null : Number(row.empID),
		img: toString(row.img),
	};
}

function toPrinterInfo(row: Row): PrinterInfoItem {
	return {
		manufacturer: toString(row.manufacturer),
		model: toString(row.model),
		serialNumber: toString(row.serialNumber),
		firmware: toString(row.firmware),
		RFID:
			row.RFID === null || row.RFID === undefined
				? null
				: Boolean(Number(row.RFID)),
		darkness: toString(row.darkness),
		printSpeed: toNullableNumber(row.printSpeed),
		tearOffAdjust: toNullableNumber(row.tearOffAdjust),
		printMode: toString(row.printMode),
		mediaType: toString(row.mediaType),
		sensorSelect: toString(row.sensorSelect),
		printMethod: toString(row.printMethod),
		printWidth: toNullableNumber(row.printWidth),
		labelLength: toNullableNumber(row.labelLength),
		labelTop: toNullableNumber(row.labelTop),
		leftPosition: toNullableNumber(row.leftPosition),
	};
}

function toAction(row: Row): PrinterActionItem {
	return {
		id: Number(row.id),
		actionType: String(row.actionType ?? ""),
		actionDate: toDateString(row.actionDate),
		actionBy: String(row.actionBy ?? ""),
		note: String(row.note ?? ""),
		itemID: Number(row.itemID ?? 0),
		itemName: toString(row.itemName),
		requestedBy: String(row.requestedBy ?? ""),
		recievedBy: String(row.recievedBy ?? ""),
	};
}

export const printersRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<PrinterItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, name, location, usedBy, department, printerLink, empID, img
			 FROM printers
			 WHERE inActive = 0
			 ORDER BY name ASC`,
		);
		return rows.map(toPrinter);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<PrinterDetail | null> => {
			const [[printerRows], [infoRows], [actionRows], [tonerRows]] =
				await Promise.all([
					ctx.db.iss.execute<Row[]>(
						`SELECT id, name, location, usedBy, department, printerLink, empID, img
						 FROM printers
						 WHERE id = ?
						 LIMIT 1`,
						[input.id],
					),
					ctx.db.iss.execute<Row[]>(
						`SELECT manufacturer, model, serialNumber, firmware, RFID, darkness,
						        printSpeed, tearOffAdjust, printMode, mediaType, sensorSelect,
						        printMethod, printWidth, labelLength, labelTop, leftPosition
						 FROM printerInfo
						 WHERE printerID = ?
						 LIMIT 1`,
						[input.id],
					),
					ctx.db.iss.execute<Row[]>(
						`SELECT pa.id, pa.actionType, pa.actionDate, pa.actionBy, pa.note,
						        pa.itemID, pa.requestedBy, pa.recievedBy,
						        i.name AS itemName
						 FROM printerActions pa
						 LEFT JOIN items i ON i.id = pa.itemID
						 WHERE pa.printerID = ?
						 ORDER BY pa.actionDate DESC, pa.id DESC
						 LIMIT 10`,
						[input.id],
					),
					ctx.db.iss.execute<Row[]>(
						`SELECT i.id, i.name, i.brand, i.stock, i.img
						 FROM printersToners pt
						 INNER JOIN items i ON i.id = pt.tonerID
						 WHERE pt.PrinterID = ? AND i.inActive = 0
						 ORDER BY i.name ASC`,
						[input.id],
					),
				]);

			if (!printerRows[0]) {
				return null;
			}

			return {
				...toPrinter(printerRows[0]),
				info: infoRows[0] ? toPrinterInfo(infoRows[0]) : null,
				actions: actionRows.map(toAction),
				linkedToners: tonerRows.map((row) => ({
					id: Number(row.id),
					name: String(row.name ?? ""),
					brand: String(row.brand ?? ""),
					stock: Number(row.stock ?? 0),
					img: toString(row.img),
				})),
			};
		}),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO printers (name, location, usedBy, img, inActive, department, printerLink)
				 VALUES (?, ?, ?, '', 0, ?, ?)`,
				[
					input.name,
					input.location,
					input.usedBy,
					input.department ?? null,
					input.printerLink ?? null,
				],
			);
			const printerID = result.insertId;

			if (input.rollPrinter) {
				await ctx.db.iss.execute(
					`INSERT INTO printerInfo (printerID, manufacturer) VALUES (?, '')`,
					[printerID],
				);
			}

			if (input.img) {
				await ctx.db.iss.execute(`UPDATE printers SET img = ? WHERE id = ?`, [
					input.img,
					printerID,
				]);
			}

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'printer', ?)`,
				[ctx.user.id, printerID],
			);

			return { success: true, id: printerID };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE printers
				 SET name = ?, location = ?, usedBy = ?, department = ?, printerLink = ?, img = ?
				 WHERE id = ?`,
				[
					data.name,
					data.location,
					data.usedBy,
					data.department ?? null,
					data.printerLink ?? null,
					data.img ?? "",
					id,
				],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'printer', ?)`,
					[ctx.user.id, id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE printers SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'printer', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	addAction: protectedProcedure
		.input(addActionSchema)
		.mutation(async ({ ctx, input }) => {
			const tonerID = input.tonerID ?? 0;

			if (tonerID > 0) {
				const [rows] = await ctx.db.iss.execute<Row[]>(
					`SELECT id, name, stock FROM items WHERE id = ? AND inActive = 0 LIMIT 1`,
					[tonerID],
				);
				const found = rows[0];
				if (!found) {
					throw new Error("Selected toner is no longer available");
				}
				if (Number(found.stock ?? 0) < 1) {
					throw new Error(`${String(found.name ?? "Toner")} is out of stock`);
				}
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO printerActions
				 (printerID, actionType, actionDate, actionBy, note, itemID, requestedBy, recievedBy)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					input.printerID,
					input.actionType,
					input.actionDate,
					input.actionBy,
					input.note,
					tonerID,
					input.requestedBy,
					input.recievedBy,
				],
			);

			if (tonerID > 0) {
				await ctx.db.iss.execute(
					`UPDATE items SET stock = stock - 1 WHERE id = ?`,
					[tonerID],
				);
			}

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'printerAction', ?)`,
				[ctx.user.id, input.printerID],
			);

			return { success: true, id: result.insertId };
		}),

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

			const fileName = `printer-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
			const dir = path.join(process.cwd(), "ISS", "printersImages");
			await mkdir(dir, { recursive: true });
			await writeFile(path.join(dir, fileName), buffer);

			return { image: fileName };
		}),
});
