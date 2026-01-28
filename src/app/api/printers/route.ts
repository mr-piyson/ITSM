import { NextRequest, NextResponse } from "next/server"

import db from "@/lib/database"

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/printers">
) {
  try {
    const [printers] = await db.iss.query(`select * from ISS.printers;`)
    return NextResponse.json(printers)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
