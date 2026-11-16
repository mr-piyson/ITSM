import sharp from "sharp";

export type ImageMetadata = {
	width: number;
	height: number;
};

export type ProcessImageResult = {
	buffer: Buffer;
	metadata: ImageMetadata | null;
};

function isOptimizableImage(mime: string) {
	return (
		mime === "image/jpeg" ||
		mime === "image/jpg" ||
		mime === "image/png" ||
		mime === "image/webp"
	);
}

export async function processImage(
	buffer: Buffer,
	mime: string,
): Promise<ProcessImageResult> {
	if (!mime.startsWith("image/") || mime === "image/svg+xml") {
		return { buffer, metadata: null };
	}

	const image = sharp(buffer, { failOn: "none" }).rotate();
	const meta = await image.metadata();
	const metadata =
		meta.width && meta.height
			? { width: meta.width, height: meta.height }
			: null;

	if (!isOptimizableImage(mime)) {
		return { buffer, metadata };
	}

	try {
		let pipeline = sharp(buffer, { failOn: "none" }).rotate();
		if (mime === "image/jpeg" || mime === "image/jpg") {
			pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
		} else if (mime === "image/png") {
			pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
		} else if (mime === "image/webp") {
			pipeline = pipeline.webp({ quality: 80 });
		}
		const optimized = await pipeline.toBuffer();
		return { buffer: optimized, metadata };
	} catch {
		return { buffer, metadata };
	}
}
