import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const PRIMARY_DIR = path.join(process.cwd(), "ISS", "itemsImages");
const FALLBACK_DIR = path.join(process.cwd(), "public", "itemsImages");
const REMOTE_BASE =
	(process.env.ISS_IMAGE_URL || "http://172.18.1.137").replace(/\/+$/, "") +
	"/ISS/itemsImages";

const MIME_TYPES: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".bmp": "image/bmp",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
};

function contentType(name: string): string {
	return (
		MIME_TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream"
	);
}

function isSafeName(name: string): boolean {
	return name.length > 0 && name.length <= 200 && /^[\w.+\- ]+$/.test(name);
}

function resolveWithin(dir: string, name: string): string | null {
	const base = path.resolve(dir);
	const resolved = path.resolve(base, name);
	if (!resolved.startsWith(`${base}${path.sep}`)) {
		return null;
	}
	return resolved;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;

	if (!isSafeName(name)) {
		return new NextResponse("Not found", { status: 404 });
	}

	const type = contentType(name);

	for (const dir of [PRIMARY_DIR, FALLBACK_DIR]) {
		const resolved = resolveWithin(dir, name);
		if (!resolved) {
			continue;
		}
		try {
			const data = await readFile(resolved);
			return new NextResponse(data, {
				headers: {
					"Content-Type": type,
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			});
		} catch {
			// file not found in this directory, try the next one
		}
	}

	try {
		const remote = await fetch(
			`${REMOTE_BASE}/${encodeURIComponent(name)}`,
			{ cache: "no-store" },
		);
		if (remote.ok) {
			const data = await remote.arrayBuffer();
			return new NextResponse(data, {
				headers: {
					"Content-Type": type,
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			});
		}
	} catch {
		// remote unavailable, fall through to 404
	}

	return new NextResponse("Not found", { status: 404 });
}
