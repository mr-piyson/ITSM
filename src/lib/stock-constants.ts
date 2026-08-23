export const LOW_STOCK_THRESHOLD = 3;

// Mirrors the legacy ISS item category list (ISS/newItem.php)
export const ITEM_CATEGORIES = [
	"IT Stationery and Accessories",
	"Hardware",
	"Toners/Rolls",
] as const;

export function itemImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `/ISS/itemsImages/${image}`;
}

export type StockStatus = "out" | "low" | "ok";

export function stockStatus(stock: number): StockStatus {
	if (stock <= 0) {
		return "out";
	}
	if (stock <= LOW_STOCK_THRESHOLD) {
		return "low";
	}
	return "ok";
}

export function stockBadgeClass(stock: number): string {
	switch (stockStatus(stock)) {
		case "out":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
		case "low":
			return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
		default:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
	}
}

export function stockStatusLabel(stock: number): string {
	switch (stockStatus(stock)) {
		case "out":
			return "Out of stock";
		case "low":
			return "Low stock";
		default:
			return "In stock";
	}
}

export function formatStockDate(date?: string | null): string {
	if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return "-";
	}
	const [year, month, day] = date.split("-").map(Number);
	const parsed = new Date(year, month - 1, day);
	if (Number.isNaN(parsed.getTime())) {
		return date;
	}
	return parsed.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
