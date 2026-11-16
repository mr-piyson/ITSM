import { createId } from "@paralleldrive/cuid2";
import { fileTypeFromBuffer } from "file-type";

import { computeSha256 } from "./hash.service";
import * as fileRepo from "./file.repository";
import { processImage } from "./image.service";
import * as storage from "./storage.service";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export type UploadResult = {
	id: string;
	filename: string;
	originalName: string;
	hash: string;
	storagePath: string;
	mime: string;
	extension: string;
	size: number;
	width: number | null;
	height: number | null;
};

function extensionFromMime(mime: string): string {
	const map: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/webp": "webp",
		"image/gif": "gif",
		"image/svg+xml": "svg",
		"image/bmp": "bmp",
		"image/tiff": "tiff",
		"image/heic": "heic",
		"application/pdf": "pdf",
		"text/plain": "txt",
		"text/csv": "csv",
		"application/zip": "zip",
		"application/json": "json",
		"application/msword": "doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"docx",
		"application/vnd.ms-excel": "xls",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	};
	if (map[mime]) return map[mime];
	const part = mime.split("/")[1] || "bin";
	return part.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

export async function uploadFile(file: File): Promise<UploadResult> {
	if (file.size > MAX_FILE_SIZE) {
		throw new Error("File size exceeds 10 MB limit");
	}

	const rawBuffer = Buffer.from(await file.arrayBuffer());

	const detected = await fileTypeFromBuffer(rawBuffer).catch(() => undefined);
	const mime = detected?.mime ?? file.type ?? "application/octet-stream";
	const extension = detected?.ext ?? extensionFromMime(mime);

	const hash = computeSha256(rawBuffer);
	const existing = await fileRepo.findByHash(hash);
	if (existing) {
		return {
			id: existing.id,
			filename: existing.filename,
			originalName: existing.originalName,
			hash: existing.hash,
			storagePath: existing.storagePath,
			mime: existing.mime,
			extension: existing.extension,
			size: existing.size,
			width: existing.width,
			height: existing.height,
		};
	}

	const { buffer: processedBuffer, metadata } = await processImage(
		rawBuffer,
		mime,
	);

	const filename = `${createId()}.${extension}`;
	const { storagePath } = await storage.write(processedBuffer, filename);

	const fileRecord = await fileRepo.createFile({
		id: createId(),
		filename,
		originalName: file.name || filename,
		hash,
		storagePath,
		mime,
		extension,
		size: processedBuffer.length,
		width: metadata?.width ?? null,
		height: metadata?.height ?? null,
	});

	return {
		id: fileRecord.id,
		filename: fileRecord.filename,
		originalName: fileRecord.originalName,
		hash: fileRecord.hash,
		storagePath: fileRecord.storagePath,
		mime: fileRecord.mime,
		extension: fileRecord.extension,
		size: fileRecord.size,
		width: fileRecord.width,
		height: fileRecord.height,
	};
}

export async function deleteUpload(fileId: string): Promise<void> {
	const result = await fileRepo.deleteFileIfOrphaned(fileId);
	if (result.deleted && result.storagePath) {
		await storage.remove(result.storagePath);
	}
}

export async function deleteUploadByStoragePath(
	storagePath: string,
): Promise<void> {
	const existing = await fileRepo.findByStoragePath(storagePath);
	if (!existing) {
		// idempotent: best-effort remove legacy/untracked files
		await storage.remove(storagePath);
		return;
	}
	await deleteUpload(existing.id);
}

export function storagePathToUrl(storagePath: string): string {
	return storagePath;
}
