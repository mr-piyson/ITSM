import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import { ATTENDANCE_RULES } from "@/lib/attendance-rules";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type AttendanceEmployee = {
	id: number;
	empCode: number;
	name: string;
};

export type AttendanceLog = {
	personId: number;
	datetime: Date;
	timeRaw: string;
	personName: string;
};

export type DailyAttendance = {
	date: string;
	checkIn: string | null;
	checkOut: string | null;
	status: "present" | "late" | "absent" | "weekend";
	lateMinutes: number;
	extraMinutes: number;
	weekend: boolean;
};

export type AttendanceSummary = {
	employee: AttendanceEmployee | null;
	presentDays: number;
	absentDays: number;
	totalLateMinutes: number;
	totalExtraMinutes: number;
	days: DailyAttendance[];
};

function pad(n: number): string {
	return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(date: Date): string {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function minutesBetween(a: Date, b: Date): number {
	return Math.round((b.getTime() - a.getTime()) / 60000);
}

function toDateString(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDateTime(value: unknown): Date | null {
	if (value instanceof Date) {
		return value;
	}
	if (typeof value === "string" || typeof value === "number") {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d;
	}
	return null;
}

function getWorkingMonthRange(year: number, month: number) {
	const prevMonth = month === 1 ? 12 : month - 1;
	const prevYear = month === 1 ? year - 1 : year;
	const startDate = new Date(prevYear, prevMonth - 1, 23);
	const endDate = new Date(year, month - 1, 22);
	return { startDate, endDate, prevYear, prevMonth };
}

function buildVlogTableName(year: number, month: number): string {
	return `hikvision.vlog_${year}${pad(month)}`;
}

export const attendanceRouter = router({
	employee: protectedProcedure
		.input(z.object({ empCode: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<AttendanceEmployee | null> => {
			const [rows] = await ctx.db.mes.execute<Row[]>(
				`SELECT id, emp_code, name FROM mes.employees WHERE emp_code = ? LIMIT 1`,
				[input.empCode],
			);
			if (rows.length === 0) {
				return null;
			}
			const row = rows[0];
			return {
				id: Number(row.id),
				empCode: Number(row.emp_code),
				name: String(row.name ?? ""),
			};
		}),

	logs: protectedProcedure
		.input(
			z.object({
				personId: z.coerce.number().int().positive(),
				month: z.coerce.number().int().min(1).max(12),
				year: z.coerce.number().int().min(2020).max(2100),
			}),
		)
		.query(async ({ ctx, input }): Promise<AttendanceLog[]> => {
			const { prevYear, prevMonth, startDate, endDate } = getWorkingMonthRange(
				input.year,
				input.month,
			);

			const prevTable = buildVlogTableName(prevYear, prevMonth);
			const curTable = buildVlogTableName(input.year, input.month);

			const [prevRows, curRows] = await Promise.all([
				ctx.db.mes.query<Row[]>(
					`SELECT person_id, \`datetime\`, time_raw, person_name
					 FROM ${prevTable}
					 WHERE person_id = ?
					 ORDER BY \`datetime\` ASC`,
					[input.personId],
				),
				ctx.db.mes.query<Row[]>(
					`SELECT person_id, \`datetime\`, time_raw, person_name
					 FROM ${curTable}
					 WHERE person_id = ?
					 ORDER BY \`datetime\` ASC`,
					[input.personId],
				),
			]);

			const allRows = [...prevRows[0], ...curRows[0]];
			return allRows
				.map((row) => ({
					personId: Number(row.person_id),
					datetime: parseDateTime(row.datetime) ?? new Date(),
					timeRaw: String(row.time_raw ?? ""),
					personName: String(row.person_name ?? ""),
				}))
				.filter((log) => {
					const ts = log.datetime.getTime();
					return ts >= startDate.getTime() && ts <= endDate.getTime();
				});
		}),

	summary: protectedProcedure
		.input(
			z.object({
				personId: z.coerce.number().int().positive(),
				month: z.coerce.number().int().min(1).max(12),
				year: z.coerce.number().int().min(2020).max(2100),
			}),
		)
		.query(async ({ ctx, input }): Promise<AttendanceSummary> => {
			const { startDate, endDate, prevYear, prevMonth } = getWorkingMonthRange(
				input.year,
				input.month,
			);

			const prevTable = buildVlogTableName(prevYear, prevMonth);
			const curTable = buildVlogTableName(input.year, input.month);

			const [prevLogRows, curLogRows] = await Promise.all([
				ctx.db.mes.query<Row[]>(
					`SELECT person_id, \`datetime\`, time_raw, person_name
					 FROM ${prevTable}
					 WHERE person_id = ?
					 ORDER BY \`datetime\` ASC`,
					[input.personId],
				),
				ctx.db.mes.query<Row[]>(
					`SELECT person_id, \`datetime\`, time_raw, person_name
					 FROM ${curTable}
					 WHERE person_id = ?
					 ORDER BY \`datetime\` ASC`,
					[input.personId],
				),
			]);

			const allLogRows = [...prevLogRows[0], ...curLogRows[0]];
			const logs: AttendanceLog[] = allLogRows
				.map((row) => ({
					personId: Number(row.person_id),
					datetime: parseDateTime(row.datetime) ?? new Date(),
					timeRaw: String(row.time_raw ?? ""),
					personName: String(row.person_name ?? ""),
				}))
				.filter((log) => {
					const ts = log.datetime.getTime();
					return ts >= startDate.getTime() && ts <= endDate.getTime();
				});

			const [empRows] = await ctx.db.mes.execute<Row[]>(
				`SELECT id, emp_code, name FROM mes.employees WHERE emp_code = ? LIMIT 1`,
				[input.personId],
			);
			const employee: AttendanceEmployee | null =
				empRows.length > 0
					? {
							id: Number(empRows[0].id),
							empCode: Number(empRows[0].emp_code),
							name: String(empRows[0].name ?? ""),
						}
					: null;

			const { workStartHour, workStartMinute, workEndHour, workEndMinute } =
				ATTENDANCE_RULES;

			const byDate = new Map<string, AttendanceLog[]>();
			for (const log of logs) {
				const key = toDateString(log.datetime);
				const arr = byDate.get(key) ?? [];
				arr.push(log);
				byDate.set(key, arr);
			}

			const days: DailyAttendance[] = [];
			let presentDays = 0;
			let absentDays = 0;
			let totalLateMinutes = 0;
			let totalExtraMinutes = 0;

			const today = new Date();
			const todayStr = toDateString(today);

			const cursor = new Date(startDate);
			while (cursor <= endDate) {
				const dateStr = toDateString(cursor);
				const dow = cursor.getDay();
				const isWeekend = dow === 5 || dow === 6;
				const isFuture = dateStr > todayStr;

				if (isWeekend) {
					const dayLogs = byDate.get(dateStr);
					if (dayLogs && dayLogs.length > 0) {
						const firstPunch = dayLogs[0];
						const lastPunch = dayLogs[dayLogs.length - 1];
						days.push({
							date: dateStr,
							checkIn: formatTime(firstPunch.datetime),
							checkOut: formatTime(lastPunch.datetime),
							status: "weekend",
							lateMinutes: 0,
							extraMinutes: 0,
							weekend: true,
						});
					} else {
						days.push({
							date: dateStr,
							checkIn: null,
							checkOut: null,
							status: "weekend",
							lateMinutes: 0,
							extraMinutes: 0,
							weekend: true,
						});
					}
					cursor.setDate(cursor.getDate() + 1);
					continue;
				}

				if (isFuture) {
					days.push({
						date: dateStr,
						checkIn: null,
						checkOut: null,
						status: "absent",
						lateMinutes: 0,
						extraMinutes: 0,
						weekend: false,
					});
					cursor.setDate(cursor.getDate() + 1);
					continue;
				}

				const dayLogs = byDate.get(dateStr);
				if (!dayLogs || dayLogs.length === 0) {
					days.push({
						date: dateStr,
						checkIn: null,
						checkOut: null,
						status: "absent",
						lateMinutes: 0,
						extraMinutes: 0,
						weekend: false,
					});
					absentDays++;
					cursor.setDate(cursor.getDate() + 1);
					continue;
				}

				const firstPunch = dayLogs[0];
				const lastPunch = dayLogs[dayLogs.length - 1];

				const checkInTime = firstPunch.datetime;
				const checkOutTime = lastPunch.datetime;

				const workStart = new Date(cursor);
				workStart.setHours(workStartHour, workStartMinute, 0, 0);
				const workEnd = new Date(cursor);
				workEnd.setHours(workEndHour, workEndMinute, 0, 0);

				let lateMinutes = 0;
				if (checkInTime > workStart) {
					lateMinutes = minutesBetween(workStart, checkInTime);
				}

				let extraMinutes = 0;
				if (checkOutTime > workEnd) {
					extraMinutes = minutesBetween(workEnd, checkOutTime);
				}

				const isLate = lateMinutes > 0;

				days.push({
					date: dateStr,
					checkIn: formatTime(checkInTime),
					checkOut: formatTime(checkOutTime),
					status: isLate ? "late" : "present",
					lateMinutes,
					extraMinutes,
					weekend: false,
				});

				presentDays++;
				totalLateMinutes += lateMinutes;
				totalExtraMinutes += extraMinutes;
				cursor.setDate(cursor.getDate() + 1);
			}

			return {
				employee,
				presentDays,
				absentDays,
				totalLateMinutes,
				totalExtraMinutes,
				days,
			};
		}),
});
