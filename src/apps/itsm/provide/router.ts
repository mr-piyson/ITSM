import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";
import { getEmployeesByCodes } from "@/lib/oracle-employees.server";

type Row = RowDataPacket & Record<string, unknown>;

export type ProvideLineItem = {
	id: number;
	itemID: number;
	itemName: string;
	itemBrand: string;
	itemImg: string;
	quantity: number;
};

export type ProvideItem = {
	id: number;
	date: string;
	emplCode: string;
	employeeName: string;
	employeeImage: string | null;
	requestByEmplCode: string;
	requestedByName: string;
	recievedByEmplCode: string;
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
	emplCode: z.string().trim().min(1).max(20),
	requestByEmplCode: z.string().trim().min(1).max(20),
	recievedByEmplCode: z.string().trim().min(1).max(20),
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

function mapProvideRows(
	rows: Row[],
	itemRows: Row[],
	employees: Awaited<ReturnType<typeof getEmployeesByCodes>>,
): ProvideItem[] {
	const nameOf = (code: unknown): string =>
		employees.get(String(code ?? "").trim())?.name ?? "";
	const imageOf = (code: unknown): string | null =>
		employees.get(String(code ?? "").trim())?.image ?? null;

	const itemsByProvide = new Map<number, ProvideLineItem[]>();
	for (const row of itemRows) {
		const provideID = Number(row.provideID);
		const list = itemsByProvide.get(provideID) ?? [];
		list.push({
			id: Number(row.id),
			itemID: Number(row.itemID),
			itemName: String(row.itemName ?? ""),
			itemBrand: String(row.itemBrand ?? ""),
			itemImg: String(row.itemImg ?? ""),
			quantity: Number(row.quantity),
		});
		itemsByProvide.set(provideID, list);
	}

	return rows.map((row) => ({
		id: Number(row.id),
		date: toDateString(row.date),
		emplCode: String(row.emplCode ?? ""),
		employeeName: nameOf(row.emplCode),
		employeeImage: imageOf(row.emplCode),
		requestByEmplCode: String(row.requestByEmplCode ?? ""),
		requestedByName: nameOf(row.requestByEmplCode),
		recievedByEmplCode: String(row.recievedByEmplCode ?? ""),
		receivedByName: nameOf(row.recievedByEmplCode),
		provideBy: String(row.providedByName ?? row.provideBy ?? ""),
		provideByID: Number(row.provideBy),
		notes: String(row.notes ?? ""),
		createdByName: toString(row.createdByName),
		items: itemsByProvide.get(Number(row.id)) ?? [],
	}));
}

const PROVIDE_SELECT = `
	SELECT
		p.id,
		p.date,
		p.emplCode,
		p.requestByEmplCode,
		p.recievedByEmplCode,
		p.provideBy,
		p.notes,
		p.user,
		u.name AS providedByName,
		cu.name AS createdByName
	FROM provide p
	LEFT JOIN users u ON u.id = p.provideBy
	LEFT JOIN users cu ON cu.id = p.user
`;

const PROVIDE_ITEMS_SELECT = `
	SELECT
		pi.id,
		pi.provideID,
		pi.itemID,
		pi.quantity,
		i.name AS itemName,
		i.brand AS itemBrand,
		i.img AS itemImg
	FROM provideItems pi
	INNER JOIN items i ON i.id = pi.itemID
`;

export const providesRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<ProvideItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`${PROVIDE_SELECT} ORDER BY p.date DESC, p.id DESC`,
		);

		const employees = await getEmployeesByCodes(
			rows.flatMap((row) => [
				row.emplCode,
				row.requestByEmplCode,
				row.recievedByEmplCode,
			]),
		);

		const [itemRows] = await ctx.db.iss.execute<Row[]>(
			`${PROVIDE_ITEMS_SELECT} ORDER BY pi.id ASC`,
		);

		return mapProvideRows(rows, itemRows, employees);
	}),

	byEmployee: protectedProcedure
		.input(z.object({ code: z.string().trim().min(1).max(20) }))
		.query(async ({ ctx, input }): Promise<ProvideItem[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`${PROVIDE_SELECT} WHERE p.emplCode = ? ORDER BY p.date DESC, p.id DESC`,
				[input.code],
			);

			const employees = await getEmployeesByCodes(
				rows.flatMap((row) => [
					row.emplCode,
					row.requestByEmplCode,
					row.recievedByEmplCode,
				]),
			);

			const [itemRows] = await ctx.db.iss.execute<Row[]>(
				`
				${PROVIDE_ITEMS_SELECT}
				INNER JOIN provide p ON p.id = pi.provideID
				WHERE p.emplCode = ?
				ORDER BY pi.id ASC
			`,
				[input.code],
			);

			return mapProvideRows(rows, itemRows, employees);
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
				`INSERT INTO provide (date, emplCode, requestByEmplCode, provideBy, recievedByEmplCode, notes, user)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					input.providedDate,
					input.emplCode,
					input.requestByEmplCode,
					input.providedBy,
					input.recievedByEmplCode,
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
