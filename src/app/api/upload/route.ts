import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;

const IMAGE_SIGNATURES = [
	{
		ext: "png",
		signature: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	},
	{ ext: "jpg", signature: Buffer.from([0xff, 0xd8, 0xff]) },
] as const;

const UPLOAD_DIRS: Record<string, string> = {
	items: path.resolve(process.cwd(), "..", "ISS", "itemsImages"),
	printers: path.resolve(process.cwd(), "..", "ISS", "printersImages"),
};

function sniffImageExtension(buffer: Buffer): string | null {
	for (const { ext, signature } of IMAGE_SIGNATURES) {
		if (
			buffer.length >= signature.length &&
			buffer.subarray(0, signature.length).equals(signature)
		) {
			return ext;
		}
	}
	return null;
}

export async function POST(request: Request) {
	const user = await getUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let file: File | null = null;
	let dir: string | null = null;
	try {
		const formData = await request.formData();
		const value = formData.get("file");
		file = value instanceof File ? value : null;
		const dirValue = formData.get("dir");
		dir =
			typeof dirValue === "string" && dirValue.trim() !== ""
				? dirValue
				: "items";
	} catch {
		return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
	}

	if (!file) {
		return NextResponse.json({ error: "Missing file" }, { status: 400 });
	}
	const targetDir = UPLOAD_DIRS[dir];
	if (!targetDir) {
		return NextResponse.json(
			{ error: "Invalid upload directory" },
			{ status: 400 },
		);
	}
	if (file.size === 0 || file.size > MAX_SIZE) {
		return NextResponse.json(
			{ error: "Image must be between 1 byte and 5 MB" },
			{ status: 400 },
		);
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const extension = sniffImageExtension(buffer);
	if (!extension) {
		return NextResponse.json(
			{
				error:
					"Unsupported image format. Only PNG, JPG and JPEG are supported.",
			},
			{ status: 400 },
		);
	}

	const hash = createHash("sha256").update(buffer).digest("hex");
	const fileName = `${hash}.${extension}`;
	await mkdir(targetDir, { recursive: true });
	await writeFile(path.join(targetDir, fileName), buffer);

	return NextResponse.json({ image: fileName });
}
