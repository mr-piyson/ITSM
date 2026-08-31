import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { CONTACT_TYPES } from "@/lib/vendor-constants";
import type { Context } from "@/server/context";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type VendorContact = {
	id: number;
	contactType: string;
	contactName: string;
	contact: string;
	personPosition: string | null;
};

export type Vendor = {
	id: number;
	name: string;
	notes: string;
	image: string | null;
	contacts: VendorContact[];
};

export const contactSchema = z.object({
	type: z.enum(CONTACT_TYPES),
	position: z.string().trim().max(100).optional(),
	name: z.string().trim().max(100),
	value: z.string().trim().max(100),
});

const vendorSchema = z.object({
	name: z.string().trim().min(1).max(150),
	notes: z.string().trim().max(2000).optional(),
	image: z.string().trim().max(200).optional(),
	contacts: z.array(contactSchema).max(50).optional(),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: vendorSchema,
});

function toContactRows(rows: Row[]): Map<number, VendorContact[]> {
	const contactsByVendor = new Map<number, VendorContact[]>();
	for (const row of rows) {
		const id = Number(row.vendorID);
		const list = contactsByVendor.get(id) ?? [];
		list.push({
			id: Number(row.id),
			contactType: String(row.contactType ?? ""),
			contactName: String(row.contactName ?? ""),
			contact: String(row.contact ?? ""),
			personPosition:
				row.personPosition === null || row.personPosition === undefined
					? null
					: String(row.personPosition),
		});
		contactsByVendor.set(id, list);
	}
	return contactsByVendor;
}

async function insertContacts(
	ctx: Context,
	vendorID: number,
	contacts: z.infer<typeof contactSchema>[],
) {
	for (const contact of contacts) {
		if (!contact.name || !contact.value) {
			continue;
		}
		await ctx.db.iss.execute(
			`INSERT INTO vendorsContacts (vendorID, contactType, contactName, contact, personPosition)
			 VALUES (?, ?, ?, ?, ?)`,
			[
				vendorID,
				contact.type,
				contact.name,
				contact.value,
				contact.position ?? "",
			],
		);
	}
}

async function logChange(
	ctx: Context,
	userID: number,
	action: "add" | "update" | "delete",
	vendorID: number,
) {
	await ctx.db.iss.execute(
		`INSERT INTO changes_logs (userID, date, action, node, nodeID)
		 VALUES (?, NOW(), ?, 'vendor', ?)`,
		[userID, action, vendorID],
	);
}

export const vendorsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<Vendor[]> => {
		const [vendorRows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, name, notes, image
			 FROM vendors
			 WHERE inActive = 0
			 ORDER BY name ASC`,
		);

		const [contactRows] = await ctx.db.iss.execute<Row[]>(`
			SELECT id, vendorID, contactType, contactName, contact, personPosition
			FROM vendorsContacts
			ORDER BY id ASC
		`);

		const contactsByVendor = toContactRows(contactRows);

		return vendorRows.map((row) => ({
			id: Number(row.id),
			name: String(row.name ?? ""),
			notes: String(row.notes ?? ""),
			image:
				row.image === null || row.image === undefined
					? null
					: String(row.image),
			contacts: contactsByVendor.get(Number(row.id)) ?? [],
		}));
	}),

	create: protectedProcedure
		.input(vendorSchema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM vendors WHERE name = ? LIMIT 1`,
				[input.name],
			);
			if (existing[0]) {
				throw new Error("Failed, Already Added");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO vendors (name, notes, user, inActive, image)
				 VALUES (?, ?, ?, 0, ?)`,
				[input.name, input.notes ?? "", ctx.user.id, input.image ?? ""],
			);
			const vendorID = result.insertId;

			await insertContacts(ctx, vendorID, input.contacts ?? []);
			await logChange(ctx, ctx.user.id, "add", vendorID);

			return {
				success: true,
				vendor: { id: vendorID, name: input.name, notes: input.notes ?? "" },
			};
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const [target] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM vendors WHERE id = ? AND inActive = 0 LIMIT 1`,
				[input.id],
			);
			if (!target[0]) {
				throw new Error("Vendor no longer exists");
			}

			const [duplicate] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM vendors WHERE name = ? AND id <> ? LIMIT 1`,
				[input.data.name, input.id],
			);
			if (duplicate[0]) {
				throw new Error("Failed, Already Added");
			}

			await ctx.db.iss.execute(
				`UPDATE vendors SET name = ?, notes = ?, image = ? WHERE id = ?`,
				[
					input.data.name,
					input.data.notes ?? "",
					input.data.image ?? "",
					input.id,
				],
			);

			await ctx.db.iss.execute(
				`DELETE FROM vendorsContacts WHERE vendorID = ?`,
				[input.id],
			);
			await insertContacts(ctx, input.id, input.data.contacts ?? []);

			await logChange(ctx, ctx.user.id, "update", input.id);

			return { success: true };
		}),

	deactivate: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE vendors SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await logChange(ctx, ctx.user.id, "delete", input.id);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	uploadImage: protectedProcedure
		.input(z.object({ dataUrl: z.string().min(1) }))
		.mutation(async ({ input }): Promise<{ image: string }> => {
			const match =
				/^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,(.+)$/i.exec(
					input.dataUrl,
				);
			if (!match) {
				throw new Error("Invalid image data");
			}

			const [, mimeType, base64] = match;
			const extension = mimeType.toLowerCase() === "jpeg" ? "jpg" : mimeType;
			const buffer = Buffer.from(base64, "base64");

			if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
				throw new Error("Image must be between 1 byte and 5 MB");
			}

			const fileName = `vendor-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
			const dir = path.join(process.cwd(), "public", "itemsImages");
			await mkdir(dir, { recursive: true });
			await writeFile(path.join(dir, fileName), buffer);

			return { image: fileName };
		}),
});
