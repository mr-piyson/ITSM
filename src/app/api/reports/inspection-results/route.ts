import db from "@/lib/database";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export type APIInspectionResult = RowDataPacket & {
  id: number;
  panel_serial: string;
  project: string;
  // product_ref: string;
  datetime: Date;
  // datetime_new: Date;
  // date: Date;
  gate: number;
  inspection_result: string;
  epicor_asm_part_no: string;
  inspector: string;
  user: string;
  factory: string;
};

const gateMap = {
  1: "Mold",
  2: "Gelcoating",
  3: "Trimming",
  4: "Finishing",
  5: "Painting",
  6: "Final",
  10: "Demolding",
  11: "Drilling",
  12: "Bonding",
  15: "Paint Prep",
  16: "Wrapping",
  17: "Packing",
  18: "Mixing",
  19: "Casting",
  20: "Pullout Test",
  21: "Curing",
  22: "After Trimming",
};
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/reports/inspection-results">
) {
  try {
    const { searchParams } = new URL(req.url);

    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const gates = searchParams.getAll("gate").map(Number);

    const conditions = [];
    const values = [];

    if (fromDate) {
      conditions.push("ir.date >= ?");
      values.push(fromDate);
    }

    if (toDate) {
      conditions.push("ir.date <= ?");
      values.push(toDate);
    }

    if (gates.length > 0) {
      const placeholders = gates.map(() => "?").join(",");
      conditions.push(`ir.gate = ${placeholders}`);
      values.push(...gates);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const query = `SELECT 
        ir.id,
        ir.panel_serial,
        u.shortchar01 as epicor_asm_part_no,
        ir.project,
       -- ir.product_ref,
        ir.datetime,
       -- ir.datetime_new,
        ir.date,
        ir.gate,
        ir.inspection_result,
        ir.inspector,
       -- ir.user,
        ir.factory
    FROM quality.inspection_results ir
	  LEFT JOIN 
      label_app.ud31 u ON u.key5 = ir.panel_serial
      ${whereClause}
      ORDER by ir.datetime DESC;
    `;

    const [rows] = await db.mes.execute<APIInspectionResult[]>(query, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
