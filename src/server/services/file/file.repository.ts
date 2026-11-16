import type { ResultSetHeader, RowDataPacket } from "mysql2";

import db from "@/lib/database";

export type FileRecord = {
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
	createdAt: Date;
};

type FileRow = RowDataPacket & {
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
	createdAt: Date;
};

function toRecord(row: FileRow): FileRecord {
	return {
		id: row.id,
		filename: row.filename,
		originalName: row.originalName,
		hash: row.hash,
		storagePath: row.storagePath,
		mime: row.mime,
		extension: row.extension,
		size: Number(row.size),
		width: row.width == null ? null : Number(row.width),
		height: row.height == null ? null : Number(row.height),
		createdAt: row.createdAt,
	};
}

export async function findByHash(hash: string): Promise<FileRecord | null> {
	const [rows] = await db.iss.query<FileRow[]>(
		"SELECT * FROM ISS.File WHERE hash = ? LIMIT 1",
		[hash],
	);
	return rows[0] ? toRecord(rows[0]) : null;
}

export async function findById(id: string): Promise<FileRecord | null> {
	const [rows] = await db.iss.query<FileRow[]>(
		"SELECT * FROM ISS.File WHERE id = ? LIMIT 1",
		[id],
	);
	return rows[0] ? toRecord(rows[0]) : null;
}

export async function findByStoragePath(
	storagePath: string,
): Promise<FileRecord | null> {
	const [rows] = await db.iss.query<FileRow[]>(
		"SELECT * FROM ISS.File WHERE storagePath = ? LIMIT 1",
		[storagePath],
	);
	return rows[0] ? toRecord(rows[0]) : null;
}

export async function createFile(data: {
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
}): Promise<FileRecord> {
	await db.iss.execute(
		`INSERT INTO ISS.File (id, filename, originalName, hash, storagePath, mime, extension, size, width, height)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			data.id,
			data.filename,
			data.originalName,
			data.hash,
			data.storagePath,
			data.mime,
			data.extension,
			data.size,
			data.width,
			data.height,
		],
	);
	const created = await findById(data.id);
	if (!created) throw new Error("Failed to create file record");
	return created;
}

export async function deleteFileById(id: string): Promise<void> {
	await db.iss.execute("DELETE FROM ISS.File WHERE id = ?", [id]);
}

export type AttachmentRecord = {
	id: string;
	fileId: string;
	entityType: string;
	entityId: string;
	field: string | null;
	label: string | null;
	uploadedById: string | null;
	organizationId: string;
	createdAt: Date;
	file?: FileRecord;
};

type AttachmentRow = RowDataPacket & {
	id: string;
	fileId: string;
	entityType: string;
	entityId: string;
	field: string | null;
	label: string | null;
	uploadedById: string | null;
	organizationId: string;
	createdAt: Date;
};

function toAttachment(row: AttachmentRow): AttachmentRecord {
	return {
		id: row.id,
		fileId: row.fileId,
		entityType: row.entityType,
		entityId: row.entityId,
		field: row.field ?? null,
		label: row.label ?? null,
		uploadedById: row.uploadedById ?? null,
		organizationId: row.organizationId,
		createdAt: row.createdAt,
	};
}

export async function createAttachment(data: {
	id: string;
	fileId: string;
	entityType: string;
	entityId: string;
	field?: string | null;
	label?: string | null;
	uploadedById?: string | null;
	organizationId: string;
}): Promise<AttachmentRecord> {
	await db.iss.execute(
		`INSERT INTO ISS.Attachment (id, fileId, entityType, entityId, field, label, uploadedById, organizationId)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			data.id,
			data.fileId,
			data.entityType,
			data.entityId,
			data.field ?? null,
			data.label ?? null,
			data.uploadedById ?? null,
			data.organizationId,
		],
	);
	const [rows] = await db.iss.query<AttachmentRow[]>(
		"SELECT * FROM ISS.Attachment WHERE id = ? LIMIT 1",
		[data.id],
	);
	if (!rows[0]) throw new Error("Failed to create attachment");
	return toAttachment(rows[0]);
}

export async function findAttachmentById(
	id: string,
): Promise<AttachmentRecord | null> {
	const [rows] = await db.iss.query<AttachmentRow[]>(
		"SELECT * FROM ISS.Attachment WHERE id = ? LIMIT 1",
		[id],
	);
	if (!rows[0]) return null;
	const attachment = toAttachment(rows[0]);
	const file = await findById(attachment.fileId);
	if (file) attachment.file = file;
	return attachment;
}

export async function findAttachmentsByEntity(
	entityType: string,
	entityId: string,
): Promise<AttachmentRecord[]> {
	const [rows] = await db.iss.query<AttachmentRow[]>(
		"SELECT * FROM ISS.Attachment WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC",
		[entityType, entityId],
	);
	const attachments = rows.map(toAttachment);
	for (const a of attachments) {
		const file = await findById(a.fileId);
		if (file) a.file = file;
	}
	return attachments;
}

export async function deleteAttachment(id: string): Promise<void> {
	await db.iss.execute("DELETE FROM ISS.Attachment WHERE id = ?", [id]);
}

export async function deleteAttachmentsByEntity(
	entityType: string,
	entityId: string,
): Promise<AttachmentRecord[]> {
	const existing = await findAttachmentsByEntity(entityType, entityId);
	await db.iss.execute(
		"DELETE FROM ISS.Attachment WHERE entityType = ? AND entityId = ?",
		[entityType, entityId],
	);
	return existing;
}

export async function countStoragePathReferences(
	storagePath: string,
	fileId?: string,
): Promise<number> {
	let attachmentCount = 0;
	if (fileId) {
		const [rows] = await db.iss.query<RowDataPacket[]>(
			"SELECT COUNT(*) as c FROM ISS.Attachment WHERE fileId = ?",
			[fileId],
		);
		attachmentCount = Number((rows[0] as any)?.c ?? 0);
	} else {
		const [rows] = await db.iss.query<RowDataPacket[]>(
			`SELECT COUNT(*) as c FROM ISS.Attachment a
			 JOIN ISS.File f ON f.id = a.fileId
			 WHERE f.storagePath = ?`,
			[storagePath],
		);
		attachmentCount = Number((rows[0] as any)?.c ?? 0);
	}

	const checks: Array<{ sql: string; params: any[] }> = [
		{ sql: "SELECT COUNT(*) as c FROM ISS.assets WHERE image = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.employees WHERE image = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.items WHERE img = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.printers WHERE img = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.servers WHERE image = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.users WHERE image = ?", params: [storagePath] },
		{ sql: "SELECT COUNT(*) as c FROM ISS.requests WHERE imagefilePath = ?", params: [storagePath] },
	];

	let refs = attachmentCount;
	for (const c of checks) {
		try {
			const [rows] = await db.iss.query<RowDataPacket[]>(c.sql, c.params);
			refs += Number((rows[0] as any)?.c ?? 0);
		} catch {
			// table/column may not exist in all deployments; ignore
		}
	}

	// also count by basename for legacy values still stored as filename
	const base = storagePath.split("/").pop();
	if (base && base !== storagePath) {
		const legacyChecks: Array<{ sql: string; params: any[] }> = [
			{ sql: "SELECT COUNT(*) as c FROM ISS.assets WHERE image = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.employees WHERE image = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.items WHERE img = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.printers WHERE img = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.servers WHERE image = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.requests WHERE imagefilePath = ?", params: [base] },
			{ sql: "SELECT COUNT(*) as c FROM ISS.users WHERE image = ?", params: [base] },
		];
		for (const c of legacyChecks) {
			try {
				const [rows] = await db.iss.query<RowDataPacket[]>(c.sql, c.params);
				refs += Number((rows[0] as any)?.c ?? 0);
			} catch {
				// ignore
			}
		}
	}

	return refs;
}

export async function deleteFileIfOrphaned(
	fileId: string,
	storagePath?: string,
): Promise<{ deleted: boolean; storagePath?: string }> {
	const file = await findById(fileId);
	if (!file) return { deleted: false };
	const sp = storagePath ?? file.storagePath;
	const refs = await countStoragePathReferences(sp, fileId);
	if (refs > 0) return { deleted: false, storagePath: sp };
	await deleteFileById(fileId);
	return { deleted: true, storagePath: sp };
}
