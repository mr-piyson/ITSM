/**
 * Client-safe helper for access control face photos.
 *
 * `findAcUserPhoto()` returns a web-relative path (`storage/<model>/<md5>/…`).
 * The legacy tree is served by the intranet host, not by this app, so the
 * browser must go through the existing image proxy — see
 * `src/app/api/image-proxy/route.ts`, which allowlists this hostname.
 *
 * `imageUrl()` from `@/lib/images` is not usable here: it prefixes relative
 * paths with the ISS host.
 */

const INTRANET_ORIGIN = "http://intranet.bfginternational.com:88";

/** Prefixes a `storage/...` path with the intranet origin and the proxy route. */
export function acPhotoSrc(path: string | null | undefined): string | null {
	if (!path) return null;
	const relative = path.replace(/^\/+/, "");
	if (!relative) return null;
	return `/api/image-proxy?url=${encodeURIComponent(`${INTRANET_ORIGIN}/${relative}`)}`;
}

/**
 * Picks the `_m` variant when the asset has one, falling back to the full
 * image so a missing thumbnail still renders.
 */
export function acPhotoVariantSrc(
	asset: { file: string; thumbnail: string | null } | null | undefined,
	variant: "full" | "medium" = "medium",
): string | null {
	if (!asset) return null;
	return acPhotoSrc(
		variant === "medium" ? (asset.thumbnail ?? asset.file) : asset.file,
	);
}
