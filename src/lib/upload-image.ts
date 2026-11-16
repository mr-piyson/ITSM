const ALLOWED_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"image/svg+xml",
];
const ALLOWED_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;
const MAX_SIZE = 10 * 1024 * 1024;

export type UploadDir = "items" | "printers";

export function validateImageFile(file: File): string | null {
	if (file.size === 0 || file.size > MAX_SIZE) {
		return "Image must be between 1 byte and 10 MB";
	}
	// allow by type or extension (some browsers report generic types)
	if (
		file.type &&
		!file.type.startsWith("image/") &&
		!ALLOWED_TYPES.includes(file.type) &&
		!ALLOWED_EXT.test(file.name)
	) {
		return "Unsupported image file";
	}
	return null;
}

export type UploadResult = {
	id?: string;
	storagePath: string;
	image: string;
	originalName?: string;
	mime?: string;
	width?: number | null;
	height?: number | null;
};

export async function uploadImageFile(
	file: File,
	dir: UploadDir = "items",
): Promise<string> {
	const result = await uploadImage(file, dir);
	return result.storagePath;
}

export async function uploadImage(
	file: File,
	dir: UploadDir = "items",
): Promise<UploadResult> {
	const error = validateImageFile(file);
	if (error) {
		throw new Error(error);
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("dir", dir);

	let response = await fetch("/api/uploads", {
		method: "POST",
		body: formData,
	});

	// Fallback to legacy route if new endpoint unavailable
	if (response.status === 404) {
		response = await fetch("/api/upload", {
			method: "POST",
			body: formData,
		});
	}

	const result = (await response.json().catch(() => ({}))) as Record<
		string,
		any
	>;
	if (!response.ok) {
		throw new Error(result.error ?? "Image upload failed");
	}

	const storagePath =
		result.storagePath || result.image || result.path || result.url;
	if (!storagePath || typeof storagePath !== "string") {
		throw new Error(result.error ?? "Image upload failed");
	}

	return {
		...result,
		storagePath,
		image: storagePath,
	} as UploadResult;
}

