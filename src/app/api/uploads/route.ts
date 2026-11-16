import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth.server";
import {
	deleteUpload,
	deleteUploadByStoragePath,
	uploadFile,
} from "@/server/services/file/upload.service";

export const runtime = "nodejs";

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
		return NextResponse.json({ error: "No file field provided" }, { status: 400 });
	}

	try {
		const result = await uploadFile(file);
		return NextResponse.json({
			message: "File uploaded successfully",
			...result,
			// compatibility fields for existing clients
			image: result.storagePath,
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

export async function DELETE(request: Request) {
	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const fileId = url.searchParams.get("fileId");
	const storagePath = url.searchParams.get("storagePath");

	try {
		if (fileId) {
			await deleteUpload(fileId);
		} else if (storagePath) {
			await deleteUploadByStoragePath(storagePath);
		} else {
			return NextResponse.json(
				{ error: "fileId or storagePath is required" },
				{ status: 400 },
			);
		}
		return NextResponse.json({ message: "File deleted successfully" });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Delete failed";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
