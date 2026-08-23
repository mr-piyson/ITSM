export const PURCHASE_CURRENCIES = ["BHD", "USD", "EUR"] as const;

export const PURCHASE_BUYERS = ["IT", "I4"] as const;

export function purchaseToday(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatPurchaseDate(date?: string | null): string {
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
