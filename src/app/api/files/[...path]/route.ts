import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth.server";
import * as storage from "@/server/services/file/storage.service";

export const runtime = "nodejs";

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

	const storagePath = `/uploads/${parts.join("/")}`;
	const buffer = await storage.readByStoragePath(storagePath);
	if (!buffer) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const detected = await fileTypeFromBuffer(buffer).catch(() => undefined);
	const contentType = detected?.mime ?? "application/octet-stream";
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
