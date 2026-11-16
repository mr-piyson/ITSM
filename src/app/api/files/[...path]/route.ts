import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth.server";
import * as storage from "@/server/services/file/storage.service";

export const runtime = "nodejs";

const MIME_BY_EXTENSION: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	avif: "image/avif",
	bmp: "image/bmp",
	svg: "image/svg+xml",
	ico: "image/x-icon",
	tif: "image/tiff",
	tiff: "image/tiff",
	pdf: "application/pdf",
};

function extensionMime(name: string | undefined): string | null {
	if (!name) return null;
	const extension = name.split(".").pop()?.toLowerCase();
	return extension ? (MIME_BY_EXTENSION[extension] ?? null) : null;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { path: segments } = await params;
	const parts = (segments || [])
		.flatMap((s) => s.split(/[\\/]+/))
		.filter((p) => p && p !== ".");

	if (parts.length === 0 || parts.some((p) => p === "..")) {
		return NextResponse.json({ error: "Invalid path" }, { status: 400 });
	}

	// New uploads store `/uploads/...`; legacy rows store bare filenames that
	// the storage service resolves through the migration manifest.
	const joined = parts.join("/");
	const candidates = joined.startsWith("uploads/")
		? [`/${joined}`]
		: [`/uploads/${joined}`, `/${joined}`];

	let buffer: Buffer | null = null;
	for (const candidate of candidates) {
		buffer = await storage.readByStoragePath(candidate);
		if (buffer) break;
	}
	if (!buffer) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const detected = await fileTypeFromBuffer(buffer).catch(() => undefined);
	const contentType =
		detected?.mime ??
		extensionMime(parts[parts.length - 1]) ??
		"application/octet-stream";
	const body = new Uint8Array(buffer);

	return new NextResponse(body, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			"Content-Length": String(buffer.byteLength),
			"Cache-Control": "private, max-age=86400",
			"Content-Disposition": "inline",
		},
	});
}
