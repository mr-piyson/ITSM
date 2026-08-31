export function printerImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `/ISS/itemsImages/${image}`;
}

export const PRINTER_ACTION_TYPES = [
	"Replaced",
	"Provided",
	"Checked",
	"Serviced",
	"Cleaned",
	"Recieved",
] as const;

// Tailwind badge classes per printer action type (mirrors the W3 color tags in printerDetails.php)
export const PRINTER_ACTION_BADGE: Record<string, string> = {
	Replaced: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
	Provided:
		"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
	Checked:
		"bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
	Serviced: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
	Cleaned: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
	Recieved:
		"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
};

export function printerActionBadge(type?: string | null): string {
	if (!type) {
		return "bg-muted text-muted-foreground";
	}
	return PRINTER_ACTION_BADGE[type] ?? "bg-muted text-muted-foreground";
}

export function isTonerAction(type?: string | null): boolean {
	return type === "Replaced" || type === "Provided";
}
