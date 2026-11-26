import type { Route } from "next";

/** Destinations allowed after sign-in. Never redirect to arbitrary `next` values. */
export const LOGIN_DESTINATIONS = [
	"/itsm",
	"/documents/requests",
	"/documents/requests/problem",
	"/documents/requests/asset",
	"/documents/it-request",
] as const satisfies readonly Route[];

export type LoginDestination = (typeof LOGIN_DESTINATIONS)[number];

export const DEFAULT_LOGIN_DESTINATION: LoginDestination = "/itsm";

export const MICROSOFT_NEXT_COOKIE = "microsoft_auth_next";

export function resolveLoginDestination(
	value: string | null | undefined,
	fallback: LoginDestination = DEFAULT_LOGIN_DESTINATION,
): LoginDestination {
	return LOGIN_DESTINATIONS.find((destination) => destination === value) ?? fallback;
}
