const IMAGES_BASE = "http://iss.bfginternational.com/ISS/itemsImages";

export function imageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	// New file-upload module paths are served by /api/files via rewrite
	if (image.startsWith("/uploads/")) {
		return image;
	}
	if (image.startsWith("/api/files/")) {
		return image.replace(/^\/api\/files\//, "/uploads/");
	}
	if (image.startsWith("/api/image-proxy")) {
		return image;
	}
	if (image.startsWith("data:") || image.startsWith("blob:")) {
		return image;
	}
	const normalized = image.replace(/^http:\/(?!\/)/, "http://");
	if (/^https?:\/\//.test(normalized)) {
		return `/api/image-proxy?url=${encodeURIComponent(normalized)}`;
	}
	// Legacy: bare filename stored in DB -> proxy from external ISS host
	return `/api/image-proxy?url=${encodeURIComponent(`${IMAGES_BASE}/${normalized}`)}`;
}

