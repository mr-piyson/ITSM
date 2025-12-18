// app/api/packages/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { mes } from "@/lib/database";

export async function GET(request: NextRequest) {
  // 1. Get the 'filter' query parameter
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");

  // 2. Initial SQL query and parameters setup
  let sql = `
    SELECT
        p.id,
        p.code,
        p.project_name,
        p.length_cm,
        p.width_cm,
        p.height_cm,
        p.weight_kg,
        p.created_at
    FROM mes.packages p
  `;
  const params: (string | Date)[] = []; // Array to hold query parameters

  // 3. Handle default case (as in PHP, if filter is not provided)
  if (!filter) {
    return NextResponse.json([]);
  }

  // 4. Apply date filter logic
  let paramValue: string | null = null;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  switch (filter) {
    case "today":
      sql += " WHERE DATE(p.created_at) = ?";
      paramValue = today;
      break;
    case "last30days":
      sql +=
        " WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      // paramValue is not strictly needed for MySQL's internal date functions
      break;
    case "last90days":
      sql +=
        " WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
      break;
    case "1year":
      sql +=
        " WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
      break;
    case "2years":
      sql +=
        " WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)";
      break;
    case "3years":
      sql +=
        " WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)";
      break;
    case "all":
      // No WHERE clause needed for 'all'
      break;
    default:
      // If filter is present but not recognized, return an empty array (similar to PHP logic)
      return NextResponse.json([]);
  }

  // If a filter was applied and requires a date parameter (like 'today'), add it
  if (paramValue) {
    params.push(paramValue);
  }

  // 5. Execute the query
  try {
    const [rows] = await mes.execute(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    // 6. Handle database errors (HTTP 500)
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
