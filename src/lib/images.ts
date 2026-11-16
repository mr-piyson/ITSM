function encodePath(value: string): string {
	return value
		.split(/[\\/]+/)
		.filter(Boolean)
		.map((part) => encodeURIComponent(part))
		.join("/");
}

/**
 * Resolve any stored image reference to a URL served by the file module.
 *
 * New uploads store `/uploads/YYYY/MM/<id>.<ext>`. Legacy rows store bare
 * filenames (and occasionally old paths). Both go through `/api/files`, which
 * resolves legacy names against `DATA_DIR/migration-manifest.csv` and the
 * legacy storage roots.
 */
export function imageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	const value = image.trim();
	if (!value) {
		return null;
	}
	if (value.startsWith("data:") || value.startsWith("blob:")) {
		return value;
	}
	if (value.startsWith("/api/files/") || value.startsWith("/api/image-proxy")) {
		return value;
	}
	if (value.startsWith("/uploads/")) {
		return `/api/files/${encodePath(value.slice("/uploads/".length))}`;
	}
	const normalized = value.replace(/^http:\/(?!\/)/, "http://");
	if (/^https?:\/\//i.test(normalized)) {
		return `/api/image-proxy?url=${encodeURIComponent(normalized)}`;
	}
	// Legacy bare filename or path from the old ISS image storage.
	return `/api/files/${encodePath(normalized)}`;
}
