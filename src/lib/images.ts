const IMAGES_BASE = "http://iss.bfginternational.com/ISS/itemsImages";

export function imageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
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
	return `/api/image-proxy?url=${encodeURIComponent(`${IMAGES_BASE}/${normalized}`)}`;
}
