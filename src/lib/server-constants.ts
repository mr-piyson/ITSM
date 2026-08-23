export function serverImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `/ISS/itemsImages/${image}`;
}

export const SERVER_TYPES = ["virtual", "physical"] as const;
export const SERVER_STATUSES = ["active", "discontinued"] as const;
export const VM_HOSTS = ["VMHost 1", "VMHost 2"] as const;
export const BACKUP_STATUSES = ["yes", "no"] as const;
export const MAINTENANCE_PERIODS = ["30days", "60days", "90days"] as const;

export type MaintenancePeriod = (typeof MAINTENANCE_PERIODS)[number];

export function periodDays(period: MaintenancePeriod): number {
	switch (period) {
		case "30days":
			return 30;
		case "60days":
			return 60;
		case "90days":
			return 90;
	}
}

export function periodLabel(period: MaintenancePeriod): string {
	return `${periodDays(period)} Days`;
}

// Adds N days to a YYYY-MM-DD string and returns YYYY-MM-DD.
export function addDays(dateString: string, days: number): string {
	const [year, month, day] = dateString.split("-").map(Number);
	if (!year || !month || !day) {
		return dateString;
	}
	const date = new Date(Date.UTC(year, month - 1, day));
	date.setUTCDate(date.getUTCDate() + days);
	return [
		date.getUTCFullYear(),
		String(date.getUTCMonth() + 1).padStart(2, "0"),
		String(date.getUTCDate()).padStart(2, "0"),
	].join("-");
}

export const SERVER_ACTION_TYPES = [
	"Cleaned",
	"Decreased",
	"Deleted",
	"Disabled",
	"Enabled",
	"Increased",
	"Installed",
	"Restart",
	"Updated",
	"Upgrade",
	"Uninstalled",
] as const;

// Tailwind badge classes per server action type (mirrors the legacy log styling)
export const SERVER_ACTION_BADGE: Record<string, string> = {
	Cleaned: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
	Decreased:
		"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
	Deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
	Disabled:
		"bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
	Enabled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
	Increased: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100",
	Installed:
		"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
	Restart: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
	Updated:
		"bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
	Upgrade:
		"bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100",
	Uninstalled: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100",
};

export function serverActionBadge(type?: string | null): string {
	if (!type) {
		return "bg-muted text-muted-foreground";
	}
	return SERVER_ACTION_BADGE[type] ?? "bg-muted text-muted-foreground";
}

type ServerStatusBadgeInput = {
	serverStatus: string | null | undefined;
	maintenanceDue: string | null | undefined;
};

export type ServerStatusBadge = {
	label: string;
	className: string;
};

function todayDateString(): string {
	const now = new Date();
	return [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
	].join("-");
}

// Mirrors serverDetails.php: overdue maintenance wins over the status tag.
export function serverStatusBadge({
	serverStatus,
	maintenanceDue,
}: ServerStatusBadgeInput): ServerStatusBadge {
	if (
		maintenanceDue &&
		/^\d{4}-\d{2}-\d{2}/.test(maintenanceDue) &&
		maintenanceDue.slice(0, 10) < todayDateString()
	) {
		return {
			label: "Maintenance Required",
			className:
				"bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
		};
	}
	if (serverStatus === "active") {
		return {
			label: "Active",
			className:
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
		};
	}
	return {
		label: serverStatus ? capitalize(serverStatus) : "-",
		className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
	};
}

export function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

// Formats an ISO-ish datetime string as DD-MM-YYYY HH:mm (legacy log format).
export function formatServerActionDate(value: string | null): string {
	if (!value) {
		return "-";
	}
	const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value);
	if (!match) {
		return value;
	}
	const [, year, month, day, hour, minute] = match;
	let hours = Number(hour);
	const suffix = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	if (hours === 0) {
		hours = 12;
	}
	return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minute} ${suffix}`;
}

export function formatServerDate(value: string | null): string {
	if (!value) {
		return "-";
	}
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) {
		return value;
	}
	const [, year, month, day] = match;
	return `${month}-${day}-${year}`;
}
