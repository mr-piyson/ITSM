import { parseAsString } from "nuqs";

// Create dates at local midnight (matching Calendar/report behavior)
// nuqs' parseAsIsoDate uses new Date("YYYY-MM-DD") which creates UTC midnight,
// causing timezone drift in MySQL datetime comparisons.
const parseAsLocalDate = {
	parse: (v: string) => {
		const [year, month, day] = v.slice(0, 10).split("-").map(Number);
		const date = new Date(year, month - 1, day);
		return date.valueOf() === date.valueOf() ? date : null;
	},
	serialize: (v: Date) => {
		const y = v.getFullYear();
		const m = String(v.getMonth() + 1).padStart(2, "0");
		const d = String(v.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	},
	eq: (a: Date, b: Date) => a.valueOf() === b.valueOf(),
};

export const fromParam = parseAsLocalDate;
export const toParam = parseAsLocalDate;

// gate value is a string, defaulting to "0"
export const gateParam = parseAsString.withDefault("0");

// Convert a Date to a YYYY-MM-DD string using local time components.
// This avoids timezone drift when Date objects are serialized through tRPC
// (which uses toISOString() → UTC), causing the date to shift by a day
// in MySQL DATE comparisons.
export const toDateString = (d: Date): string => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
};
