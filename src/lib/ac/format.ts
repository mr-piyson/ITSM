/**
 * Display helpers for access control rows.
 *
 * The data layer reads DATETIME columns with `dateStrings: true`, so values
 * arrive as `"2024-01-05 09:00:00"`. Safari refuses to parse that shape in
 * `new Date()`, hence the manual parse.
 */

import { AC_DEFAULT_DEVICE_PORT } from "./constants";

const MYSQL_DATETIME =
	/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

export function parseAcDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const match = MYSQL_DATETIME.exec(value.trim());
	if (match) {
		return new Date(
			Number(match[1]),
			Number(match[2]) - 1,
			Number(match[3]),
			Number(match[4]),
			Number(match[5]),
			Number(match[6] ?? 0),
		);
	}
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatAcDateTime(
	value: string | null | undefined,
	fallback = "—",
): string {
	const date = parseAcDate(value);
	if (!date) return fallback;
	return date.toLocaleString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatAcDate(
	value: string | null | undefined,
	fallback = "—",
): string {
	const date = parseAcDate(value);
	if (!date) return fallback;
	return date.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function formatAcNumber(value: number | null | undefined): string {
	if (value === null || value === undefined || Number.isNaN(value)) return "—";
	return value.toLocaleString();
}

/** A missing validity window means the grant never expires. */
export function isAcExpired(
	endTime: string | null | undefined,
	now: Date = new Date(),
): boolean {
	const date = parseAcDate(endTime);
	if (!date) return false;
	return date.getTime() < now.getTime();
}

export type AcValidityState = "active" | "expired" | "open";

/** Validity window state: expired, active, or open ended. */
export function acValidityState(
	endTime: string | null | undefined,
	now: Date = new Date(),
): AcValidityState {
	if (!endTime) return "open";
	return isAcExpired(endTime, now) ? "expired" : "active";
}

/** `ip:port`, falling back to the legacy default port. */
export function acDeviceAddress(device: {
	ip: string;
	port?: number | null;
}): string {
	return `${device.ip}:${device.port ?? AC_DEFAULT_DEVICE_PORT}`;
}
