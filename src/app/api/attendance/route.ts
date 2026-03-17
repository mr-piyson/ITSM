import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMinute,
  parseISO,
} from "date-fns"
import { NextRequest, NextResponse } from "next/server"

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, personId, totalHours = 9, startTime, endTime } = body

    if (!date || !personId) {
      return NextResponse.json(
        { error: "Missing date or personId" },
        { status: 400 }
      )
    }

    // --- 1. Generate IN Time ---
    const inTime = new Date(`${date}T00:00:00+03:00`)

    if (startTime) {
      // Use exact provided time, randomize seconds
      const [h, m] = startTime.split(":").map(Number)
      inTime.setHours(h, m, Math.floor(Math.random() * 60))
    } else {
      // Fallback: Randomly between 07:50 and 08:16
      inTime.setHours(7, 50, 0)
      inTime.setMinutes(inTime.getMinutes() + Math.floor(Math.random() * 27))
      inTime.setSeconds(Math.floor(Math.random() * 60))
    }

    // --- 2. Generate OUT Time ---
    const outTime = new Date(inTime.getTime())

    if (endTime) {
      // Use exact provided time, randomize seconds
      const [h, m] = endTime.split(":").map(Number)
      outTime.setHours(h, m, Math.floor(Math.random() * 60))

      // Handle edge case if shift crosses midnight into the next day
      if (outTime < inTime) {
        outTime.setDate(outTime.getDate() + 1)
      }
    } else {
      // Fallback: Use totalHours + 1 to 15 mins buffer
      outTime.setHours(outTime.getHours() + Number(totalHours))
      outTime.setMinutes(
        outTime.getMinutes() + Math.floor(Math.random() * 15) + 1
      )
      outTime.setSeconds(Math.floor(Math.random() * 60))
    }

    // Helper to format for MySQL/Hikvision strings
    const format = (d: Date) => {
      const offset = "+03:00"
      const pad = (n: number) => n.toString().padStart(2, "0")
      const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      return {
        datetime: `${datePart} ${timePart}`,
        time_raw: `${datePart}T${timePart}${offset}`,
      }
    }

    const inLog = format(inTime)
    const outLog = format(outTime)

    // --- 3. SQL Construction Function ---
    const buildQuery = (deviceIp: string, log: ReturnType<typeof format>) => `
      INSERT INTO hikvision.vlog_202603 
      (device_ip, device_model, device_serial, serial_no, person_id, person_name, card_no, \`datetime\`, time_raw)
      SELECT 
          dev.device_ip, 
          dev.device_model, 
          dev.device_serial,
          (SELECT COALESCE(MAX(serial_no), 0) + 1 FROM hikvision.vlog_202603 WHERE device_ip = dev.device_ip) AS next_serial,
          pers.person_id, 
          pers.person_name, 
          pers.card_no, 
          '${log.datetime}', 
          '${log.time_raw}'
      FROM 
          (SELECT device_ip, device_model, device_serial FROM hikvision.vlog_202603 WHERE device_ip = '${deviceIp}' LIMIT 1) dev,
          (SELECT person_id, person_name, card_no FROM hikvision.vlog_202603 WHERE person_id = '${personId}' LIMIT 1) pers;
    `

    const inQuery = buildQuery("172.18.1.82:80", inLog)
    const outQuery = buildQuery("172.18.1.83:80", outLog)

    console.log("inTime: ", inQuery)
    console.log("outTime: ", outQuery)
    // await db.execute(inQuery);
    // await db.execute(outQuery);

    return NextResponse.json({
      success: true,
      summary: {
        personId,
        in: inLog.datetime,
        out: outLog.datetime,
        duration: `${((outTime.getTime() - inTime.getTime()) / 3600000).toFixed(2)} hrs`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
