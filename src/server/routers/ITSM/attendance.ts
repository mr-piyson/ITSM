import type { ExecuteValues, ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool } from "mysql2/promise";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ATTENDANCE_RULES } from "@/lib/attendance-rules";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

const attendanceLogInput = z.object({
	id: z.coerce.number().int().positive().optional(),
	direction: z.enum(["in", "out"]).optional(),
	personId: z.union([z.string(), z.number()]).optional(),
	personName: z.string().trim().optional(),
	localDateTime: z.string().trim().optional(),
	time: z.string().trim().optional(),
	timeRaw: z.string().trim().optional(),
	deviceIp: z.string().trim().optional(),
	deviceModel: z.string().trim().optional(),
	deviceSerial: z.string().trim().optional(),
	serialNo: z.coerce.number().int().optional(),
	cardNo: z.string().trim().optional(),
	major: z.coerce.number().int().optional(),
	minor: z.coerce.number().int().optional(),
	cardType: z.string().trim().optional(),
	netUser: z.string().trim().optional(),
	remoteHostAddr: z.string().trim().optional(),
	reportChannel: z.coerce.number().int().optional(),
	cardReaderKind: z.coerce.number().int().optional(),
	cardReaderNo: z.coerce.number().int().optional(),
	doorNo: z.coerce.number().int().optional(),
	verifyNo: z.coerce.number().int().optional(),
	alarmInNo: z.coerce.number().int().optional(),
	alarmOutNo: z.coerce.number().int().optional(),
	caseSensorNo: z.coerce.number().int().optional(),
	RS485No: z.coerce.number().int().optional(),
	multiCardGroupNo: z.coerce.number().int().optional(),
	deviceNo: z.coerce.number().int().optional(),
	internetAccess: z.coerce.number().int().optional(),
	type: z.coerce.number().int().optional(),
	macAddr: z.string().trim().optional(),
	swipeCardType: z.coerce.number().int().optional(),
	userType: z.string().trim().optional(),
	currentVerifyMode: z.string().trim().optional(),
	attendanceStatus: z.string().trim().optional(),
	statusValue: z.coerce.number().int().optional(),
	mask: z.string().trim().optional(),
	pictureURL: z.string().trim().optional(),
	logPictureURL: z.string().trim().optional(),
	picturesNumber: z.coerce.number().int().optional(),
	syncDatetime: z.string().trim().optional(),
	extra: z.record(z.string(), z.json()).optional(),
});

type AttendanceLogInput = z.infer<typeof attendanceLogInput>;

const EMPLOYEE_IMAGE_URL =
	"CONCAT('/api/image-proxy?url=http://intranet.bfginternational.com:88/storage/employee/', MD5(e.id), '/', r.filename, '.jpg')";

export type AttendanceEmployee = {
	id: number;
	empCode: number;
	name: string;
	image: string | null;
};

export type AttendanceLog = {
	id: number;
	personId: number;
	datetime: Date;
	timeRaw: string;
	personName: string;
	deviceIp?: string | null;
};

export type DailyAttendance = {
	date: string;
	checkIn: string | null;
	checkOut: string | null;
	status: "present" | "late" | "absent" | "weekend" | "future";
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

function formatUtc(date: Date): string {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function formatLocalOffset(date: Date, offsetMinutes: number): string {
	const shifted = new Date(date.getTime() + offsetMinutes * 60000);
	return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}${offsetMinutes >= 0 ? "+" : "-"}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(Math.abs(offsetMinutes) % 60)}`;
}

function normalizeLocalDateTime(value: string): string {
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
		return `${value}:00`;
	}
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
		return `${value.replace(" ", "T")}:00`;
	}
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
		return value.replace(" ", "T");
	}
	return value;
}

function parseAttendanceTime(data: AttendanceLogInput): {
	timeSql: string;
	raw: string;
	year: number;
	month: number;
} | null {
	if (data.localDateTime) {
		const normalized = normalizeLocalDateTime(data.localDateTime);
		if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
			return null;
		}
		const year = Number(normalized.slice(0, 4));
		const month = Number(normalized.slice(5, 7));
		if (Number.isNaN(year) || Number.isNaN(month)) return null;

		const timeSql = normalized.replace("T", " ");
		const raw = data.timeRaw ?? `${normalized}+03:00`;
		return { timeSql, raw, year, month };
	}

	if (data.time) {
		let iso = data.time;
		if (!iso.includes("T") && !iso.includes("Z")) {
			iso = `${iso.replace(" ", "T")}+03:00`;
		}
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return null;

		// Convert to local +03:00
		const shifted = new Date(date.getTime() + 3 * 3600 * 1000);
		const year = shifted.getUTCFullYear();
		const month = shifted.getUTCMonth() + 1;
		const timeSql = `${year}-${pad(month)}-${pad(shifted.getUTCDate())} ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`;
		const raw =
			data.timeRaw ??
			`${year}-${pad(month)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}+03:00`;

		return { timeSql, raw, year, month };
	}

	return null;
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
	const endExclusive = new Date(year, month - 1, 23);
	return { startDate, endExclusive, prevYear, prevMonth };
}

function buildLogTableName(year: number, month: number): string {
	return `hikvision.log_${year}${pad(month)}`;
}

async function getDeviceDefaults(
	db: Pool,
	tableName: string,
	deviceIp: string,
): Promise<{ model: string; serial: string; nextSerial: number }> {
	const tryTable = async (table: string) => {
		const [rows] = await db.execute<Row[]>(
			`SELECT device_model, device_serial FROM hikvision.${table}
			 WHERE device_ip = ? ORDER BY id DESC LIMIT 1`,
			[deviceIp],
		);
		const [maxRows] = await db.execute<Row[]>(
			`SELECT MAX(serialNo) AS m FROM hikvision.${table} WHERE device_ip = ?`,
			[deviceIp],
		);
		return {
			model: rows.length ? String(rows[0].device_model ?? "") : "",
			serial: rows.length ? String(rows[0].device_serial ?? "") : "",
			maxSerial: Number(maxRows[0]?.m ?? 0),
		};
	};

	let result = await tryTable(tableName);
	if (result.maxSerial > 0 || result.model) {
		return {
			model: result.model,
			serial: result.serial,
			nextSerial: result.maxSerial + 1,
		};
	}

	const [tables] = await db.execute<Row[]>(
		`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
		 WHERE TABLE_SCHEMA = 'hikvision' AND TABLE_NAME LIKE 'log_%'
		 ORDER BY TABLE_NAME DESC`,
	);
	for (const row of tables) {
		const table = String(row.TABLE_NAME);
		if (table === tableName) continue;
		result = await tryTable(table);
		if (result.maxSerial > 0 || result.model) {
			return {
				model: result.model,
				serial: result.serial,
				nextSerial: result.maxSerial + 1,
			};
		}
	}

	return { model: "", serial: "", nextSerial: 1 };
}

async function safeQueryLogs(
	db: Pool,
	tableName: string,
	personId: number,
): Promise<Row[]> {
	try {
		const [rows] = await db.query<Row[]>(
			`SELECT id, employeeNoString AS person_id, \`time\` AS \`datetime\`, timeRaw AS time_raw, name AS person_name, device_ip
			 FROM ${tableName}
			 WHERE employeeNoString = ? AND employeeNoString IS NOT NULL
			 ORDER BY \`time\` ASC`,
			[personId],
		);
		return rows;
	} catch {
		return [];
	}
}

export const attendanceRouter = router({
	employeeSearch: protectedProcedure
		.input(z.object({ query: z.string().trim().min(2).max(80) }))
		.query(async ({ ctx, input }): Promise<AttendanceEmployee[]> => {
			const query = input.query;
			const [rows] = await ctx.db.mes.execute<Row[]>(
				`SELECT e.id, e.emp_code, e.name, ${EMPLOYEE_IMAGE_URL} AS image
				 FROM mes.employees e
				 LEFT JOIN mes.resources r
				   ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'
				 WHERE CAST(e.emp_code AS CHAR) LIKE CONCAT(?, '%')
				    OR e.name LIKE CONCAT(?, '%')
				 ORDER BY e.name ASC
				 LIMIT 10`,
				[query, query],
			);
			return rows.map((row) => ({
				id: Number(row.id),
				empCode: Number(row.emp_code),
				name: String(row.name ?? ""),
				image: typeof row.image === "string" ? row.image : null,
			}));
		}),

	employee: protectedProcedure
		.input(z.object({ empCode: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<AttendanceEmployee | null> => {
			const [rows] = await ctx.db.mes.execute<Row[]>(
				`SELECT e.id, e.emp_code, e.name, ${EMPLOYEE_IMAGE_URL} AS image
				 FROM mes.employees e
				 LEFT JOIN mes.resources r
				   ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'
				 WHERE e.emp_code = ?
				 LIMIT 1`,
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
				image: typeof row.image === "string" ? row.image : null,
			};
		}),

	saveLog: protectedProcedure
		.input(attendanceLogInput)
		.mutation(async ({ ctx, input }) => {
			const timeInfo = parseAttendanceTime(input);
			if (!timeInfo) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Provide localDateTime or time",
				});
			}

			const year = timeInfo.year;
			const month = timeInfo.month;
			const tableName = `log_${year}${pad(month)}`;
			const [tableRows] = await ctx.db.mes.execute<Row[]>(
				`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
				 WHERE TABLE_SCHEMA = 'hikvision' AND TABLE_NAME = ?`,
				[tableName],
			);
			if (tableRows.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Table hikvision.${tableName} does not exist`,
				});
			}

			const [columnRows] = await ctx.db.mes.execute<Row[]>(
				`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
				 WHERE TABLE_SCHEMA = 'hikvision' AND TABLE_NAME = ?`,
				[tableName],
			);
			const allowedColumns = new Set(
				columnRows.map((row) => String(row.COLUMN_NAME)),
			);
			const timeRaw = input.timeRaw ?? timeInfo.raw;

			if (input.id) {
				await ctx.db.mes.execute(
					`UPDATE hikvision.${tableName} SET time = ?, timeRaw = ? WHERE id = ?`,
					[timeInfo.timeSql, timeRaw, input.id],
				);
				return {
					ok: true,
					mode: "update",
					table: `hikvision.${tableName}`,
					id: input.id,
					time: timeInfo.timeSql,
					timeRaw,
				};
			}

			const personId = String(input.personId ?? "");
			if (!personId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "personId is required",
				});
			}

			let deviceIp = input.deviceIp;
			let deviceModel = input.deviceModel;
			let deviceSerial = input.deviceSerial;
			let serialNo = input.serialNo;

			if (input.direction === "in" || input.direction === "out") {
				deviceIp ??=
					input.direction === "in" ? "172.18.1.82:80" : "172.18.1.80:80";
				const defaults = await getDeviceDefaults(
					ctx.db.mes,
					tableName,
					deviceIp,
				);
				deviceModel ??= defaults.model;
				deviceSerial ??= defaults.serial;
				serialNo ??= defaults.nextSerial;
			}

			let personName = input.personName;
			if (!personName) {
				const [employeeRows] = await ctx.db.mes.execute<Row[]>(
					`SELECT name FROM mes.employees WHERE emp_code = ? LIMIT 1`,
					[personId],
				);
				if (employeeRows.length > 0 && employeeRows[0].name) {
					personName = String(employeeRows[0].name);
				}
			}

			const insert: Record<string, ExecuteValues> = {
				device_ip: deviceIp ?? "manual",
				device_model: deviceModel ?? "",
				device_serial: deviceSerial ?? "",
				serialNo: serialNo ?? Date.now(),
				employeeNoString: personId,
				name: personName ?? null,
				cardNo: input.cardNo ?? null,
				time: timeInfo.timeSql,
				timeRaw,
				major: input.major ?? 0,
				minor: input.minor ?? 0,
				userType: input.userType ?? "normal",
				currentVerifyMode: input.currentVerifyMode ?? "manual",
				mask: input.mask ?? "unknown",
			};
			const optionalColumns: Record<string, ExecuteValues | undefined> = {
				cardType: input.cardType,
				netUser: input.netUser,
				remoteHostAddr: input.remoteHostAddr,
				reportChannel: input.reportChannel,
				cardReaderKind: input.cardReaderKind,
				cardReaderNo: input.cardReaderNo,
				doorNo: input.doorNo,
				verifyNo: input.verifyNo,
				alarmInNo: input.alarmInNo,
				alarmOutNo: input.alarmOutNo,
				caseSensorNo: input.caseSensorNo,
				RS485No: input.RS485No,
				multiCardGroupNo: input.multiCardGroupNo,
				deviceNo: input.deviceNo,
				InternetAccess: input.internetAccess,
				type: input.type,
				MACAddr: input.macAddr,
				swipeCardType: input.swipeCardType,
				attendanceStatus: input.attendanceStatus,
				statusValue: input.statusValue,
				pictureURL: input.pictureURL,
				logPictureURL: input.logPictureURL,
				picturesNumber: input.picturesNumber,
			};

			for (const [column, value] of Object.entries(optionalColumns)) {
				if (value !== undefined) insert[column] = value;
			}
			if (input.syncDatetime) insert.sync_datetime = input.syncDatetime;
			if (input.extra) {
				for (const [column, value] of Object.entries(input.extra)) {
					if (column !== "id" && allowedColumns.has(column)) {
						insert[column] = value;
					}
				}
			}
			for (const column of Object.keys(insert)) {
				if (!allowedColumns.has(column)) delete insert[column];
			}

			const columns = Object.keys(insert);
			if (columns.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No valid columns to insert",
				});
			}

			const placeholders = columns.map(() => "?").join(", ");
			const values = columns.map((column) => insert[column]);
			const [result] = await ctx.db.mes.execute<ResultSetHeader>(
				`INSERT INTO hikvision.${tableName} (${columns.join(", ")}) VALUES (${placeholders})`,
				values,
			);

			return {
				ok: true,
				mode: "insert",
				table: `hikvision.${tableName}`,
				insertId: result.insertId,
				personId,
				direction: input.direction,
				time: timeInfo.timeSql,
				timeRaw,
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
			const { prevYear, prevMonth, startDate, endExclusive } =
				getWorkingMonthRange(input.year, input.month);

			const prevTable = buildLogTableName(prevYear, prevMonth);
			const curTable = buildLogTableName(input.year, input.month);

			const [prevRows, curRows] = await Promise.all([
				safeQueryLogs(ctx.db.mes, prevTable, input.personId),
				safeQueryLogs(ctx.db.mes, curTable, input.personId),
			]);

			const allRows = [...prevRows, ...curRows];
			return allRows
				.map((row) => ({
					id: Number(row.id),
					personId: Number(row.person_id),
					datetime: parseDateTime(row.datetime) ?? new Date(),
					timeRaw: String(row.time_raw ?? ""),
					personName: String(row.person_name ?? ""),
					deviceIp: typeof row.device_ip === "string" ? row.device_ip : null,
				}))
				.filter((log) => {
					const ts = log.datetime.getTime();
					return ts >= startDate.getTime() && ts < endExclusive.getTime();
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
			const { startDate, endExclusive, prevYear, prevMonth } =
				getWorkingMonthRange(input.year, input.month);

			const prevTable = buildLogTableName(prevYear, prevMonth);
			const curTable = buildLogTableName(input.year, input.month);

			const [prevLogRows, curLogRows] = await Promise.all([
				safeQueryLogs(ctx.db.mes, prevTable, input.personId),
				safeQueryLogs(ctx.db.mes, curTable, input.personId),
			]);

			const allLogRows = [...prevLogRows, ...curLogRows];
			const logs: AttendanceLog[] = allLogRows
				.map((row) => ({
					id: Number(row.id),
					personId: Number(row.person_id),
					datetime: parseDateTime(row.datetime) ?? new Date(),
					timeRaw: String(row.time_raw ?? ""),
					personName: String(row.person_name ?? ""),
					deviceIp: typeof row.device_ip === "string" ? row.device_ip : null,
				}))
				.filter((log) => {
					const ts = log.datetime.getTime();
					return ts >= startDate.getTime() && ts < endExclusive.getTime();
				});

			const [empRows] = await ctx.db.mes.execute<Row[]>(
				`SELECT e.id, e.emp_code, e.name, ${EMPLOYEE_IMAGE_URL} AS image
				 FROM mes.employees e
				 LEFT JOIN mes.resources r
				   ON e.id = r.uid AND r.model = 'employee' AND r.attr = 'photo'
				 WHERE e.emp_code = ?
				 LIMIT 1`,
				[input.personId],
			);
			const employee: AttendanceEmployee | null =
				empRows.length > 0
					? {
							id: Number(empRows[0].id),
							empCode: Number(empRows[0].emp_code),
							name: String(empRows[0].name ?? ""),
							image:
								typeof empRows[0].image === "string" ? empRows[0].image : null,
						}
					: null;

			const {
				workStartHour,
				workStartMinute,
				lateThresholdHour,
				lateThresholdMinute,
				workEndHour,
				workEndMinute,
			} = ATTENDANCE_RULES;

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
			while (cursor < endExclusive) {
				const dateStr = toDateString(cursor);
				const dow = cursor.getDay();
				const isWeekend = dow === 5 || dow === 6;
				const isFuture = dateStr > todayStr;

				if (isWeekend) {
					const dayLogs = byDate.get(dateStr);
					if (dayLogs && dayLogs.length > 0) {
						const hasMultiple = dayLogs.length > 1;
						const isSingleOut =
							!hasMultiple &&
							Boolean(dayLogs[0].deviceIp?.includes("172.18.1.80"));
						days.push({
							date: dateStr,
							checkIn: isSingleOut ? null : formatTime(dayLogs[0].datetime),
							checkOut: isSingleOut
								? formatTime(dayLogs[0].datetime)
								: hasMultiple
									? formatTime(dayLogs[dayLogs.length - 1].datetime)
									: null,
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
						status: "future",
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

				const hasMultiple = dayLogs.length > 1;
				const isSingleOut =
					!hasMultiple && Boolean(dayLogs[0].deviceIp?.includes("172.18.1.80"));

				const checkInTime = isSingleOut ? null : dayLogs[0].datetime;
				const checkOutTime = isSingleOut
					? dayLogs[0].datetime
					: hasMultiple
						? dayLogs[dayLogs.length - 1].datetime
						: null;

				const workStart = new Date(cursor);
				workStart.setHours(workStartHour, workStartMinute, 0, 0);
				const lateThreshold = new Date(cursor);
				lateThreshold.setHours(lateThresholdHour, lateThresholdMinute, 0, 0);
				const workEnd = new Date(cursor);
				workEnd.setHours(workEndHour, workEndMinute, 0, 0);

				// Late if check-in is after the threshold (8:10),
				// but late minutes are counted from the work start (8:00)
				const isLate = checkInTime ? checkInTime > lateThreshold : false;
				const lateMinutes =
					isLate && checkInTime
						? Math.max(0, minutesBetween(workStart, checkInTime))
						: 0;

				let extraMinutes = 0;
				if (checkOutTime && checkOutTime > workEnd) {
					extraMinutes = minutesBetween(workEnd, checkOutTime);
				}

				days.push({
					date: dateStr,
					checkIn: checkInTime ? formatTime(checkInTime) : null,
					checkOut: checkOutTime ? formatTime(checkOutTime) : null,
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
