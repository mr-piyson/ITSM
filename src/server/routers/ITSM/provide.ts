import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type ProvideLineItem = {
	id: number;
	itemID: number;
	itemName: string;
	itemBrand: string;
	quantity: number;
};

export type ProvideItem = {
	id: number;
	date: string;
	empID: number;
	employeeName: string;
	employeeImage: string | null;
	requestBy: number;
	requestedByName: string;
	recievedBy: number;
	receivedByName: string;
	provideBy: string;
	provideByID: number;
	notes: string;
	createdByName: string | null;
	items: ProvideLineItem[];
};

export type StockItemOption = {
	id: number;
	name: string;
	brand: string;
	stock: number;
	category: string;
};

export type UserOption = {
	id: number;
	name: string;
};

const createItemSchema = z.object({
	itemID: z.coerce.number().int().positive(),
	quantity: z.coerce.number().int().min(1),
});

const createSchema = z.object({
	empID: z.coerce.number().int().positive(),
	requestBy: z.coerce.number().int().positive(),
	recievedBy: z.coerce.number().int().positive(),
	providedBy: z.coerce.number().int().positive(),
	providedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	notes: z.string().trim().max(2000).optional(),
	items: z.array(createItemSchema).min(1),
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

export const providesRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<ProvideItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(`
			SELECT
				p.id,
				p.date,
				p.empID,
				p.requestBy,
				p.recievedBy,
				p.provideBy,
				p.notes,
				p.user,
				e.name AS employeeName,
				e.image AS employeeImage,
				r.name AS requestedByName,
				re.name AS receivedByName,
				u.name AS providedByName,
				cu.name AS createdByName
			FROM provide p
			LEFT JOIN employees e ON e.empID = p.empID
			LEFT JOIN employees r ON r.empID = p.requestBy
			LEFT JOIN employees re ON re.empID = p.recievedBy
			LEFT JOIN users u ON u.id = p.provideBy
			LEFT JOIN users cu ON cu.id = p.user
			ORDER BY p.date DESC, p.id DESC
		`);

		const [itemRows] = await ctx.db.iss.execute<Row[]>(`
			SELECT
				pi.id,
				pi.provideID,
				pi.itemID,
				pi.quantity,
				i.name AS itemName,
				i.brand AS itemBrand
			FROM provideItems pi
			INNER JOIN items i ON i.id = pi.itemID
			ORDER BY pi.id ASC
		`);

		const itemsByProvide = new Map<number, ProvideLineItem[]>();
		for (const row of itemRows) {
			const provideID = Number(row.provideID);
			const list = itemsByProvide.get(provideID) ?? [];
			list.push({
				id: Number(row.id),
				itemID: Number(row.itemID),
				itemName: String(row.itemName ?? ""),
				itemBrand: String(row.itemBrand ?? ""),
				quantity: Number(row.quantity),
			});
			itemsByProvide.set(provideID, list);
		}

		return rows.map((row) => ({
			id: Number(row.id),
			date: toDateString(row.date),
			empID: Number(row.empID),
			employeeName: String(row.employeeName ?? ""),
			employeeImage: toString(row.employeeImage),
			requestBy: Number(row.requestBy),
			requestedByName: String(row.requestedByName ?? ""),
			recievedBy: Number(row.recievedBy),
			receivedByName: String(row.receivedByName ?? ""),
			provideBy: String(row.providedByName ?? row.provideBy ?? ""),
			provideByID: Number(row.provideBy),
			notes: String(row.notes ?? ""),
			createdByName: toString(row.createdByName),
			items: itemsByProvide.get(Number(row.id)) ?? [],
		}));
	}),

	stockItems: protectedProcedure.query(
		async ({ ctx }): Promise<StockItemOption[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT id, name, brand, stock, category
				 FROM items
				 WHERE inActive = 0
				 ORDER BY name ASC`,
			);
			return rows.map((row) => ({
				id: Number(row.id),
				name: String(row.name ?? ""),
				brand: String(row.brand ?? ""),
				stock: Number(row.stock ?? 0),
				category: String(row.category ?? ""),
			}));
		},
	),

	users: protectedProcedure.query(async ({ ctx }): Promise<UserOption[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, name FROM users ORDER BY name ASC`,
		);
		return rows.map((row) => ({
			id: Number(row.id),
			name: String(row.name ?? ""),
		}));
	}),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			for (const item of input.items) {
				const [rows] = await ctx.db.iss.execute<Row[]>(
					`SELECT id, name, stock FROM items WHERE id = ? AND inActive = 0 LIMIT 1`,
					[item.itemID],
				);
				const found = rows[0];
				if (!found) {
					throw new Error(
						"One of the selected items is no longer available in stock",
					);
				}
				const available = Number(found.stock ?? 0);
				if (available < item.quantity) {
					throw new Error(
						`${String(found.name ?? "Item")} has only ${available} in stock`,
					);
				}
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO provide (date, empID, requestBy, provideBy, recievedBy, notes, user)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					input.providedDate,
					input.empID,
					input.requestBy,
					input.providedBy,
					input.recievedBy,
					input.notes ?? "",
					ctx.user.id,
				],
			);
			const provideID = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'provide', ?)`,
				[ctx.user.id, provideID],
			);

			for (const item of input.items) {
				await ctx.db.iss.execute(
					`INSERT INTO provideItems (itemID, quantity, provideID)
					 VALUES (?, ?, ?)`,
					[item.itemID, item.quantity, provideID],
				);
				await ctx.db.iss.execute(
					`UPDATE items SET stock = stock - ? WHERE id = ?`,
					[item.quantity, item.itemID],
				);
			}

			return { success: true, id: provideID };
		}),
});
