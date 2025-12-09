import { type NextRequest, NextResponse } from "next/server";
import { mes } from "@/lib/database";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  // Validate year and month
  if (!year || !month) {
    return NextResponse.json(
      { error: "Year and month parameters are required" },
      { status: 400 }
    );
  }

  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  // Validate date
  if (
    Number.isNaN(yearNum) ||
    Number.isNaN(monthNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1970 ||
    yearNum > 2100
  ) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  // Format month with leading zero
  const monthFormatted = monthNum.toString().padStart(2, "0");
  const yearMonth = `${yearNum}-${monthFormatted}`;

  try {
    // Create database connection
    const sql = `SELECT DISTINCT
        pk.code as box_code,
        i.project_category as project,
        i.qr_code as part_id,
        i.panel_ref AS description,
        c.code as container_id,
        ci.created_at as date,
        c.shipped_by,
        u.key1 as job_id,
        u.shortchar01 as epicor_asm_part_no,
        u.shortchar01 as epicor_part_no
      FROM 
        mes.container_items ci
      INNER JOIN 
        mes.containers c ON c.id = ci.container_id
      INNER JOIN 
        mes.packages pk ON pk.code = ci.item_id
      INNER JOIN 
        mes.package_items pi ON pi.package_id = pk.id
      INNER JOIN 
        label_app.kla_factory_epicor i ON i.qr_code = pi.part_id
      LEFT JOIN 
        label_app.ud31 u ON u.key5 = i.qr_code
      WHERE 
        DATE_FORMAT(ci.created_at, '%Y-%m') = ?
        AND c.id IS NOT NULL 
      ORDER BY i.project_category DESC
    `;

    const [rows] = await mes.execute(sql, [yearMonth]);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
