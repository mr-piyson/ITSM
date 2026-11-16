import { createId } from "@paralleldrive/cuid2";

import * as fileRepo from "./file.repository";
import * as storage from "./storage.service";

export async function createAttachment(args: {
	fileId: string;
	entityType: string;
	entityId: string;
	field?: string | null;
	label?: string | null;
	uploadedById?: string | null;
	organizationId: string;
}) {
	return fileRepo.createAttachment({
		id: createId(),
		fileId: args.fileId,
		entityType: args.entityType,
		entityId: args.entityId,
		field: args.field ?? null,
		label: args.label ?? null,
		uploadedById: args.uploadedById ?? null,
		organizationId: args.organizationId,
	});
}

export async function listByEntity(entityType: string, entityId: string) {
	return fileRepo.findAttachmentsByEntity(entityType, entityId);
}

export async function deleteAttachment(attachmentId: string) {
	const attachment = await fileRepo.findAttachmentById(attachmentId);
	if (!attachment) return;
	await fileRepo.deleteAttachment(attachmentId);
	const result = await fileRepo.deleteFileIfOrphaned(
		attachment.fileId,
		attachment.file?.storagePath,
	);
	if (result.deleted && result.storagePath) {
		await storage.remove(result.storagePath);
	}
}

export async function deleteByEntity(entityType: string, entityId: string) {
	const existing = await fileRepo.deleteAttachmentsByEntity(
		entityType,
		entityId,
	);
	const seen = new Set<string>();
	for (const a of existing) {
		if (seen.has(a.fileId)) continue;
		seen.add(a.fileId);
		const result = await fileRepo.deleteFileIfOrphaned(
			a.fileId,
			a.file?.storagePath,
		);
		if (result.deleted && result.storagePath) {
			await storage.remove(result.storagePath);
		}
	}
}
