export const ASSET_TYPES = [
	"Desktop",
	"Laptop",
	"Monitor",
	"Tablet",
	"CCTV",
	"Face Access",
	"Wifi Access Point",
	"TV",
	"Switches",
	"Blade Server",
	"UPS",
	"Tape Drive",
	"Firewall",
	"Raspberry Pi",
	"Telephone",
	"P2P Network",
	"AC",
	"Display Projector",
	"Router",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_LOCATIONS = [
	"Head Office",
	"Factory 1",
	"Factory 2",
	"Factory 3",
	"Factory 4",
	"Factory 5 - Nass",
	"IT Stores",
] as const;

export const ASSET_DEPARTMENTS = [
	"After Sales",
	"Engineering",
	"Finance",
	"H2O",
	"HR",
	"Health & Safety",
	"I4",
	"IT",
	"Infrastructure",
	"Logistics",
	"Management",
	"Marketing",
	"Planning",
	"Process",
	"Projects",
	"SCM",
	"Sales",
	"Secretary",
	"Wind Energy",
	"Bids",
	"Business Development",
	"Tooling",
	"Quality",
	"Production",
	"Maintenance",
	"Final Quality",
	"Packing",
	"Resin Stores",
	"Paint Stores",
	"Gelcoating",
	"Store",
	"ABB",
	"Metal",
] as const;

// Tailwind badge classes per asset type (mirrors the W3 color tags in ISS/assets.php)
export const ASSET_TYPE_BADGE: Record<string, string> = {
	Desktop: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
	Laptop: "bg-neutral-500 text-white dark:bg-neutral-700",
	Monitor: "bg-amber-700 text-white dark:bg-amber-900",
	"Face Access": "bg-slate-500 text-white dark:bg-slate-700",
	CCTV: "bg-lime-200 text-lime-900 dark:bg-lime-900 dark:text-lime-100",
	"Wifi Access Point":
		"bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
	Switches: "bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-100",
	"Blade Server":
		"bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100",
	UPS: "bg-lime-200 text-lime-900 dark:bg-lime-900 dark:text-lime-100",
	"Tape Drive":
		"bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
	Firewall: "bg-yellow-300 text-yellow-950 dark:bg-yellow-800",
	Tablet:
		"bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
	TV: "bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100",
	Telephone:
		"bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
	"P2P Network":
		"bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
	AC: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
	"Display Projector":
		"bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
	Router: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100",
};

// Chart-friendly hex colors per asset type (mirrors the ASSET_TYPE_BADGE hues)
export const ASSET_TYPE_COLOR: Record<string, string> = {
	Desktop: "#14b8a6",
	Laptop: "#737373",
	Monitor: "#b45309",
	"Face Access": "#64748b",
	CCTV: "#84cc16",
	"Wifi Access Point": "#eab308",
	Switches: "#0ea5e9",
	"Blade Server": "#06b6d4",
	UPS: "#84cc16",
	"Tape Drive": "#eab308",
	Firewall: "#facc15",
	Tablet: "#f97316",
	TV: "#6366f1",
	Telephone: "#a855f7",
	"P2P Network": "#eab308",
	AC: "#ef4444",
	"Display Projector": "#3b82f6",
	Router: "#22c55e",
};

export function assetTypeColor(type?: string | null): string {
	if (!type) {
		return "#64748b";
	}
	return ASSET_TYPE_COLOR[type] ?? "#64748b";
}

export function assetTypeBadge(type?: string | null): string {
	if (!type) {
		return "bg-muted text-muted-foreground";
	}
	return ASSET_TYPE_BADGE[type] ?? "bg-muted text-muted-foreground";
}

export function assetImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `/ISS/itemsImages/${image}`;
}

export const ASSET_CODE_LENGTH = 10;

export const ASSET_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
