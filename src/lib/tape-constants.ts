export const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export type TapeMonth = (typeof MONTHS)[number];

export const TAPE_LOCATIONS = ["IT", "Production"] as const;

export type TapeLocation = (typeof TAPE_LOCATIONS)[number];

const LOCATION_LABELS: Record<TapeLocation, string> = {
	IT: "IT - Server Room",
	Production: "Production - Factory 2",
};

export function locationLabel(location?: string | null): string {
	if (!location) {
		return "-";
	}
	return (
		LOCATION_LABELS[location as TapeLocation] ??
		location.charAt(0).toUpperCase() + location.slice(1)
	);
}

export function monthIndex(month?: string | null): number {
	if (!month) {
		return Number.POSITIVE_INFINITY;
	}
	const index = MONTHS.indexOf(month as TapeMonth);
	return index === -1 ? Number.POSITIVE_INFINITY : index + 1;
}

// Formats an ISO-ish datetime string as DD-MM-YYYY hh:mm am/pm (legacy log format).
export function formatTapeDateTime(value?: string | null): string {
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

export type TapeStatusBadge = {
	label: string;
	className: string;
};

export function tapeStatusBadge(
	status?: string | null,
	hasAssignment?: boolean,
): TapeStatusBadge {
	if (status === "Online") {
		return {
			label: "Online",
			className:
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
		};
	}
	if (status === "Offline") {
		return {
			label: "Offline",
			className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
		};
	}
	if (hasAssignment) {
		return {
			label: "-",
			className: "bg-muted text-muted-foreground",
		};
	}
	return {
		label: "Unassigned",
		className:
			"bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
	};
}

type SortableTape = {
	year: string | null;
	month: string | null;
	sequenceNum: number | null;
};

function assigned(tape: SortableTape): boolean {
	return Boolean(tape.year && tape.month);
}

// Mirrors the legacy rearrange(): ascending year -> month -> sequence.
// Tapes without an assignment are kept last.
export function compareTapes<T extends SortableTape>(a: T, b: T): number {
	const aAssigned = assigned(a);
	const bAssigned = assigned(b);
	if (aAssigned !== bAssigned) {
		return aAssigned ? -1 : 1;
	}
	if (!aAssigned) {
		return 0;
	}
	const yearDiff = Number(a.year) - Number(b.year);
	if (yearDiff !== 0) {
		return yearDiff;
	}
	const monthDiff = monthIndex(a.month) - monthIndex(b.month);
	if (monthDiff !== 0) {
		return monthDiff;
	}
	return (a.sequenceNum ?? 99) - (b.sequenceNum ?? 99);
}

export function currentYear(): number {
	return new Date().getFullYear();
}
