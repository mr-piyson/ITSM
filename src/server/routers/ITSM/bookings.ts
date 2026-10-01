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
import { getEmployeesByCodes } from "@/lib/oracle-employees.server";

type Row = RowDataPacket & Record<string, unknown>;

export type BookingItem = {
	id: number;
	emplCode: string;
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
	image: string | null;
};

const createSchema = z.object({
	emplCode: z.string().trim().min(1).max(20),
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

// An asset is bookable only while it sits in the IT pool: no owner assigned,
// not marked In Use / Defective and not covered by an active booking.
const BOOKABLE_WHERE = `a.inActive = 0
			AND (a.emplCode IS NULL OR TRIM(a.emplCode) = '')
			AND (
				a.deviceStatus IS NULL
				OR TRIM(a.deviceStatus) = ''
				OR a.deviceStatus NOT IN ('In Use', 'Defective')
			)
			AND NOT EXISTS (
				SELECT 1 FROM assetBooking b
				WHERE b.assetID = a.id AND b.status = 'booked'
			)`;

function todayString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

async function employeeNameFor(code: string): Promise<string> {
	const employees = await getEmployeesByCodes([code]);
	return employees.get(code.trim())?.name ?? "";
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
				ab.emplCode,
				ab.assetID,
				ab.bookingDate,
				ab.returnDate,
				ab.bookingPurpose AS purpose,
				ab.status,
				ab.otherInfo,
				ab.addedTime,
				a.code AS assetCode,
				a.deviceName AS assetName,
				a.type AS assetType,
				a.manufacturer AS assetManufacturer,
				a.model AS assetModel,
				a.location AS assetLocation,
				u.name AS createdByName
			FROM assetBooking ab
			LEFT JOIN assets a ON a.id = ab.assetID
			LEFT JOIN users u ON u.id = ab.user
			ORDER BY ab.bookingDate DESC, ab.id DESC
		`);

		const employees = await getEmployeesByCodes(
			rows.map((row) => row.emplCode),
		);

		return rows.map((row) => {
			const employee = employees.get(String(row.emplCode ?? "").trim());
			return {
				id: Number(row.id),
				emplCode: String(row.emplCode ?? ""),
				employeeName: employee?.name ?? "",
				employeeImage: employee?.image ?? null,
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
			};
		});
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
					a.image,
					a.emplCode
				FROM assets a
				WHERE ${BOOKABLE_WHERE}
				ORDER BY a.code ASC
			`);

			const employees = await getEmployeesByCodes(
				rows.map((row) => row.emplCode),
			);

			return rows.map((row) => ({
				id: Number(row.id),
				code: String(row.code ?? ""),
				deviceName: toString(row.deviceName),
				type: toString(row.type),
				manufacturer: toString(row.manufacturer),
				model: toString(row.model),
				location: toString(row.location),
				owner: employees.get(String(row.emplCode ?? "").trim())?.name ?? null,
				image: toString(row.image),
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
				`SELECT a.id, a.deviceStatus, a.emplCode, a.code, a.deviceName,
				        a.type, a.manufacturer, a.model
				 FROM assets a
				 WHERE a.id = ? AND ${BOOKABLE_WHERE}
				 LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];
			if (!asset) {
				const [anyRows] = await ctx.db.iss.execute<Row[]>(
					`SELECT id, deviceStatus, emplCode, inActive
					 FROM assets WHERE id = ? LIMIT 1`,
					[input.assetID],
				);
				const existing = anyRows[0];
				if (!existing) {
					throw new Error("Selected asset was not found");
				}
				if (existing.inActive) {
					throw new Error("Selected asset is no longer available for booking");
				}
				const owner = toString(existing.emplCode);
				if (owner) {
					throw new Error("Only assets without an owner (in IT) can be booked");
				}
				if (String(existing.deviceStatus ?? "").trim() === "Defective") {
					throw new Error("Selected asset is marked as defective");
				}
				const [activeBookings] = await ctx.db.iss.execute<Row[]>(
					`SELECT id FROM assetBooking
					 WHERE assetID = ? AND status = 'booked' LIMIT 1`,
					[input.assetID],
				);
				if (activeBookings.length > 0) {
					throw new Error("Selected asset is already booked");
				}
				throw new Error("Selected asset is not available for booking");
			}

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO assetBooking
				 (emplCode, assetID, bookingDate, returnDate, bookingPurpose, status, user, addedTime, otherInfo)
				 VALUES (?, ?, ?, ?, ?, 'booked', ?, NOW(), ?)`,
				[
					input.emplCode,
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

			const employeeName = await employeeNameFor(input.emplCode);

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
				`SELECT status, emplCode, bookingDate, returnDate, bookingPurpose AS purpose, otherInfo
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

			const employeeName = await employeeNameFor(
				String(booking.emplCode ?? ""),
			);
			const [assetRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT type, manufacturer, model, deviceName FROM assets WHERE id = ? LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];

			await sendBookingNotification(
				{
					employeeName,
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
				`SELECT status, emplCode, bookingDate, returnDate, bookingPurpose AS purpose, otherInfo
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

			const employeeName = await employeeNameFor(
				String(booking.emplCode ?? ""),
			);
			const [assetRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT type, manufacturer, model, deviceName FROM assets WHERE id = ? LIMIT 1`,
				[input.assetID],
			);
			const asset = assetRows[0];

			await sendBookingNotification(
				{
					employeeName,
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
