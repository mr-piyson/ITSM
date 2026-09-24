const ALLOWED_TYPES = ["image/png", "image/jpeg"];
const ALLOWED_EXT = /\.(png|jpe?g)$/i;
const MAX_SIZE = 5 * 1024 * 1024;

export type UploadDir = "items" | "printers";

export function validateImageFile(file: File): string | null {
	if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXT.test(file.name)) {
		return "Only PNG, JPG and JPEG images are supported";
	}
	if (file.size === 0 || file.size > MAX_SIZE) {
		return "Image must be between 1 byte and 5 MB";
	}
	return null;
}

export async function uploadImageFile(
	file: File,
	dir: UploadDir = "items",
): Promise<string> {
	const error = validateImageFile(file);
	if (error) {
		throw new Error(error);
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("dir", dir);

	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
	});

	const result = (await response.json()) as {
		image?: string;
		error?: string;
	};
	if (!response.ok || !result.image) {
		throw new Error(result.error ?? "Image upload failed");
	}
	return result.image;
}
