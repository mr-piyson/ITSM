export function imageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (image.startsWith("/api/image-proxy")) {
		return image;
	}
	if (/^https?:\/\//.test(image)) {
		return `/api/image-proxy?url=${encodeURIComponent(image)}`;
	}
	return `/api/image-proxy?url=${encodeURIComponent(`http://iss.bfginternational.com/ISS/itemsImages/${image}`)}`;
}
