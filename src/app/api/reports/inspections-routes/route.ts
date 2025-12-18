// app/api/inspection-summary/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { mes } from "@/lib/database";

export async function GET(request: NextRequest) {
  // 1. Get the 'filter' query parameter
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");

  // 2. Base SQL query (Subquery and aggregation logic)
  let sql = `SELECT 
        t.panel_serial,
        t.project,
        MAX(t.datetime_out) AS latest_out,
        GROUP_CONCAT(t.gate_name ORDER BY t.datetime_out SEPARATOR ',') AS route
    FROM (
        SELECT 
            ir.panel_serial,
            ir.project,
            ir.datetime_out,
            -- MySQL CASE statement to map gate IDs to names
            CASE ir.gate 
                WHEN 1  THEN 'Mold'
                WHEN 2  THEN 'Gelcoating'
                WHEN 3  THEN 'Trimming'
                WHEN 4  THEN 'Finishing'
                WHEN 5  THEN 'Painting'
                WHEN 6  THEN 'Final'
                WHEN 10 THEN 'Demolding'
                WHEN 11 THEN 'Drilling'
                WHEN 12 THEN 'Bonding'
                WHEN 15 THEN 'Paint Prep'
                WHEN 16 THEN 'Wrapping'
                WHEN 17 THEN 'Packing'
                WHEN 18 THEN 'Mixing'
                WHEN 19 THEN 'Casting'
                WHEN 20 THEN 'Pullout Test'
                WHEN 21 THEN 'Curing'
                WHEN 22 THEN 'After Trimming'
            END AS gate_name
        FROM quality.inspection_results ir
        WHERE ir.inspection_result = 'OK'
    ) t
  `;

  // 3. Handle default case (no filter)
  if (!filter) {
    return NextResponse.json([]);
  }

  // 4. Apply date filter logic (using MySQL date functions)
  let whereClause = "";

  switch (filter) {
    case "today":
      whereClause = " WHERE DATE(t.datetime_out) = CURDATE()";
      break;
    case "last30days":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      break;
    case "last7days":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
      break;
    case "last90days":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
      break;
    case "1year":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
      break;
    case "2years":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)";
      break;
    case "3years":
      whereClause =
        " WHERE DATE(t.datetime_out) >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)";
      break;
    case "all":
      // No WHERE clause, leave whereClause empty
      break;
    default:
      // Invalid filter, return empty array
      return NextResponse.json([]);
  }

  // 5. Assemble and finalize the SQL query
  // The WHERE clause needs to apply to the inner 't' table or be part of the outer query.
  // Since the date is filtered *before* the outer GROUP BY, we apply it to the inner SELECT result (t).
  sql += whereClause;
  sql += " GROUP BY t.panel_serial";

  // 6. Execute the query
  try {
    // Note: We use execute() without a second argument (params) since we moved
    // all date calculations into the SQL string using MySQL functions (CURDATE, DATE_SUB).
    const [rows] = await mes.execute(sql);

    return NextResponse.json(rows as any);
  } catch (error) {
    console.error("Database query error:", error);
    // 7. Handle database errors (HTTP 500)
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
