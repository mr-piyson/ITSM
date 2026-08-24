import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type PurchaseLineItem = {
	id: number;
	itemID: number;
	itemName: string;
	itemBrand: string;
	quantity: number;
	price: string;
};

export type PurchaseServiceLine = {
	id: number;
	serviceName: string;
	servicePrice: string;
};

export type Purchase = {
	id: number;
	poNumber: number;
	mrnNumber: string;
	vendorID: number;
	vendorName: string;
	serviceType: boolean;
	buyer: string;
	currency: string;
	currentTotal: string;
	vat: string;
	grandTotal: string;
	quotationDate: string;
	paidDate: string | null;
	advanceRequest: boolean;
	LPO: boolean;
	invoice: boolean;
	deliveryNote: boolean;
	mrn: boolean;
	forWho: string;
	notes: string;
	link: string;
	createdAt: string;
	createdByName: string | null;
	items: PurchaseLineItem[];
	services: PurchaseServiceLine[];
};

export type VendorContactOption = {
	id: number;
	contactType: string;
	contactName: string;
	contact: string;
	personPosition: string | null;
};

export type VendorOption = {
	id: number;
	name: string;
	notes: string;
	contacts: VendorContactOption[];
};

export type PurchaseItemOption = {
	id: number;
	name: string;
	brand: string;
	stock: number;
	category: string;
};

const createItemSchema = z.object({
	name: z.string().trim().min(1).max(100),
	brand: z.string().trim().max(100).optional(),
	stock: z.coerce.number().int().min(0).default(0),
	category: z.string().trim().min(1).max(100),
});

const purchaseItemSchema = z.object({
	itemID: z.coerce.number().int().positive(),
	quantity: z.coerce.number().int().min(1),
	price: z.string().trim().max(50),
});

const purchaseServiceSchema = z.object({
	name: z.string().trim().min(1).max(100),
	price: z.string().trim().max(50),
});

const createSchema = z.object({
	poType: z.enum(["Purchase", "Service"]),
	poNumber: z.coerce.number().int().positive(),
	mrnNumber: z.string().trim().max(50).optional(),
	vendorID: z.coerce.number().int().positive(),
	currency: z.enum(["BHD", "USD", "EUR"]),
	currentTotal: z.string().trim().max(50),
	vat: z.string().trim().max(50),
	grandTotal: z.string().trim().max(50),
	quotationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	paidDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	buyer: z.string().trim().min(1).max(50),
	advanceRequest: z.boolean(),
	LPO: z.boolean(),
	invoice: z.boolean(),
	deliveryNote: z.boolean(),
	mrn: z.boolean(),
	forWho: z.string().trim().max(2000).optional(),
	notes: z.string().trim().max(2000).optional(),
	link: z.string().trim().max(2000).optional(),
	items: z.array(purchaseItemSchema).optional(),
	services: z.array(purchaseServiceSchema).optional(),
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

function toDateTimeString(value: unknown): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	if (typeof value === "string") {
		return value.slice(0, 10);
	}
	return "";
}

export const purchasesRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<Purchase[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(`
			SELECT
				p.*,
				v.name AS vendorName,
				u.name AS createdByName
			FROM purchase p
			LEFT JOIN vendors v ON v.id = p.vendorID
			LEFT JOIN users u ON u.id = p.user
			ORDER BY p.date DESC, p.id DESC
		`);

		const [itemRows] = await ctx.db.iss.execute<Row[]>(`
			SELECT
				pi.id,
				pi.purchaseID,
				pi.itemID,
				pi.quantity,
				pi.price,
				i.name AS itemName,
				i.brand AS itemBrand
			FROM purchaseItems pi
			INNER JOIN items i ON i.id = pi.itemID
			ORDER BY pi.id ASC
		`);

		const [serviceRows] = await ctx.db.iss.execute<Row[]>(`
			SELECT id, purchaseID, serviceName, servicePrice
			FROM purchaseServices
			ORDER BY id ASC
		`);

		const itemsByPurchase = new Map<number, PurchaseLineItem[]>();
		for (const row of itemRows) {
			const purchaseID = Number(row.purchaseID);
			const list = itemsByPurchase.get(purchaseID) ?? [];
			list.push({
				id: Number(row.id),
				itemID: Number(row.itemID),
				itemName: String(row.itemName ?? ""),
				itemBrand: String(row.itemBrand ?? ""),
				quantity: Number(row.quantity),
				price: String(row.price ?? ""),
			});
			itemsByPurchase.set(purchaseID, list);
		}

		const servicesByPurchase = new Map<number, PurchaseServiceLine[]>();
		for (const row of serviceRows) {
			const purchaseID = Number(row.purchaseID);
			const list = servicesByPurchase.get(purchaseID) ?? [];
			list.push({
				id: Number(row.id),
				serviceName: String(row.serviceName ?? ""),
				servicePrice: String(row.servicePrice ?? ""),
			});
			servicesByPurchase.set(purchaseID, list);
		}

		return rows.map((row) => ({
			id: Number(row.id),
			poNumber: Number(row.poNumber),
			mrnNumber: String(row.mrnNumber ?? ""),
			vendorID: Number(row.vendorID),
			vendorName: String(row.vendorName ?? "-"),
			serviceType: Number(row.ServiceType) === 1,
			buyer: String(row.buyer ?? ""),
			currency: String(row.currency ?? ""),
			currentTotal: String(row.currentTotal ?? ""),
			vat: String(row.vat ?? ""),
			grandTotal: String(row.grandTotal ?? ""),
			quotationDate: toDateString(row.quotationDate),
			paidDate: row.paidDate ? toDateString(row.paidDate) : null,
			advanceRequest: Number(row.advanceRequest) === 1,
			LPO: Number(row.LPO) === 1,
			invoice: Number(row.invoice) === 1,
			deliveryNote: Number(row.deliveryNote) === 1,
			mrn: Number(row.mrn) === 1,
			forWho: String(row.forWho ?? ""),
			notes: String(row.notes ?? ""),
			link: String(row.link ?? ""),
			createdAt: toDateTimeString(row.date),
			createdByName:
				row.createdByName === null || row.createdByName === undefined
					? null
					: String(row.createdByName),
			items: itemsByPurchase.get(Number(row.id)) ?? [],
			services: servicesByPurchase.get(Number(row.id)) ?? [],
		}));
	}),

	vendors: protectedProcedure.query(
		async ({ ctx }): Promise<VendorOption[]> => {
			const [vendorRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT id, name, notes FROM vendors WHERE inActive = 0 ORDER BY name ASC`,
			);

			const [contactRows] = await ctx.db.iss.execute<Row[]>(`
			SELECT id, vendorID, contactType, contactName, contact, personPosition
			FROM vendorsContacts
			ORDER BY id ASC
		`);

			const contactsByVendor = new Map<number, VendorContactOption[]>();
			for (const row of contactRows) {
				const vendorID = Number(row.vendorID);
				const list = contactsByVendor.get(vendorID) ?? [];
				list.push({
					id: Number(row.id),
					contactType: String(row.contactType ?? ""),
					contactName: String(row.contactName ?? ""),
					contact: String(row.contact ?? ""),
					personPosition:
						row.personPosition === null || row.personPosition === undefined
							? null
							: String(row.personPosition),
				});
				contactsByVendor.set(vendorID, list);
			}

			return vendorRows.map((row) => ({
				id: Number(row.id),
				name: String(row.name ?? ""),
				notes: String(row.notes ?? ""),
				contacts: contactsByVendor.get(Number(row.id)) ?? [],
			}));
		},
	),

	items: protectedProcedure.query(
		async ({ ctx }): Promise<PurchaseItemOption[]> => {
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

	createItem: protectedProcedure
		.input(createItemSchema)
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
				 VALUES (?, ?, ?, ?, '', 0, ?)`,
				[
					input.name,
					input.stock,
					input.brand ?? "",
					ctx.user.id,
					input.category,
				],
			);
			const itemID = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'item', ?)`,
				[ctx.user.id, itemID],
			);

			return {
				success: true,
				item: {
					id: itemID,
					name: input.name,
					brand: input.brand ?? "",
					stock: input.stock,
					category: input.category,
				},
			};
		}),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const isService = input.poType === "Service";

			if (isService && (input.services?.length ?? 0) === 0) {
				throw new Error("Add at least one service");
			}
			if (!isService && (input.items?.length ?? 0) === 0) {
				throw new Error("Add at least one item");
			}

			const [vendorRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM vendors WHERE id = ? AND inActive = 0 LIMIT 1`,
				[input.vendorID],
			);
			if (!vendorRows[0]) {
				throw new Error("Selected vendor no longer exists");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO purchase
					(vendorID, quotationDate, buyer, poNumber, forWho, notes, mrnNumber,
					 currentTotal, vat, grandTotal, advanceRequest, LPO, invoice,
					 deliveryNote, mrn, paidDate, user, currency, date, link, ServiceType)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
				[
					input.vendorID,
					input.quotationDate,
					input.buyer,
					input.poNumber,
					input.forWho ?? "",
					input.notes ?? "",
					input.mrnNumber ?? "",
					input.currentTotal,
					input.vat,
					input.grandTotal,
					input.advanceRequest,
					input.LPO,
					input.invoice,
					input.deliveryNote,
					input.mrn,
					input.paidDate ?? null,
					ctx.user.id,
					input.currency,
					input.link ?? "",
					isService,
				],
			);
			const purchaseID = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'purchase', ?)`,
				[ctx.user.id, purchaseID],
			);

			if (isService) {
				for (const service of input.services ?? []) {
					await ctx.db.iss.execute(
						`INSERT INTO purchaseServices (purchaseID, serviceName, servicePrice)
						 VALUES (?, ?, ?)`,
						[purchaseID, service.name, service.price],
					);
				}
			} else {
				for (const item of input.items ?? []) {
					await ctx.db.iss.execute(
						`INSERT INTO purchaseItems (purchaseID, itemID, quantity, price)
						 VALUES (?, ?, ?, ?)`,
						[purchaseID, item.itemID, item.quantity, item.price],
					);
					await ctx.db.iss.execute(
						`UPDATE items SET stock = stock + ? WHERE id = ?`,
						[item.quantity, item.itemID],
					);
				}
			}

			return { success: true, id: purchaseID };
		}),
});
