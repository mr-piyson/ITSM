import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import {
	addDays,
	periodDays,
	SERVER_ACTION_TYPES,
	type MaintenancePeriod,
} from "@/lib/server-constants";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type ServerItem = {
	id: number;
	name: string;
	type: string;
	serverStatus: string;
	host: string | null;
	hostIP: string | null;
	serverIP: string | null;
	os: string | null;
	cpu: string | null;
	ram: string | null;
	maintenanceLast: string | null;
	maintenanceDue: string | null;
	diskAmount: number | null;
	disk: string | null;
	disk2: string | null;
	diskType: string | null;
	diskType2: string | null;
	location: string | null;
	location2: string | null;
	backupStatus: string | null;
	backupSoftware: string | null;
	applications: string | null;
	descrip: string | null;
	notes: string | null;
	image: string | null;
};

export type ServerActionItem = {
	id: number;
	serverID: number;
	actionType: string;
	actionDate: string;
	actionPeriod: string;
	actionDescription: string;
	actionImage: string | null;
	userID: number | null;
	userName: string | null;
	userEmpID: number | null;
	userImage: string | null;
};

export type ServerDetail = ServerItem & {
	actions: ServerActionItem[];
};

const maintenancePeriodSchema = z.enum([
	"30days",
	"60days",
	"90days",
] satisfies readonly MaintenancePeriod[]);

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => (value === "" ? null : value))
		.nullable();

const serverFieldsSchema = z.object({
	name: z.string().trim().min(1, "Server name is required").max(100),
	type: z.enum(["virtual", "physical"]),
	serverStatus: z.enum(["active", "discontinued"]),
	host: z.enum(["VMHost 1", "VMHost 2"]),
	hostIP: optionalText(50),
	serverIP: optionalText(50),
	os: optionalText(100),
	cpu: optionalText(50),
	ram: optionalText(50),
	maintenanceLast: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	nextPeriod: maintenancePeriodSchema,
	diskAmount: z.coerce.number().int().min(1).max(2),
	disk: optionalText(50),
	disk2: optionalText(50),
	diskType: optionalText(50),
	diskType2: optionalText(50),
	location: optionalText(50),
	location2: optionalText(50),
	backupStatus: z.enum(["yes", "no"]),
	backupSoftware: optionalText(50),
	applications: optionalText(100),
	descrip: optionalText(200),
	notes: optionalText(200),
});

const createSchema = serverFieldsSchema.extend({
	image: optionalText(200),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: createSchema,
});

const addActionSchema = z.object({
	serverID: z.coerce.number().int().positive(),
	actionType: z.enum(SERVER_ACTION_TYPES),
	actionDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
	actionPeriod: z
		.string()
		.trim()
		.min(1, "Completion period is required")
		.max(50),
	actionDescription: optionalText(200),
	user: z.coerce.number().int().positive(),
	actionImage: optionalText(200),
});

function toStringValue(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toDateString(value: unknown): string | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	if (typeof value === "string") {
		const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
		if (match) {
			return match[1];
		}
	}
	return null;
}

function toDateTimeString(value: unknown): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const pad = (n: number) => String(n).padStart(2, "0");
		return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
			value.getDate(),
		)} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
	}
	if (typeof value === "string") {
		const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value);
		if (match) {
			return `${match[1]} ${match[2]}`;
		}
	}
	return "";
}

function toNullableNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	const num = Number(value);
	return Number.isNaN(num) ? null : num;
}

function toServer(row: Row): ServerItem {
	return {
		id: Number(row.serverID),
		name: String(row.name ?? ""),
		type: String(row.type ?? ""),
		serverStatus: String(row.serverStatus ?? ""),
		host: toStringValue(row.host),
		hostIP: toStringValue(row.hostIP),
		serverIP: toStringValue(row.serverIP),
		os: toStringValue(row.os),
		cpu: toStringValue(row.cpu),
		ram: toStringValue(row.ram),
		maintenanceLast: toDateString(row.maintenanceLast),
		maintenanceDue: toDateString(row.maintenanceDue),
		diskAmount: toNullableNumber(row.diskAmount),
		disk: toStringValue(row.disk),
		disk2: toStringValue(row.disk2),
		diskType: toStringValue(row.diskType),
		diskType2: toStringValue(row.diskType2),
		location: toStringValue(row.location),
		location2: toStringValue(row.location2),
		backupStatus: toStringValue(row.backupStatus),
		backupSoftware: toStringValue(row.backupSoftware),
		applications: toStringValue(row.Applications),
		descrip: toStringValue(row.descrip),
		notes: toStringValue(row.notes),
		image: toStringValue(row.image),
	};
}

function toServerAction(row: Row): ServerActionItem {
	return {
		id: Number(row.id),
		serverID: Number(row.serverID),
		actionType: String(row.actionType ?? ""),
		actionDate: toDateTimeString(row.actionDate),
		actionPeriod: String(row.actionPeriod ?? ""),
		actionDescription: String(row.actionDescription ?? ""),
		actionImage: toStringValue(row.actionImage),
		userID: toNullableNumber(row.user),
		userName: toStringValue(row.userName),
		userEmpID: toNullableNumber(row.userEmpID),
		userImage: toStringValue(row.userImage),
	};
}

async function saveUploadedImage(
	prefix: string,
	dataUrl: string,
): Promise<string> {
	const match = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,(.+)$/i.exec(
		dataUrl,
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

	const fileName = `${prefix}-${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
	const dir = path.join(process.cwd(), "ISS", "itemsImages");
	await mkdir(dir, { recursive: true });
	await writeFile(path.join(dir, fileName), buffer);

	return fileName;
}

const SERVER_SELECT = `serverID, name, type, serverStatus, host, hostIP, serverIP,
	os, cpu, ram, maintenanceLast, maintenanceDue, diskAmount, disk, disk2,
	diskType, diskType2, location, location2, backupStatus, backupSoftware,
	Applications, descrip, notes, image`;

export const serversRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<ServerItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT ${SERVER_SELECT}
			 FROM servers
			 WHERE inActive = 0
			 ORDER BY serverID ASC`,
		);
		return rows.map(toServer);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<ServerDetail | null> => {
			const [[serverRows], [actionRows]] = await Promise.all([
				ctx.db.iss.execute<Row[]>(
					`SELECT ${SERVER_SELECT}
					 FROM servers
					 WHERE serverID = ?
					 LIMIT 1`,
					[input.id],
				),
				ctx.db.iss.execute<Row[]>(
					`SELECT sa.id, sa.serverID, sa.actionType, sa.actionDate, sa.actionPeriod,
					        sa.actionDescription, sa.actionImage, sa.\`user\`,
					        e.name AS userName, e.empID AS userEmpID, e.image AS userImage
					 FROM serverActions sa
					 LEFT JOIN employees e ON e.empID = sa.\`user\`
					 WHERE sa.serverID = ?
					 ORDER BY sa.actionDate DESC, sa.id DESC`,
					[input.id],
				),
			]);

			if (!serverRows[0]) {
				return null;
			}

			return {
				...toServer(serverRows[0]),
				actions: actionRows.map(toServerAction),
			};
		}),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const maintenanceDue = addDays(
				input.maintenanceLast,
				periodDays(input.nextPeriod),
			);
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO servers
				 (name, type, os, serverIP, host, hostIP, maintenanceLast, maintenanceDue,
				  cpu, ram, disk, diskType, diskAmount, location, backupStatus,
				  backupSoftware, descrip, serverStatus, Applications, notes, image, inActive)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
				[
					input.name,
					input.type,
					input.os ?? "",
					input.serverIP ?? "",
					input.host,
					input.hostIP ?? "",
					input.maintenanceLast,
					maintenanceDue,
					input.cpu ?? "",
					input.ram ?? "",
					input.disk ?? "",
					input.diskType ?? "",
					input.diskAmount,
					input.location ?? "",
					input.backupStatus,
					input.backupSoftware ?? "",
					input.descrip ?? "",
					input.serverStatus,
					input.applications ?? "",
					input.notes ?? "",
					input.image ?? "",
				],
			);
			const serverID = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'servers', ?)`,
				[ctx.user.id, serverID],
			);

			return { success: true, id: serverID };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			const maintenanceDue = addDays(
				data.maintenanceLast,
				periodDays(data.nextPeriod),
			);
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE servers
				 SET name = ?, type = ?, serverStatus = ?, os = ?, serverIP = ?,
				     host = ?, hostIP = ?, maintenanceLast = ?, maintenanceDue = ?,
				     cpu = ?, ram = ?, disk = ?, diskType = ?, diskAmount = ?,
				     disk2 = ?, diskType2 = ?, location = ?, location2 = ?,
				     backupStatus = ?, backupSoftware = ?, descrip = ?,
				     Applications = ?, notes = ?, image = ?
				 WHERE serverID = ?`,
				[
					data.name,
					data.type,
					data.serverStatus,
					data.os ?? "",
					data.serverIP ?? "",
					data.host,
					data.hostIP ?? "",
					data.maintenanceLast,
					maintenanceDue,
					data.cpu ?? "",
					data.ram ?? "",
					data.disk ?? "",
					data.diskType ?? "",
					data.diskAmount,
					data.disk2 ?? "",
					data.diskType2 ?? "",
					data.location ?? "",
					data.location2 ?? "",
					data.backupStatus,
					data.backupSoftware ?? "",
					data.descrip ?? "",
					data.applications ?? "",
					data.notes ?? "",
					data.image ?? "",
					id,
				],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'servers', ?)`,
					[ctx.user.id, id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE servers SET inActive = 1 WHERE serverID = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'servers', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	addAction: protectedProcedure
		.input(addActionSchema)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO serverActions
				 (serverID, actionType, actionDate, actionPeriod, actionDescription,
				  \`user\`, actionImage)
				 VALUES (?, ?, STR_TO_DATE(?, '%Y-%m-%d %H:%i'), ?, ?, ?, ?)`,
				[
					input.serverID,
					input.actionType,
					input.actionDate,
					input.actionPeriod,
					input.actionDescription ?? "",
					input.user,
					input.actionImage ?? "",
				],
			);
			const actionID = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'serverActions', ?)`,
				[ctx.user.id, actionID],
			);

			return { success: true, id: actionID };
		}),

	uploadImage: protectedProcedure
		.input(z.object({ dataUrl: z.string().min(1) }))
		.mutation(async ({ input }): Promise<{ image: string }> => {
			const image = await saveUploadedImage("server", input.dataUrl);
			return { image };
		}),

	uploadActionImage: protectedProcedure
		.input(z.object({ dataUrl: z.string().min(1) }))
		.mutation(async ({ input }): Promise<{ image: string }> => {
			const image = await saveUploadedImage("serverAction", input.dataUrl);
			return { image };
		}),
});
