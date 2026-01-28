// app/api/inspection-results/route.ts
import { NextResponse } from "next/server"

import { mes } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter")

    let sql: string = `
      SELECT panel_serial, datetime_out, gate
      FROM quality.inspection_results
      WHERE inspection_result = 'OK'
    `

    const params: string[] = []

    switch (filter) {
      case "today":
        sql += ` AND DATE(datetime_out) = ?`
        params.push(new Date().toISOString().slice(0, 10))
        break
      case "last30days":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(30))
        break
      case "last7days":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(7))
        break
      case "last90days":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(90))
        break
      case "1year":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(365))
        break
      case "2years":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(365 * 2))
        break
      case "3years":
        sql += ` AND DATE(datetime_out) >= ?`
        params.push(getPastDate(365 * 3))
        break
      default:
        return NextResponse.json([])
    }

    const resRow = await mes.execute(sql, params)
    const inspections = resRow[0] as ApiInspections[]
    return NextResponse.json(inspections)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    )
  }
}

function getPastDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

type ApiInspections = {
  panel_serial: string
  datetime_out: string
  gate: number
}
