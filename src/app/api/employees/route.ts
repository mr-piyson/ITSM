import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/employees">
) {
  try {
    // GET logic here

    return NextResponse.json({})
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
