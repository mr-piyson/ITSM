import { DEFAULT_APP_URL } from "./build-config";

function stripTrailingSlash(url: string): string {
	return url.replace(/\/+$/, "");
}

export function resolveAppUrl(flag?: string): string {
	if (flag) {
		return stripTrailingSlash(flag);
	}
	return stripTrailingSlash(DEFAULT_APP_URL);
}
