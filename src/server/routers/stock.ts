import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type StockItem = {
	id: number;
	name: string;
	brand: string;
	category: string;
	stock: number;
	img: string;
	purchased: number;
	provided: number;
};

export type StockPurchaseHistoryItem = {
	id: number;
	purchaseID: number;
	poNumber: number;
	vendorName: string;
	date: string;
	quantity: number;
	price: string;
};

export type StockProvideHistoryItem = {
	id: number;
	provideID: number;
	empID: number;
	employeeName: string;
	date: string;
	quantity: number;
};

export type StockHistory = {
	purchases: StockPurchaseHistoryItem[];
	provides: StockProvideHistoryItem[];
};

const itemSchema = z.object({
	name: z.string().trim().min(1).max(100),
	brand: z.string().trim().max(100).optional(),
	stock: z.coerce.number().int().min(0),
	category: z.string().trim().min(1).max(100),
	img: z.string().trim().max(100).optional(),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: itemSchema,
});

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
	return "";
}

export const stockRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<StockItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, name, brand, category, stock, img
			 FROM items
			 WHERE inActive = 0
			 ORDER BY name ASC`,
		);

		const [purchaseRows] = await ctx.db.iss.execute<Row[]>(
			`SELECT itemID, COALESCE(SUM(quantity), 0) AS qty
			 FROM purchaseItems
			 GROUP BY itemID`,
		);
		const [provideRows] = await ctx.db.iss.execute<Row[]>(
			`SELECT itemID, COALESCE(SUM(quantity), 0) AS qty
			 FROM provideItems
			 GROUP BY itemID`,
		);

		const purchasedByItem = new Map<number, number>();
		for (const row of purchaseRows) {
			purchasedByItem.set(Number(row.itemID), Number(row.qty ?? 0));
		}
		const providedByItem = new Map<number, number>();
		for (const row of provideRows) {
			providedByItem.set(Number(row.itemID), Number(row.qty ?? 0));
		}

		return rows.map((row) => ({
			id: Number(row.id),
			name: String(row.name ?? ""),
			brand: String(row.brand ?? ""),
			category: String(row.category ?? ""),
			stock: Number(row.stock ?? 0),
			img: String(row.img ?? ""),
			purchased: purchasedByItem.get(Number(row.id)) ?? 0,
			provided: providedByItem.get(Number(row.id)) ?? 0,
		}));
	}),

	history: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<StockHistory> => {
			const [purchaseRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT pi.id, pi.purchaseID, pi.quantity, pi.price,
						p.poNumber, p.quotationDate, v.name AS vendorName
				 FROM purchaseItems pi
				 INNER JOIN purchase p ON p.id = pi.purchaseID
				 LEFT JOIN vendors v ON v.id = p.vendorID
				 WHERE pi.itemID = ?
				 ORDER BY p.quotationDate DESC, pi.id DESC
				 LIMIT 20`,
				[input.id],
			);

			const [provideRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT pi.id, pi.provideID, pi.quantity,
						pr.date, pr.empID, e.name AS employeeName
				 FROM provideItems pi
				 INNER JOIN provide pr ON pr.id = pi.provideID
				 LEFT JOIN employees e ON e.empID = pr.empID
				 WHERE pi.itemID = ?
				 ORDER BY pr.date DESC, pi.id DESC
				 LIMIT 20`,
				[input.id],
			);

			return {
				purchases: purchaseRows.map((row) => ({
					id: Number(row.id),
					purchaseID: Number(row.purchaseID),
					poNumber: Number(row.poNumber ?? 0),
					vendorName: String(row.vendorName ?? "-"),
					date: toDateString(row.quotationDate),
					quantity: Number(row.quantity ?? 0),
					price: String(row.price ?? ""),
				})),
				provides: provideRows.map((row) => ({
					id: Number(row.id),
					provideID: Number(row.provideID),
					empID: Number(row.empID ?? 0),
					employeeName: String(row.employeeName ?? "-"),
					date: toDateString(row.date),
					quantity: Number(row.quantity ?? 0),
				})),
			};
		}),

	create: protectedProcedure
		.input(itemSchema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM items WHERE name = ? LIMIT 1`,
				[input.name],
			);
			if (existing[0]) {
				throw new Error("Failed, Already Added");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO items (name, stock, brand, user, img, inActive, category)
				 VALUES (?, ?, ?, ?, ?, 0, ?)`,
				[
					input.name,
					input.stock,
					input.brand ?? "",
					ctx.user.id,
					input.img ?? "",
					input.category,
				],
			);

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'item', ?)`,
				[ctx.user.id, result.insertId],
			);

			return { success: true, id: result.insertId };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM items WHERE name = ? AND id <> ? LIMIT 1`,
				[input.data.name, input.id],
			);
			if (existing[0]) {
				throw new Error("Failed, Already Added");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE items
				 SET name = ?, stock = ?, brand = ?, img = ?, category = ?
				 WHERE id = ?`,
				[
					input.data.name,
					input.data.stock,
					input.data.brand ?? "",
					input.data.img ?? "",
					input.data.category,
					input.id,
				],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'item', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	deactivate: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE items SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'item', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
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

			const fileName = `item-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
			const dir = path.join(process.cwd(), "public", "itemsImages");
			await mkdir(dir, { recursive: true });
			await writeFile(path.join(dir, fileName), buffer);

			return { image: fileName };
		}),
});
