import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import {
	bookingCreatedMail,
	bookingExtendedMail,
	bookingReturnedMail,
	sendMail,
	type BookingEmailContext,
} from "@/lib/mail";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type BookingItem = {
	id: number;
	empID: number;
	employeeName: string;
	employeeImage: string | null;
	assetID: number;
	assetCode: string;
	assetName: string | null;
	assetType: string | null;
	assetManufacturer: string | null;
	assetModel: string | null;
	assetLocation: string | null;
	status: string;
	bookingDate: string;
	returnDate: string;
	purpose: string;
	otherInfo: string | null;
	addedTime: string | null;
	createdByName: string | null;
};

export type BookingAssetOption = {
	id: number;
	code: string;
	deviceName: string | null;
	type: string | null;
	manufacturer: string | null;
	model: string | null;
	location: string | null;
	owner: string | null;
};

const createSchema = z.object({
	empID: z.coerce.number().int().positive(),
	assetID: z.coerce.number().int().positive(),
	purpose: z.string().trim().min(1).max(100),
	otherInfo: z.string().trim().max(100).optional(),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function toString(value: unknown): string | null {
	if (value === null || value === undefined || value === "") {
		return null;
	}
	return String(value);
}

function toDateString(value: unknown): string {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const year = value.getFullYear();
		const month = String(value.getMonth() + 1).padStart(2, "0");
		const day = String(value.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
		return value.slice(0, 10);
	}
	return String(value ?? "");
}

function toDateTimeISO(value: unknown): string | null {
	if (value === null || value === undefined) {
		return null;
	}
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString();
	}
	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
	}
	return String(value);
}

function todayString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

async function sendBookingNotification(
	context: BookingEmailContext,
	kind: "created" | "extended" | "returned",
): Promise<void> {
	try {
		const { subject, html } =
			kind === "created"
				? bookingCreatedMail(context)
				: kind === "extended"
					? bookingExtendedMail(context)
					: bookingReturnedMail(context);
		await sendMail({ subject, html });
	} catch (error) {
		console.error(`Failed to send booking ${kind} email:`, error);
	}
}

export const bookingsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<BookingItem[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(`
			SELECT
				ab.id,
				ab.empID,
				ab.assetID,
				ab.bookingDate,
				ab.returnDate,
				ab.bookingPurpose AS purpose,
				ab.status,
				ab.otherInfo,
				ab.addedTime,
				e.name AS employeeName,
				e.image AS employeeImage,
				a.code AS assetCode,
				a.deviceName AS assetName,
				a.type AS assetType,
				a.manufacturer AS assetManufacturer,
				a.model AS assetModel,
				a.location AS assetLocation,
				u.name AS createdByName
			FROM assetBooking ab
			LEFT JOIN assets a ON a.id = ab.assetID
			LEFT JOIN employees e ON e.empID = ab.empID
			LEFT JOIN users u ON u.id = ab.user
			ORDER BY ab.bookingDate DESC, ab.id DESC
		`);
		return rows.map((row) => ({
			id: Number(row.id),
			empID: Number(row.empID),
			employeeName: String(row.employeeName ?? ""),
			employeeImage: toString(row.employeeImage),
			assetID: Number(row.assetID),
			assetCode: String(row.assetCode ?? ""),
			assetName: toString(row.assetName),
			assetType: toString(row.assetType),
			assetManufacturer: toString(row.assetManufacturer),
			assetModel: toString(row.assetModel),
			assetLocation: toString(row.assetLocation),
			status: String(row.status ?? ""),
			bookingDate: toDateString(row.bookingDate),
			returnDate: toDateString(row.returnDate),
			purpose: String(row.purpose ?? ""),
			otherInfo: toString(row.otherInfo),
			addedTime: toDateTimeISO(row.addedTime),
			createdByName: toString(row.createdByName),
		}));
	}),

	availableAssets: protectedProcedure.query(
		async ({ ctx }): Promise<BookingAssetOption[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(`
				SELECT
					a.id,
					a.code,
					a.deviceName,
					a.type,
					a.manufacturer,
					a.model,
					a.location,
					e.name AS owner
				FROM assets a
				LEFT JOIN employees e ON e.empID = a.empID
				WHERE a.inActive = 0 AND a.deviceStatus = 'Available'
				ORDER BY a.code ASC
			`);
			return rows.map((row) => ({
				id: Number(row.id),
				code: String(row.code ?? ""),
				deviceName: toString(row.deviceName),
				type: toString(row.type),
				manufacturer: toString(row.manufacturer),
				model: toString(row.model),
				location: toString(row.location),
				owner: toString(row.owner),
			}));
		},
	),

	create: protectedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			if (input.endDate < input.startDate) {
				throw new Error("End date must be on or after the start date");
			}
			if (input.startDate < todayString()) {
				throw new Error("Start date cannot be in the past");
			}

			const [assetRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT id, deviceStatus, code, deviceName, type, manufacturer, model
				 FROM assets WHERE id = ? AND inActive = 0 LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];
			if (!asset) {
				throw new Error("Selected asset was not found");
			}
			if (String(asset.deviceStatus ?? "") !== "Available") {
				throw new Error("Selected asset is no longer available for booking");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO assetBooking
				 (empID, assetID, bookingDate, returnDate, bookingPurpose, status, user, addedTime, otherInfo)
				 VALUES (?, ?, ?, ?, ?, 'booked', ?, NOW(), ?)`,
				[
					input.empID,
					input.assetID,
					input.startDate,
					input.endDate,
					input.purpose,
					ctx.user.id,
					input.otherInfo ?? null,
				],
			);
			const bookingID = result.insertId;

			await ctx.db.iss.execute(
				`UPDATE assets SET deviceStatus = 'In Use' WHERE id = ?`,
				[input.assetID],
			);

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'booking', ?)`,
				[ctx.user.id, bookingID],
			);

			const [empRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT name FROM employees WHERE empID = ? LIMIT 1`,
				[input.empID],
			);
			const employeeName = String(empRows[0]?.name ?? "");

			await sendBookingNotification(
				{
					employeeName,
					assetLabel: [
						asset.type,
						asset.manufacturer,
						asset.model,
						asset.deviceName,
					]
						.filter(Boolean)
						.join(" - "),
					startDate: input.startDate,
					endDate: input.endDate,
					purpose: input.purpose,
					otherInfo: input.otherInfo,
				},
				"created",
			);

			return { success: true, id: bookingID };
		}),

	markReceived: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				assetID: z.coerce.number().int().positive(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [bookingRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT status, empID, bookingDate, returnDate, bookingPurpose AS purpose, otherInfo
				 FROM assetBooking WHERE id = ? LIMIT 1`,
				[input.id],
			);
			const booking = bookingRows[0];
			if (!booking) {
				throw new Error("Booking not found");
			}
			if (String(booking.status ?? "") !== "booked") {
				throw new Error("This booking has already been received");
			}

			await ctx.db.iss.execute(
				`UPDATE assetBooking SET status = 'recieved' WHERE id = ?`,
				[input.id],
			);
			await ctx.db.iss.execute(
				`UPDATE assets SET deviceStatus = 'Available' WHERE id = ?`,
				[input.assetID],
			);
			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'update', 'booking', ?)`,
				[ctx.user.id, input.id],
			);

			const [empRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT name FROM employees WHERE empID = ? LIMIT 1`,
				[Number(booking.empID)],
			);
			const [assetRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT type, manufacturer, model, deviceName FROM assets WHERE id = ? LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];

			await sendBookingNotification(
				{
					employeeName: String(empRows[0]?.name ?? ""),
					assetLabel: [
						asset?.type,
						asset?.manufacturer,
						asset?.model,
						asset?.deviceName,
					]
						.filter(Boolean)
						.join(" - "),
					startDate: toDateString(booking.bookingDate),
					endDate: toDateString(booking.returnDate),
					purpose: String(booking.purpose ?? ""),
					otherInfo: toString(booking.otherInfo),
				},
				"returned",
			);

			return { success: true };
		}),

	extend: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				assetID: z.coerce.number().int().positive(),
				endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [bookingRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT status, empID, bookingDate, returnDate, bookingPurpose AS purpose, otherInfo
				 FROM assetBooking WHERE id = ? LIMIT 1`,
				[input.id],
			);
			const booking = bookingRows[0];
			if (!booking) {
				throw new Error("Booking not found");
			}
			if (String(booking.status ?? "") !== "booked") {
				throw new Error("Only active bookings can be extended");
			}
			if (input.endDate < toDateString(booking.bookingDate)) {
				throw new Error("Return date cannot be before the booking date");
			}

			await ctx.db.iss.execute(
				`UPDATE assetBooking SET returnDate = ?, status = 'booked' WHERE id = ?`,
				[input.endDate, input.id],
			);
			await ctx.db.iss.execute(
				`UPDATE assets SET deviceStatus = 'In Use' WHERE id = ?`,
				[input.assetID],
			);
			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'update return date', 'booking', ?)`,
				[ctx.user.id, input.id],
			);

			const [empRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT name FROM employees WHERE empID = ? LIMIT 1`,
				[Number(booking.empID)],
			);
			const [assetRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT type, manufacturer, model, deviceName FROM assets WHERE id = ? LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];

			await sendBookingNotification(
				{
					employeeName: String(empRows[0]?.name ?? ""),
					assetLabel: [
						asset?.type,
						asset?.manufacturer,
						asset?.model,
						asset?.deviceName,
					]
						.filter(Boolean)
						.join(" - "),
					startDate: toDateString(booking.bookingDate),
					endDate: input.endDate,
					purpose: String(booking.purpose ?? ""),
					otherInfo: toString(booking.otherInfo),
				},
				"extended",
			);

			return { success: true };
		}),
});
