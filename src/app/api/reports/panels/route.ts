import { type NextRequest, NextResponse } from "next/server";
import { mes } from "@/lib/prisma";

function getTableName(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `hikvision.vlog_${year}${month}`;
}

function getAttendanceDateRange() {
  const today = new Date();
  let startMonth = today.getMonth(); // zero-based index
  let startYear = today.getFullYear();

  // If today is before 23, the start date is 23 of previous month
  if (today.getDate() < 23) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  const startDate = new Date(startYear, startMonth, 23);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);
  endDate.setDate(22);

  return { startDate, endDate };
}

export async function GET(req: NextRequest) {
  try {
    const { startDate, endDate } = getAttendanceDateRange();

    // Identify all months in the range
    const tables: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      tables.push(getTableName(current));
      current.setMonth(current.getMonth() + 1);
    }

    // Build query for each table
    const queries = tables.map(
      (table) => `
      SELECT *
      FROM ${table}
      WHERE person_id = 5738
        AND datetime BETWEEN '${startDate.toISOString().slice(0, 10)}'
                         AND '${endDate.toISOString().slice(0, 10)}'
    `
    );

    // Combine queries with UNION ALL
    const finalQuery = queries.join(" UNION ALL ");

    const res = await mes.query(finalQuery);

    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
