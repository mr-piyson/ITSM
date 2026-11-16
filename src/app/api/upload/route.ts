import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth.server";
import { uploadFile } from "@/server/services/file/upload.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy upload endpoint kept for backward compatibility.
 * New uploads use the file-upload module (DATA_DIR/uploads/YYYY/MM/<id>.<ext>)
 * and return a storagePath. Older clients expect `{ image: <filename> }`.
 */
export async function POST(request: Request) {
	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let file: File | null = null;
	try {
		const formData = await request.formData();
		const value = formData.get("file");
		file = value instanceof File ? value : null;
	} catch {
		return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
	}

	if (!file) {
		return NextResponse.json({ error: "Missing file" }, { status: 400 });
	}

	try {
		const result = await uploadFile(file);
		return NextResponse.json({
			image: result.storagePath,
			storagePath: result.storagePath,
			id: result.id,
			mime: result.mime,
			size: result.size,
			width: result.width,
			height: result.height,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Upload failed";
		const status =
			message.toLowerCase().includes("exceeds") ||
			message.toLowerCase().includes("size")
				? 413
				: 500;
		return NextResponse.json({ error: message }, { status });
	}
}

