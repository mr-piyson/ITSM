import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { mes } from "@/lib/database";

function getTableName(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `hikvision.vlog_${year}${month}`;
}

function getAttendanceDateRange(year: number, month: number) {
  // month is 1-12, representing the work month
  // Start: 23rd of previous month
  // End: 22nd of current month

  let startMonth = month - 2; // previous month (0-indexed)
  let startYear = year;

  if (startMonth < 0) {
    startMonth = startMonth + 12;
    startYear -= 1;
  }

  const startDate = new Date(startYear, startMonth, 23, 0, 0, 0);
  const endDate = new Date(year, month - 1, 22, 23, 59, 59);

  return { startDate, endDate };
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
}

function getAllWorkDays(startDate: Date, endDate: Date): string[] {
  const workDays: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (!isWeekend(current)) {
      workDays.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }

  return workDays;
}

function calculateLateMinutes(attendanceTime: Date): number {
  const hours = attendanceTime.getHours();
  const minutes = attendanceTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const onTime = 8 * 60 + 16; // 8:16 = 496 minutes
  const late30 = 8 * 60 + 30; // 8:30 = 510 minutes
  const late60 = 9 * 60 + 10; // 9:10 = 550 minutes

  if (totalMinutes <= onTime) return 0;
  if (totalMinutes <= late30) return 30;
  if (totalMinutes <= late60) return 60;
  return 90;
}

function calculateExtraMinutes(leaveTime: Date): number {
  const hours = leaveTime.getHours();
  const minutes = leaveTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const standardEnd = 17 * 60 + 56; // 17:56 = 1076 minutes
  const extra30 = 18 * 60 + 16; // 18:16 = 1096 minutes
  const extra60 = 18 * 60 + 30; // 18:30 = 1110 minutes

  if (totalMinutes <= standardEnd) return 0;
  if (totalMinutes <= extra30) return 30;
  if (totalMinutes <= extra60) return 60;
  return 90;
}

function calculateWorkHours(lateMinutes: number, extraMinutes: number) {
  const standardMinutes = 9 * 60; // 9 hours standard
  const totalMinutes = standardMinutes - lateMinutes + extraMinutes;

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes,
  };
}

interface DailyAttendance {
  date: string;
  dayOfWeek: string;
  attendance: string | null;
  leave: string | null;
  status: "present" | "absent";
  lateMinutes: number;
  extraMinutes: number;
  workHours: string;
  totalLogs: number;
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]/attendance">
) {
  try {
    const empCode = (await ctx.params).id;
    const searchParams = req.nextUrl.searchParams;

    // Get year and month from search params
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        {
          error:
            "Year and month parameters are required (e.g., ?year=2025&month=11)",
        },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);

    // Validate year and month
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid year or month. Month must be 1-12, year must be reasonable.",
        },
        { status: 400 }
      );
    }

    // Validate employee code
    const validity = z.number().safeParse(Number(empCode));
    if (!validity.success) {
      return NextResponse.json(
        { error: "Invalid employee code" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = getAttendanceDateRange(year, month);

    // Get all work days (excluding weekends)
    const allWorkDays = getAllWorkDays(startDate, endDate);

    // Identify all months in the range
    const tables: Set<string> = new Set();
    const current = new Date(startDate);

    while (current <= endDate) {
      tables.add(getTableName(current));
      current.setMonth(current.getMonth() + 1);
    }

    // Build query for each table
    const queries = Array.from(tables).map(
      (table) => `
      SELECT 
        DATE(datetime) as date,
        MIN(datetime) as attendance,
        MAX(datetime) as \`leave\`,
        COUNT(*) as total_logs
      FROM ${table}
      WHERE person_id = ${empCode}
        AND datetime >= '${startDate.toISOString().slice(0, 19).replace("T", " ")}'
        AND datetime <= '${endDate.toISOString().slice(0, 19).replace("T", " ")}'
      GROUP BY DATE(datetime)
    `
    );

    // Combine queries with UNION ALL
    const finalQuery =
      queries.length > 1
        ? `SELECT * FROM (${queries.join(" UNION ALL ")}) as combined ORDER BY date ASC`
        : `${queries[0]} ORDER BY date ASC`;

    const [res] = await mes.query(finalQuery);

    // Create a map of attendance records by date
    const attendanceMap = new Map<string, any>();
    (res as any[]).forEach((row) => {
      const dateStr = new Date(row.date).toISOString().slice(0, 10);
      attendanceMap.set(dateStr, row);
    });

    // Process all work days
    const attendanceData: DailyAttendance[] = allWorkDays.map((dateStr) => {
      const record = attendanceMap.get(dateStr);
      const date = new Date(`${dateStr}T00:00:00`);
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (record) {
        const attendanceDate = new Date(record.attendance);
        const leaveDate = new Date(record.leave);

        const lateMinutes = calculateLateMinutes(attendanceDate);
        const extraMinutes = calculateExtraMinutes(leaveDate);
        const workHours = calculateWorkHours(lateMinutes, extraMinutes);

        return {
          date: dateStr,
          dayOfWeek: dayNames[date.getDay()],
          attendance: record.attendance,
          leave: record.leave,
          status: "present" as const,
          lateMinutes,
          extraMinutes,
          workHours: `${workHours.hours}:${workHours.minutes.toString().padStart(2, "0")}`,
          totalLogs: record.total_logs,
        };
      } else {
        // Absent day
        return {
          date: dateStr,
          dayOfWeek: dayNames[date.getDay()],
          attendance: null,
          leave: null,
          status: "absent" as const,
          lateMinutes: 0,
          extraMinutes: 0,
          workHours: "0:00",
          totalLogs: 0,
        };
      }
    });

    // Calculate summary statistics (only for present days)
    const presentDays = attendanceData.filter(
      (day) => day.status === "present"
    );
    const absentDays = attendanceData.filter((day) => day.status === "absent");

    const totalLateMinutes = presentDays.reduce(
      (sum, day) => sum + day.lateMinutes,
      0
    );
    const totalExtraMinutes = presentDays.reduce(
      (sum, day) => sum + day.extraMinutes,
      0
    );
    const totalWorkMinutes = presentDays.reduce((sum, day) => {
      const [h, m] = day.workHours.split(":").map(Number);
      return sum + (h * 60 + m);
    }, 0);

    return NextResponse.json({
      employeeCode: empCode,
      workMonth: `${year}-${month.toString().padStart(2, "0")}`,
      period: {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
      },
      summary: {
        totalWorkDays: allWorkDays.length,
        presentDays: presentDays.length,
        absentDays: absentDays.length,
        totalLateHours: `${Math.floor(totalLateMinutes / 60)}:${(totalLateMinutes % 60).toString().padStart(2, "0")}`,
        totalExtraHours: `${Math.floor(totalExtraMinutes / 60)}:${(totalExtraMinutes % 60).toString().padStart(2, "0")}`,
        totalWorkHours: `${Math.floor(totalWorkMinutes / 60)}:${(totalWorkMinutes % 60).toString().padStart(2, "0")}`,
      },
      attendance: attendanceData,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
