import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { MONTHS } from "@/lib/tape-constants";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type TapeItem = {
	id: number;
	tapeID: string;
	location: string | null;
	month: string | null;
	year: string | null;
	status: string | null;
	sequenceNum: number | null;
	lastWritten: string | null;
	expire: string | null;
	capacity: string | null;
	free: string | null;
};

const TAPE_ID_REGEX = /^BFG\d{3}L6$/;

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => (value === "" ? null : value))
		.nullable();

const locationSchema = z.enum(["IT", "Production"]);
const monthSchema = z.enum(MONTHS);
const statusSchema = z.enum(["Online", "Offline"]);
const sequenceNumSchema = z.coerce.number().int().min(1).max(10);
const yearSchema = z.coerce.number().int().min(2000).max(2100);
const dateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

const assignmentSchema = z.object({
	location: locationSchema,
	month: monthSchema,
	year: yearSchema,
});

const usageSchema = z.object({
	status: statusSchema,
	sequenceNum: sequenceNumSchema,
	lastWritten: dateTimeSchema,
	expire: dateTimeSchema,
	capacity: optionalText(50),
	free: optionalText(50),
});

const createSchema = z.object({
	tapeID: z.string().trim().regex(TAPE_ID_REGEX, "Invalid tape ID format"),
	data: assignmentSchema,
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: assignmentSchema.merge(usageSchema),
});

function toStringValue(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toNullableNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	const num = Number(value);
	return Number.isNaN(num) ? null : num;
}

// Normalizes a datetime-local value ("YYYY-MM-DDTHH:mm") to MySQL format.
function toMySQLDateTime(value: string): string {
	return `${value.replace("T", " ")}:00`;
}

function toTape(row: Row): TapeItem {
	return {
		id: Number(row.id),
		tapeID: String(row.tapeID ?? ""),
		location: toStringValue(row.location),
		month: toStringValue(row.month),
		year: toStringValue(row.year),
		status: toStringValue(row.status),
		sequenceNum: toNullableNumber(row.sequenceNum),
		lastWritten: toStringValue(row.lastWritten),
		expire: toStringValue(row.expire),
		capacity: toStringValue(row.capacity),
		free: toStringValue(row.free),
	};
}

export const tapesRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<TapeItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT id, tapeID, location, month, year, status, sequenceNum,
			        lastWritten, expire, capacity, free
			 FROM tapes
			 WHERE inActive = 0
			 ORDER BY tapeID DESC`,
		);
		return rows.map(toTape);
	}),

	nextId: protectedProcedure.query(async ({ ctx }): Promise<string> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT tapeID FROM tapes WHERE tapeID LIKE 'BFG%L6'`,
		);

		let highest = 0;
		for (const row of rows) {
			const match = /^BFG(\d+)L6$/.exec(String(row.tapeID ?? ""));
			if (match) {
				const num = Number.parseInt(match[1], 10);
				if (!Number.isNaN(num) && num > highest) {
					highest = num;
				}
			}
		}

		const next = highest + 1;
		const padded =
			next < 10 ? `00${next}` : next < 100 ? `0${next}` : String(next);
		return `BFG${padded}L6`;
	}),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO tapes (tapeID, location, month, year, inActive)
				 VALUES (?, ?, ?, ?, 0)`,
				[
					input.tapeID,
					input.data.location,
					input.data.month,
					String(input.data.year),
				],
			);
			const tapeId = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'tapes', ?)`,
				[ctx.user.id, tapeId],
			);

			return { success: true, id: tapeId };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE tapes
				 SET location = ?, month = ?, year = ?, status = ?, sequenceNum = ?,
				     lastWritten = ?, expire = ?, capacity = ?, free = ?
				 WHERE id = ?`,
				[
					data.location,
					data.month,
					String(data.year),
					data.status,
					data.sequenceNum,
					toMySQLDateTime(data.lastWritten),
					toMySQLDateTime(data.expire),
					data.capacity ?? "",
					data.free ?? "",
					id,
				],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'tapes', ?)`,
					[ctx.user.id, id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	format: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE tapes
				 SET month = NULL, year = NULL, status = NULL, sequenceNum = NULL,
				     lastWritten = NULL, expire = NULL, free = NULL, location = NULL
				 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'format', 'tapes', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE tapes SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'delete', 'tapes', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),
});
