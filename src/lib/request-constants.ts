export const REQUEST_STATUSES = [
	"pending",
	"accepted",
	"declined",
	"completed",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/**
 * Values stored in `requests.kind`. `change` is kept only for rows created
 * before the multi-kind form existed; new submissions use the other three.
 */
export const REQUEST_KINDS = ["change", "problem", "asset", "it-request"] as const;

export const PROBLEM_CATEGORIES = ["software", "hardware"] as const;

export type ProblemCategory = (typeof PROBLEM_CATEGORIES)[number];

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

export function kindLabel(kind: string | null): string {
	switch (kind) {
		case "problem":
			return "Problem Request";
		case "asset":
			return "Assets Request";
		case "it-request":
			return "IT Request Form";
		case "change":
			return "Change Request";
		default:
			return kind ? capitalize(kind) : "Unknown";
	}
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
