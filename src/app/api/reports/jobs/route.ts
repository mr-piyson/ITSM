import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { mes } from "@/lib/database"

export const dynamic = "force-dynamic"

// 1. Update Interface to use boolean
export interface ApiJobsData {
  job_id: string
  epicor_asm_part_no: string
  date: string
  project_code: string
  total_panels: string
  printed_panels: number
  inspected_panels: number
  has_printed_panel: boolean
  has_inspected_panel: boolean
}

const FilterSchema = z
  .enum([
    "future",
    "today",
    "last30days",
    "last90days",
    "1year",
    "2years",
    "3years",
    "5years",
    "all",
  ])
  .catch("all")

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const filter = FilterSchema.parse(searchParams.get("filter"))

    let whereClause = "WHERE 1=1"

    // Optimized date filtering (SARGable)
    switch (filter) {
      case "future":
        whereClause += " AND u.date06 >= CURDATE() + INTERVAL 1 DAY"
        break
      case "today":
        whereClause +=
          " AND u.date06 >= CURDATE() AND u.date06 < CURDATE() + INTERVAL 1 DAY"
        break
      case "last30days":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 30 DAY"
        break
      case "last90days":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 90 DAY"
        break
      case "1year":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 1 YEAR"
        break
      case "2years":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 2 YEAR"
        break
      case "3years":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 3 YEAR"
        break
      case "5years":
        whereClause += " AND u.date06 >= CURDATE() - INTERVAL 5 YEAR"
        break
      default:
        break
    }

    const sql = `SELECT 
        u.key1 AS job_id,
        u.date06 AS date,
        u.shortchar06 AS project_code,
        u.shortchar01 AS epicor_asm_part_no,
        COUNT(DISTINCT u.key5) AS total_panels,
        COUNT(DISTINCT lp.part_id) AS printed_panels,
        COUNT(DISTINCT ir.panel_serial) AS inspected_panels,
        -- SQL still returns 1 or 0 here
        MAX(CASE WHEN lp.part_id IS NOT NULL THEN 1 ELSE 0 END) AS has_printed_panel,
        MAX(CASE WHEN ir.panel_serial IS NOT NULL THEN 1 ELSE 0 END) AS has_inspected_panel
      FROM label_app.ud31 u
      LEFT JOIN mes.log_printed lp
        ON lp.part_id = u.key5
        AND lp.print_for = 'panels'
      LEFT JOIN quality.inspection_results ir
        ON ir.panel_serial = u.key5
      ${whereClause}
      GROUP BY 
        u.key1, u.date06, u.shortchar06, u.shortchar01
    `

    // Type the raw database response as 'any' or an intermediate type
    const [rawRows] = (await mes.execute(sql)) as [any[], any]

    // 2. Transform 1/0 to true/false
    const formattedRows: ApiJobsData[] = rawRows.map((row) => ({
      ...row,
      // Boolean(1) is true, Boolean(0) is false
      has_printed_panel: Boolean(row.has_printed_panel),
      has_inspected_panel: Boolean(row.has_inspected_panel),
    }))

    return NextResponse.json(formattedRows, { status: 200 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
