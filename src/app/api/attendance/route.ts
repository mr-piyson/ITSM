import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMinute,
  parseISO,
} from "date-fns"
import { NextResponse } from "next/server"

import db from "@/lib/database"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")
  const month = searchParams.get("month")
  const workerId = searchParams.get("workerId")

  if (!year || !month || !workerId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const paddedMonth = month.padStart(2, "0")
  const tableName = `hikvision.log_${year}${paddedMonth}`

  try {
    // 1. Fetch Logs
    const query = `
      SELECT h.time, h.device_ip, h.logPictureURL, e.name, e.emp_id 
      FROM ${tableName} h
      INNER JOIN mes.employees e ON e.emp_id = h.employeeNoString 
      AND h.employeeNoString = ? 
      ORDER BY h.time ASC
    `

    const [logs]: any = await db.mes.query(query, [workerId])

    if (logs.length === 0) {
      return NextResponse.json({
        data: [],
        summary: { totalHours: 0, employeeName: "" },
      })
    }

    // 2. Group Logs by Day
    const attendanceMap: Record<string, any> = {}

    logs.forEach((log: any) => {
      const day = format(log.time, "yyyy-MM-dd")

      // Initialize day if not exists
      if (!attendanceMap[day]) {
        attendanceMap[day] = {
          date: day,
          employeeName: log.name,
          employeeId: log.emp_id,
          firstLog: log, // Store full log object to access image/device later
          lastLog: log,
        }
      }

      // Always update lastLog as we iterate (since logs are sorted ASC)
      attendanceMap[day].lastLog = log
    })

    // 3. Generate All Days Sequence
    const startDate = parseISO(`${year}-${paddedMonth}-01`)
    const endDate = endOfMonth(startDate)
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    let totalMinutesMonth = 0

    const isWeekend = (dateString: string) => {
      const day = new Date(dateString).getDay()
      return day === 5 || day === 6 // 5 = Friday, 6 = Saturday
    }

    const result = allDays.map((dateObj) => {
      const dateKey = format(dateObj, "yyyy-MM-dd")
      const record = attendanceMap[dateKey]

      // Case: Absent
      if (!record) {
        return {
          date: dateKey,
          status: "Absent",
          startTime: "-",
          endTime: "-",
          hours: "00:00",
          imageStart: null,
          imageEnd: null,
        }
      }
      // Case: Weekend
      if (isWeekend(dateKey)) {
        return {
          date: dateKey,
          status: "Weekend",
          startTime: "-",
          endTime: "-",
          hours: "00:00",
          imageStart: null,
          imageEnd: null,
        }
      }

      // Calculation Logic
      const start = record.firstLog.time
      const end = record.lastLog.time

      // If only one punch exists, duration is 0
      const diff = differenceInMinutes(end, start)
      totalMinutesMonth += diff

      const hours = Math.floor(diff / 60)
      const mins = diff % 60

      // Check if single punch (Start time same as End time)
      const isSinglePunch = isSameMinute(start, end)

      return {
        date: dateKey,
        status: isSinglePunch ? "Incomplete" : "Present", // Mark incomplete if only 1 punch
        employeeName: record.employeeName,
        startTime: format(start, "HH:mm"),
        endTime: isSinglePunch ? "-" : format(end, "HH:mm"), // Hide end time if it's the same as start
        hours: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
        // Links for images
        imageStart: `http://intranet.bfginternational.com:88${record.firstLog.logPictureURL}`,
        imageEnd: `http://intranet.bfginternational.com:88${record.lastLog.logPictureURL}`,
      }
    })

    const totalHours = Math.floor(totalMinutesMonth / 60)
    const totalRemainingMins = totalMinutesMonth % 60

    return NextResponse.json({
      data: result,
      summary: {
        totalHours: `${totalHours}:${totalRemainingMins.toString().padStart(2, "0")}`,
        employeeName: logs[0].name,
        employeeId: logs[0].emp_id,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Database error or Table not found" },
      { status: 500 }
    )
  }
}
