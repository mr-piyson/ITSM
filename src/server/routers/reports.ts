import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type AssetReportRow = {
	id: number;
	code: string;
	type: string | null;
	deviceName: string | null;
	status: string | null;
	location: string | null;
	department: string | null;
	owner: string | null;
};

export type PrinterReportRow = {
	id: number;
	actionDate: string | null;
	printerName: string | null;
	printerLocation: string | null;
	printerID: number | null;
	actionType: string | null;
	itemName: string | null;
	itemID: number | null;
	itemStock: number | null;
	actionBy: string | null;
};

export type StockPurchaseRow = {
	id: number;
	poType: "Purchase" | "Service";
	poNumber: number;
	date: string | null;
	vendorName: string | null;
	lineItems: string;
	quantities: string;
	prices: string;
	grandTotal: string | null;
	currency: string | null;
	paid: boolean;
	forWho: string | null;
};

export type StockProvideRow = {
	id: number;
	date: string | null;
	employeeName: string | null;
	requestedByName: string | null;
	receivedByName: string | null;
	providedBy: string | null;
	lineItems: string;
	quantities: string;
	notes: string | null;
};

export type StockReportResult = {
	purchases: StockPurchaseRow[];
	provides: StockProvideRow[];
	totalQuantity: number;
	totalAmountBHD: number;
};

// Approximate FX rates used by the legacy system to normalize to BHD.
const USD_TO_BHD = 2.659002;
const EUR_TO_BHD = 2.504119;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function toStringValue(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

export const reportsRouter = router({
	assetTypes: protectedProcedure.query(async ({ ctx }): Promise<string[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT DISTINCT type FROM assets WHERE type IS NOT NULL AND type != '' ORDER BY type`,
		);
		return rows.map((row) => String(row.type));
	}),

	assets: protectedProcedure
		.input(
			z.object({
				status: z.enum(["In Use", "Available", "Defective"]),
				types: z.array(z.string().trim().min(1)).min(1),
			}),
		)
		.query(async ({ ctx, input }): Promise<AssetReportRow[]> => {
			const placeholders = input.types.map(() => "?").join(",");
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT assets.id, assets.code, assets.type, assets.deviceName,
				        assets.deviceStatus, assets.location, assets.department,
				        employees.name AS owner
				 FROM assets
				 LEFT JOIN employees ON assets.empID = employees.empID
				 WHERE assets.deviceStatus = ? AND assets.type IN (${placeholders})
				 ORDER BY assets.code ASC`,
				[input.status, ...input.types],
			);
			return rows.map((row) => ({
				id: Number(row.id),
				code: String(row.code ?? ""),
				type: toStringValue(row.type),
				deviceName: toStringValue(row.deviceName),
				status: toStringValue(row.deviceStatus),
				location: toStringValue(row.location),
				department: toStringValue(row.department),
				owner: toStringValue(row.owner),
			}));
		}),

	printers: protectedProcedure
		.input(
			z.object({
				fromDate: dateSchema,
				toDate: dateSchema,
			}),
		)
		.query(async ({ ctx, input }): Promise<PrinterReportRow[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT pa.id, pa.actionDate, pa.actionBy, pa.actionType,
				        p.name AS printerName, p.location AS printerLocation,
				        p.id AS printerID,
				        i.name AS itemName, i.id AS itemID, i.stock AS itemStock
				 FROM printerActions pa
				 LEFT JOIN printers p ON p.id = pa.printerID
				 LEFT JOIN items i ON i.id = pa.itemID
				 WHERE pa.actionDate >= ? AND pa.actionDate <= ?
				 ORDER BY pa.actionDate DESC`,
				[input.fromDate, `${input.toDate} 23:59:59`],
			);
			return rows.map((row) => ({
				id: Number(row.id),
				actionDate: toStringValue(row.actionDate),
				printerName: toStringValue(row.printerName),
				printerLocation: toStringValue(row.printerLocation),
				printerID: row.printerID === null ? null : Number(row.printerID),
				actionType: toStringValue(row.actionType),
				itemName: toStringValue(row.itemName),
				itemID: row.itemID === null ? null : Number(row.itemID),
				itemStock:
					row.itemStock === null || row.itemStock === undefined
						? null
						: Number(row.itemStock),
				actionBy: toStringValue(row.actionBy),
			}));
		}),

	stock: protectedProcedure
		.input(
			z.object({
				fromDate: dateSchema,
				toDate: dateSchema,
				section: z.enum(["all", "purchase", "provide"]).default("all"),
				purchaseType: z.enum(["all", "items", "service"]).default("all"),
			}),
		)
		.query(async ({ ctx, input }): Promise<StockReportResult> => {
			let totalQuantity = 0;
			let totalAmountBHD = 0;

			let purchases: StockPurchaseRow[] = [];
			if (input.section !== "provide") {
				let typeCondition = "";
				const params: unknown[] = [input.fromDate, `${input.toDate} 23:59:59`];
				if (input.purchaseType === "items") {
					typeCondition = " AND purchase.ServiceType = 0";
				} else if (input.purchaseType === "service") {
					typeCondition = " AND purchase.ServiceType = 1";
				}

				const [rows] = await ctx.db.iss.execute<Row[]>(
					`SELECT purchase.id, purchase.ServiceType, purchase.poNumber,
					        purchase.date, purchase.grandTotal, purchase.currency,
					        purchase.paidDate, purchase.forWho,
					        vendors.name AS vendorName
					 FROM purchase
					 INNER JOIN vendors ON vendors.id = purchase.vendorID
					 WHERE purchase.date >= ? AND purchase.date <= ?${typeCondition}
					 ORDER BY purchase.date DESC`,
					params,
				);

				purchases = [];
				for (const row of rows) {
					const serviceType = Number(row.ServiceType) === 1;
					const grandTotal = Number(row.grandTotal ?? 0);
					const currency = toStringValue(row.currency) ?? "BHD";

					if (currency === "USD") {
						totalAmountBHD += grandTotal / USD_TO_BHD;
					} else if (currency === "EUR") {
						totalAmountBHD += grandTotal / EUR_TO_BHD;
					} else {
						totalAmountBHD += grandTotal;
					}

					let lineItems = "";
					let quantities = "";
					let prices = "";

					if (!serviceType) {
						const [itemRows] = await ctx.db.iss.execute<Row[]>(
							`SELECT pi.quantity, pi.price, i.name, i.brand
							 FROM purchaseItems pi
							 INNER JOIN items i ON pi.itemID = i.id
							 WHERE pi.purchaseID = ?`,
							[Number(row.id)],
						);
						for (const itemRow of itemRows) {
							lineItems += `${itemRow.name} (${itemRow.brand})\n`;
							quantities += `${itemRow.quantity}\n`;
							prices += `${itemRow.price}\n`;
							totalQuantity += Number(itemRow.quantity ?? 0);
						}
					} else {
						const [serviceRows] = await ctx.db.iss.execute<Row[]>(
							`SELECT serviceName, servicePrice
							 FROM purchaseServices
							 WHERE purchaseID = ?`,
							[Number(row.id)],
						);
						for (const serviceRow of serviceRows) {
							lineItems += `${serviceRow.serviceName}\n`;
							quantities += `1\n`;
							prices += `${serviceRow.servicePrice}\n`;
							totalQuantity += 1;
						}
					}

					const paidDate = toStringValue(row.paidDate);
					purchases.push({
						id: Number(row.id),
						poType: serviceType ? "Service" : "Purchase",
						poNumber: Number(row.poNumber ?? 0),
						date: toStringValue(row.date),
						vendorName: toStringValue(row.vendorName),
						lineItems: lineItems.trimEnd(),
						quantities: quantities.trimEnd(),
						prices: prices.trimEnd(),
						grandTotal: toStringValue(row.grandTotal),
						currency,
						paid: Boolean(paidDate && paidDate !== "0000-00-00"),
						forWho: toStringValue(row.forWho),
					});
				}
			}

			let provides: StockProvideRow[] = [];
			if (input.section !== "purchase") {
				const [rows] = await ctx.db.iss.execute<Row[]>(
					`SELECT provide.id, provide.date, provide.notes, provide.provideBy,
					        e1.name AS empName, e2.name AS reqName, e3.name AS recName
					 FROM provide
					 INNER JOIN employees e1 ON e1.empID = provide.empID
					 INNER JOIN employees e2 ON e2.empID = provide.requestBy
					 INNER JOIN employees e3 ON e3.empID = provide.recievedBy
					 WHERE provide.date >= ? AND provide.date <= ?
					 ORDER BY provide.date DESC`,
					[input.fromDate, `${input.toDate} 23:59:59`],
				);

				provides = [];
				for (const row of rows) {
					const [itemRows] = await ctx.db.iss.execute<Row[]>(
						`SELECT i.name, i.brand, pi.quantity
						 FROM provideItems pi
						 INNER JOIN items i ON pi.itemID = i.id
						 WHERE pi.provideID = ?`,
						[Number(row.id)],
					);
					let lineItems = "";
					let quantities = "";
					for (const itemRow of itemRows) {
						lineItems += `${itemRow.name} (${itemRow.brand})\n`;
						quantities += `${itemRow.quantity}\n`;
					}
					provides.push({
						id: Number(row.id),
						date: toStringValue(row.date),
						employeeName: toStringValue(row.empName),
						requestedByName: toStringValue(row.reqName),
						receivedByName: toStringValue(row.recName),
						providedBy: toStringValue(row.provideBy),
						lineItems: lineItems.trimEnd(),
						quantities: quantities.trimEnd(),
						notes: toStringValue(row.notes),
					});
				}
			}

			return {
				purchases,
				provides,
				totalQuantity,
				totalAmountBHD: Math.round(totalAmountBHD * 1000) / 1000,
			};
		}),
});
