import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export const STAFF_ID_THRESHOLD = 100000;

export type EmployeeItem = {
	id: number;
	empID: number;
	name: string;
	email: string | null;
	image: string | null;
};

export type EmployeeAsset = {
	code: string;
	type: string | null;
	manufacturer: string | null;
	model: string | null;
};

export type EmployeePrinter = {
	id: number;
	name: string;
};

export type EmployeeProvidedItem = {
	name: string;
};

export type EmployeeGroup = {
	groupName: string;
};

export type Office365Details = {
	license: string;
	msProject: boolean;
	powerPi: boolean;
	authenticationTwoFactor: boolean;
	authenticationAuthenticator: boolean;
	authenticationPhone: boolean;
	recipientLimit: string;
	oneDrive: boolean;
	mailType: string;
	mailStorageSize: string;
	onlineMailboxArchive: boolean;
	onlineArchiveStorageSize: string;
};

export type EmployeeDetail = EmployeeItem & {
	assets: EmployeeAsset[];
	printers: EmployeePrinter[];
	provided: EmployeeProvidedItem[];
	office365: Office365Details | null;
	groups: EmployeeGroup[];
};

const office365Schema = z.object({
	empID: z.coerce.number().int().positive(),
	license: z.enum(["standard", "basic", "e3"]),
	msProject: z.boolean(),
	powerPi: z.boolean(),
	authenticationTwoFactor: z.boolean(),
	authenticationAuthenticator: z.boolean(),
	authenticationPhone: z.boolean(),
	recipientLimit: z.string().max(50).nullable().optional(),
	oneDrive: z.boolean(),
	mailType: z.string().max(50),
	mailStorageSize: z.string().max(10),
	onlineMailboxArchive: z.boolean(),
	onlineArchiveStorageSize: z.string().max(10),
	groups: z.array(z.string().min(1).max(100)).default([]),
});

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toBoolean(value: unknown): boolean {
	return Boolean(value) && value !== 0;
}

function normalizeEmployee(row: Row): EmployeeItem {
	return {
		id: Number(row.id),
		empID: Number(row.empID),
		name: String(row.name ?? ""),
		email: toString(row.email),
		image: toString(row.image),
	};
}

function normalizeOffice365(row: Row | undefined): Office365Details | null {
	if (!row) {
		return null;
	}
	return {
		license: String(row.license ?? ""),
		msProject: toBoolean(row.msProject),
		powerPi: toBoolean(row.powerPi),
		authenticationTwoFactor: toBoolean(row.authenticationTwoFactor),
		authenticationAuthenticator: toBoolean(row.authenticationAuthenticator),
		authenticationPhone: toBoolean(row.authenticationPhone),
		recipientLimit: toString(row.recipientLimit) ?? "",
		oneDrive: toBoolean(row.oneDrive),
		mailType: String(row.mailType ?? ""),
		mailStorageSize: String(row.mailStorageSize ?? ""),
		onlineMailboxArchive: toBoolean(row.onlineMailboxArchive),
		onlineArchiveStorageSize: String(row.onlineArchiveStorageSize ?? ""),
	};
}

function boolToInt(value: boolean): number {
	return value ? 1 : 0;
}

export const employeesRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<EmployeeItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(`
			SELECT id, empID, name, email, image
			FROM employees
			WHERE inActive = 0
			ORDER BY empID ASC
		`);
		return rows.map(normalizeEmployee);
	}),

	nextNonStaffId: protectedProcedure.query(async ({ ctx }): Promise<number> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT MAX(empID) AS maxID FROM employees WHERE empID > ?`,
			[STAFF_ID_THRESHOLD],
		);
		const maxID = Number(rows[0]?.maxID ?? 0);
		return maxID > STAFF_ID_THRESHOLD ? maxID + 1 : STAFF_ID_THRESHOLD + 1;
	}),

	create: protectedProcedure
		.input(
			z.object({
				empID: z.coerce.number().int().positive(),
				name: z.string().trim().min(1).max(100),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [duplicates] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM employees WHERE name = ? OR empID = ? LIMIT 1`,
				[input.name, input.empID],
			);
			if (duplicates.length > 0) {
				throw new Error("alreadyAdded");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO employees (empID, name, user, inActive)
				 VALUES (?, ?, ?, 0)`,
				[input.empID, input.name, ctx.user.id],
			);

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'employee', ?)`,
				[ctx.user.id, result.insertId],
			);

			return { success: true, id: result.insertId };
		}),

	update: protectedProcedure
		.input(
			z.object({
				empID: z.coerce.number().int().positive(),
				name: z.string().trim().min(1).max(100),
				email: z.string().max(100).nullable().optional(),
				image: z.string().max(200).nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE employees
				 SET name = ?, email = ?, image = ?
				 WHERE empID = ?`,
				[input.name, input.email ?? null, input.image ?? null, input.empID],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'empID', ?)`,
					[ctx.user.id, input.empID],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	deactivate: protectedProcedure
		.input(z.object({ empID: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE employees SET inActive = 1 WHERE empID = ?`,
				[input.empID],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'deactivate', 'employee', ?)`,
					[ctx.user.id, input.empID],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	details: protectedProcedure
		.input(z.object({ empID: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<EmployeeDetail | null> => {
			const [
				empQuery,
				assetsQuery,
				printersQuery,
				providedQuery,
				o365Query,
				groupsQuery,
			] = await Promise.all([
				ctx.db.iss.execute<Row[]>(
					`SELECT id, empID, name, email, image
						 FROM employees WHERE empID = ? LIMIT 1`,
					[input.empID],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT code, type, manufacturer, model
						 FROM assets WHERE empID = ? AND inActive = 0
						 ORDER BY code ASC`,
					[input.empID],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT id, name FROM printers WHERE empID = ?
						 ORDER BY name ASC`,
					[input.empID],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT items.name
						 FROM provide
						 LEFT JOIN provideItems ON provideItems.provideID = provide.id
						 LEFT JOIN items ON items.id = provideItems.itemID
						 WHERE provide.empID = ?`,
					[input.empID],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT * FROM employeesDetails WHERE empID = ? LIMIT 1`,
					[input.empID],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT groupName FROM employeesGroupDetails
						 WHERE empID = ? ORDER BY id ASC`,
					[input.empID],
				),
			]);

			const [empRows] = empQuery;
			if (!empRows[0]) {
				return null;
			}

			const [assetRows] = assetsQuery;
			const [printerRows] = printersQuery;
			const [providedRows] = providedQuery;
			const [o365Rows] = o365Query;
			const [groupRows] = groupsQuery;

			return {
				...normalizeEmployee(empRows[0]),
				assets: assetRows.map((row) => ({
					code: String(row.code ?? ""),
					type: toString(row.type),
					manufacturer: toString(row.manufacturer),
					model: toString(row.model),
				})),
				printers: printerRows.map((row) => ({
					id: Number(row.id),
					name: String(row.name ?? ""),
				})),
				provided: providedRows.map((row) => ({
					name: String(row.name ?? ""),
				})),
				office365: normalizeOffice365(o365Rows[0]),
				groups: groupRows.map((row) => ({
					groupName: String(row.groupName ?? ""),
				})),
			};
		}),

	updateOffice365: protectedProcedure
		.input(office365Schema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM employeesDetails WHERE empID = ? LIMIT 1`,
				[input.empID],
			);

			if (existing.length > 0) {
				await ctx.db.iss.execute(
					`UPDATE employeesDetails
					 SET license = ?, msProject = ?, powerPi = ?,
					 authenticationTwoFactor = ?, authenticationAuthenticator = ?,
					 authenticationPhone = ?, recipientLimit = ?, oneDrive = ?,
					 mailType = ?, mailStorageSize = ?, onlineMailboxArchive = ?,
					 onlineArchiveStorageSize = ?
					 WHERE empID = ?`,
					[
						input.license,
						boolToInt(input.msProject),
						boolToInt(input.powerPi),
						boolToInt(input.authenticationTwoFactor),
						boolToInt(input.authenticationAuthenticator),
						boolToInt(input.authenticationPhone),
						input.recipientLimit ?? "",
						boolToInt(input.oneDrive),
						input.mailType,
						input.mailStorageSize,
						boolToInt(input.onlineMailboxArchive),
						input.onlineArchiveStorageSize,
						input.empID,
					],
				);
			} else {
				await ctx.db.iss.execute(
					`INSERT INTO employeesDetails
					 (empID, license, msProject, powerPi, authenticationTwoFactor,
					 authenticationAuthenticator, authenticationPhone, recipientLimit,
					 oneDrive, mailType, mailStorageSize, onlineMailboxArchive,
					 onlineArchiveStorageSize)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						input.empID,
						input.license,
						boolToInt(input.msProject),
						boolToInt(input.powerPi),
						boolToInt(input.authenticationTwoFactor),
						boolToInt(input.authenticationAuthenticator),
						boolToInt(input.authenticationPhone),
						input.recipientLimit ?? "",
						boolToInt(input.oneDrive),
						input.mailType,
						input.mailStorageSize,
						boolToInt(input.onlineMailboxArchive),
						input.onlineArchiveStorageSize,
					],
				);
			}

			await ctx.db.iss.execute(
				`DELETE FROM employeesGroupDetails WHERE empID = ?`,
				[input.empID],
			);

			for (const groupName of input.groups) {
				await ctx.db.iss.execute(
					`INSERT INTO employeesGroupDetails (empID, groupName) VALUES (?, ?)`,
					[input.empID, groupName],
				);
			}

			return { success: true };
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

			const fileName = `emp-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
			const dir = path.join(process.cwd(), "public", "itemsImages");
			await mkdir(dir, { recursive: true });
			await writeFile(path.join(dir, fileName), buffer);

			return { image: fileName };
		}),
});
