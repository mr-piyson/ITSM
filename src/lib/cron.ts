import { NextResponse } from "next/server";

/**
 * Validates the CRON_SECRET guard used by /api/cron routes.
 * Returns a JSON response to reject the request, or null when authorized.
 */
export function checkCronSecret(request: Request): NextResponse | null {
	const secret = process.env.CRON_SECRET;
	if (!secret) {
		return null;
	}
	const url = new URL(request.url);
	const provided =
		request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
		url.searchParams.get("secret") ??
		"";
	if (provided === secret) {
		return null;
	}
	return NextResponse.json(
		{ ok: false, error: "Unauthorized" },
		{ status: 401 },
	);
}

export function todayDateString(): string {
	return new Date().toISOString().slice(0, 10);
}

export function formatDate(value: unknown): string {
	if (!value) {
		return "-";
	}
	const date = new Date(String(value).replace(" ", "T"));
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
