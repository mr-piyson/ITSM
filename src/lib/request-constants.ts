export const REQUEST_STATUSES = [
	"pending",
	"accepted",
	"declined",
	"completed",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_PRIORITIES = ["low", "medium", "high"] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const REQUEST_PAGE_TYPES = ["existing", "new"] as const;

export type RequestPageType = (typeof REQUEST_PAGE_TYPES)[number];

export const REQUEST_PAGES = [
	"assets",
	"stock",
	"printers",
	"employees",
	"vendors",
	"other",
] as const;

export type RequestPage = (typeof REQUEST_PAGES)[number];

export const REQUEST_MODIFICATIONS = [
	"add",
	"delete",
	"modify",
	"other",
] as const;

export type RequestModification = (typeof REQUEST_MODIFICATIONS)[number];

export function statusLabel(status: string | null): string {
	if (!status) {
		return "Unknown";
	}
	return status.charAt(0).toUpperCase() + status.slice(1);
}

export function priorityLabel(priority: string | null): string {
	if (!priority) {
		return "Low";
	}
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function pageLabel(
	pgtype: string | null,
	slctname: string | null,
	newpg: string | null,
	otherpg: string | null,
): string {
	const pageType = pgtype === "new" ? "New Page" : "Existing Page";
	if (slctname === "other") {
		return `${pageType}: ${otherpg || "Other"}`;
	}
	if (pgtype === "new") {
		return `New Page: ${newpg || "Unnamed"}`;
	}
	return `${pageType}: ${capitalize(slctname)}`;
}

export function modificationLabel(modifi: string | null): string {
	switch (modifi) {
		case "add":
			return "Add Elements";
		case "delete":
			return "Delete Elements";
		case "modify":
			return "Modify Elements";
		case "other":
			return "Other";
		default:
			return capitalize(modifi);
	}
}

export function capitalize(value: string | null): string {
	if (!value) {
		return "";
	}
	return value.charAt(0).toUpperCase() + value.slice(1);
}
