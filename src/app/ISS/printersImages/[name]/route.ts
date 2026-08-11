import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const PRINTERS_DIR = path.join(process.cwd(), "ISS", "printersImages");

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

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;

	if (!isSafeName(name)) {
		return new NextResponse("Not found", { status: 404 });
	}

	const base = path.resolve(PRINTERS_DIR);
	const resolved = path.resolve(base, name);
	if (!resolved.startsWith(`${base}${path.sep}`)) {
		return new NextResponse("Not found", { status: 404 });
	}

	try {
		const data = await readFile(resolved);
		return new NextResponse(data, {
			headers: {
				"Content-Type": contentType(name),
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch {
		return new NextResponse("Not found", { status: 404 });
	}
}
