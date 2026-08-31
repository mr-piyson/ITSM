import type { RowDataPacket } from "mysql2";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export const LOW_STOCK_THRESHOLD = 3;
export const CONTRACT_WINDOW_DAYS = 30;
export const MAINTENANCE_WINDOW_DAYS = 30;
export const WARRANTY_WINDOW_DAYS = 60;

export type DashboardKpis = {
	totalAssets: number;
	totalProvide: number;
	totalPurchase: number;
	totalStock: number;
	totalItems: number;
	totalEmployees: number;
	totalPrinters: number;
	totalServers: number;
};

export type AssetTypeCount = {
	type: string;
	total: number;
};

export type StockCategory = {
	category: string;
	itemCount: number;
	stock: number;
};

export type LowStockItem = {
	id: number;
	name: string;
	brand: string;
	category: string;
	stock: number;
};

export type RecentLog = {
	id: number;
	date: string;
	user: string | null;
	action: string;
	node: string;
	nodeID: number;
};

export type RecentAsset = {
	code: string;
	deviceName: string | null;
	type: string | null;
};

export type RecentItem = {
	id: number;
	name: string;
	category: string;
	stock: number;
};

export type DashboardAlert = {
	id: string;
	kind: "low_stock" | "contract" | "maintenance" | "warranty";
	severity: "low" | "medium" | "high";
	title: string;
	detail: string;
	date: string | null;
	href?: string;
};

export type DashboardData = {
	kpis: DashboardKpis;
	assetsByType: AssetTypeCount[];
	stockByCategory: StockCategory[];
	lowStock: LowStockItem[];
	recentLogs: RecentLog[];
	recentAssets: RecentAsset[];
	recentItems: RecentItem[];
	alerts: DashboardAlert[];
};

function toNumber(value: unknown): number {
	return Number(value ?? 0);
}

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toDateISO(value: unknown): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	if (value instanceof Date && isValid(value)) {
		return value.toISOString();
	}
	const parsed = parseISO(String(value));
	return isValid(parsed) ? parsed.toISOString() : null;
}

function daysUntil(dateIso: string | null): number | null {
	if (!dateIso) {
		return null;
	}
	const date = parseISO(dateIso);
	if (!isValid(date)) {
		return null;
	}
	return differenceInCalendarDays(date, new Date());
}

function formatDate(dateIso: string | null): string | null {
	if (!dateIso) {
		return null;
	}
	const date = parseISO(dateIso);
	return isValid(date) ? format(date, "MMM d, yyyy") : null;
}

export const dashboardRouter = router({
	overview: protectedProcedure.query(
		async ({ ctx }): Promise<DashboardData> => {
			const db = ctx.db.iss;

			const [
				[kpiRows],
				[typeRows],
				[categoryRows],
				[lowStockRows],
				[logRows],
				[assetRows],
				[itemRows],
				[contractRows],
				[maintenanceRows],
				[warrantyRows],
			] = await Promise.all([
				db.execute<Row[]>(
					`SELECT
					(SELECT COUNT(*) FROM assets WHERE inActive = 0) AS totalAssets,
					(SELECT COUNT(*) FROM provide) AS totalProvide,
					(SELECT COUNT(*) FROM purchase) AS totalPurchase,
					(SELECT COALESCE(SUM(stock), 0) FROM items WHERE inActive = 0 AND stock > 0) AS totalStock,
					(SELECT COUNT(*) FROM items WHERE inActive = 0) AS totalItems,
					(SELECT COUNT(*) FROM employees WHERE inActive = 0) AS totalEmployees,
					(SELECT COUNT(*) FROM printers WHERE inActive = 0) AS totalPrinters,
					(SELECT COUNT(*) FROM servers WHERE COALESCE(inActive, 0) = 0) AS totalServers`,
				),
				db.execute<Row[]>(
					`SELECT type, COUNT(*) AS total
				 FROM assets
				 WHERE inActive = 0 AND type IS NOT NULL
				 GROUP BY type
				 ORDER BY total DESC`,
				),
				db.execute<Row[]>(
					`SELECT category, COUNT(*) AS itemCount, COALESCE(SUM(stock), 0) AS stock
				 FROM items
				 WHERE inActive = 0
				 GROUP BY category
				 ORDER BY itemCount DESC`,
				),
				db.execute<Row[]>(
					`SELECT id, name, brand, category, stock
				 FROM items
				 WHERE inActive = 0 AND stock <= ?
				 ORDER BY stock ASC, id DESC
				 LIMIT 8`,
					[LOW_STOCK_THRESHOLD],
				),
				db.execute<Row[]>(
					`SELECT l.id, l.date, u.name AS user, l.action, l.node, l.nodeID
				 FROM changes_logs l
				 LEFT JOIN users u ON u.id = l.userID
				 ORDER BY l.date DESC
				 LIMIT 10`,
				),
				db.execute<Row[]>(
					`SELECT code, deviceName, type
				 FROM assets
				 WHERE inActive = 0
				 ORDER BY id DESC
				 LIMIT 10`,
				),
				db.execute<Row[]>(
					`SELECT id, name, category, stock
				 FROM items
				 WHERE inActive = 0
				 ORDER BY id DESC
				 LIMIT 10`,
				),
				db.execute<Row[]>(
					`SELECT id, productName, vendorID, startDate, endDate
				 FROM contracts
				 WHERE inActive = 0
				   AND endDate IS NOT NULL
				   AND endDate >= CURDATE()
				   AND endDate <= DATE_ADD(CURDATE(), INTERVAL ${CONTRACT_WINDOW_DAYS} DAY)
				 ORDER BY endDate ASC
				 LIMIT 10`,
				),
				db.execute<Row[]>(
					`SELECT serverID, name, serverIP, maintenanceDue
				 FROM servers
				 WHERE COALESCE(inActive, 0) = 0
				   AND maintenanceDue <= DATE_ADD(CURDATE(), INTERVAL ${MAINTENANCE_WINDOW_DAYS} DAY)
				 ORDER BY maintenanceDue ASC
				 LIMIT 10`,
				),
				db.execute<Row[]>(
					`SELECT id, code, deviceName, warrantyDate, warrantyStatus
				 FROM assets
				 WHERE inActive = 0
				   AND warrantyDate IS NOT NULL
				   AND warrantyDate <= DATE_ADD(CURDATE(), INTERVAL ${WARRANTY_WINDOW_DAYS} DAY)
				 ORDER BY warrantyDate ASC
				 LIMIT 10`,
				),
			]);

			const kpi = kpiRows[0] ?? {};

			const alerts: DashboardAlert[] = [];

			for (const row of lowStockRows) {
				const name = String(row.name ?? "");
				const stock = toNumber(row.stock);
				alerts.push({
					id: `low-stock-${String(row.id)}`,
					kind: "low_stock",
					severity: stock === 0 ? "high" : stock <= 1 ? "high" : "medium",
					title: `Low stock: ${name}`,
					detail: `Only ${stock} left in ${String(row.category ?? "stock")}`,
					date: null,
					href: "/app/stock",
				});
			}

			for (const row of contractRows) {
				const endDate = toDateISO(row.endDate);
				const days = daysUntil(endDate) ?? 0;
				alerts.push({
					id: `contract-${String(row.id)}`,
					kind: "contract",
					severity: days <= 7 ? "high" : "medium",
					title: `Contract expiring: ${String(row.productName ?? "")}`,
					detail:
						days < 0
							? `Expired ${Math.abs(days)} days ago`
							: days === 0
								? "Expires today"
								: `Expires in ${days} days`,
					date: formatDate(endDate),
					href: "/app/contracts",
				});
			}

			for (const row of maintenanceRows) {
				const dueDate = toDateISO(row.maintenanceDue);
				const days = daysUntil(dueDate) ?? 0;
				alerts.push({
					id: `maintenance-${String(row.serverID)}`,
					kind: "maintenance",
					severity: days < 0 ? "high" : days <= 7 ? "high" : "medium",
					title: `Server maintenance: ${String(row.name ?? "")}`,
					detail:
						days < 0
							? `Overdue by ${Math.abs(days)} days`
							: days === 0
								? "Due today"
								: `Due in ${days} days`,
					date: formatDate(dueDate),
					href: "/app/servers",
				});
			}

			for (const row of warrantyRows) {
				const warrantyDate = toDateISO(row.warrantyDate);
				const days = daysUntil(warrantyDate) ?? 0;
				alerts.push({
					id: `warranty-${String(row.id)}`,
					kind: "warranty",
					severity: days < 0 ? "high" : days <= 14 ? "medium" : "low",
					title: `Warranty expiring: ${String(row.deviceName ?? row.code ?? "")}`,
					detail:
						days < 0
							? `Expired ${Math.abs(days)} days ago`
							: days === 0
								? "Expires today"
								: `Expires in ${days} days`,
					date: formatDate(warrantyDate),
					href: "/app/assets",
				});
			}

			alerts.sort((a, b) => {
				const order = { high: 0, medium: 1, low: 2 };
				return order[a.severity] - order[b.severity];
			});

			return {
				kpis: {
					totalAssets: toNumber(kpi.totalAssets),
					totalProvide: toNumber(kpi.totalProvide),
					totalPurchase: toNumber(kpi.totalPurchase),
					totalStock: toNumber(kpi.totalStock),
					totalItems: toNumber(kpi.totalItems),
					totalEmployees: toNumber(kpi.totalEmployees),
					totalPrinters: toNumber(kpi.totalPrinters),
					totalServers: toNumber(kpi.totalServers),
				},
				assetsByType: typeRows.map((row) => ({
					type: String(row.type ?? "Unknown"),
					total: toNumber(row.total),
				})),
				stockByCategory: categoryRows.map((row) => ({
					category: String(row.category ?? "Other"),
					itemCount: toNumber(row.itemCount),
					stock: toNumber(row.stock),
				})),
				lowStock: lowStockRows.map((row) => ({
					id: toNumber(row.id),
					name: String(row.name ?? ""),
					brand: String(row.brand ?? ""),
					category: String(row.category ?? ""),
					stock: toNumber(row.stock),
				})),
				recentLogs: logRows.map((row) => ({
					id: toNumber(row.id),
					date: toDateISO(row.date) ?? "",
					user: toString(row.user),
					action: String(row.action ?? ""),
					node: String(row.node ?? ""),
					nodeID: toNumber(row.nodeID),
				})),
				recentAssets: assetRows.map((row) => ({
					code: String(row.code ?? ""),
					deviceName: toString(row.deviceName),
					type: toString(row.type),
				})),
				recentItems: itemRows.map((row) => ({
					id: toNumber(row.id),
					name: String(row.name ?? ""),
					category: String(row.category ?? ""),
					stock: toNumber(row.stock),
				})),
				alerts,
			};
		},
	),
});
