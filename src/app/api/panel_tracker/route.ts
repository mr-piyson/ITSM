import db from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/panel_tracker
 * Fetch panel information by ID
 */
export async function GET(request: NextRequest) {
  try {
    // get search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing panel ID" }, { status: 400 });
    }

    const partId = decodeURIComponent(id);

    // Fetch panel info
    const panelInfo = await db.mes.query(
      `SELECT i.*, pl.job_id, DATE(pl.plan_added_date) as execution_date
       FROM label_app.kla_factory_epicor i
       LEFT JOIN mes.plans pl ON pl.panel_serial = i.qr_code
       WHERE i.qr_code = ?`,
      [partId],
    );

    if (panelInfo.length === 0) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    const panelRaw = panelInfo[0][0];

    console.log(panelInfo);

    // Map database fields to component expected fields
    const panel = {
      id: panelRaw.qr_code,
      panel_ref: panelRaw.qr_code,
      project_code: panelRaw.project_code || "",
      planning_project: panelRaw.planning_project || "",
      project_category: panelRaw.project_category || "",
      epicor_part_no: panelRaw.epicor_part_no || "",
      epicor_asm_part_no: panelRaw.epicor_asm_part_no || "",
      qrcode_base64: panelRaw.qrcode_base64 || "",
      status: panelRaw.status || "Active",
      created_at: panelRaw.created_at,
      updated_at: panelRaw.updated_at,
    };

    // Fetch job info
    const jobInfo = await db.mes.query(
      `SELECT p.id, p.panel_serial, l.key1 as job_id, 
              CAST(l.number09 as int) job_serial,
              shortchar02 as erp_part_no, shortchar11 as erp_part_rev
       FROM mes.plans p
       INNER JOIN label_app.ud31_lite l ON l.key1=p.job_id AND l.key5 = p.panel_serial
       WHERE p.panel_serial = ?
       ORDER BY p.id DESC LIMIT 1`,
      [partId],
    );

    // Fetch tracking logs
    const trackingLogs = await db.mes.query(
      `SELECT id, print_for, info, date as created_at FROM mes.log_printed 
       WHERE part_id = ? 
      `,
      [partId],
    );

    // Fetch edit history
    const editHistoryData = await db.mes.query(
      `SELECT info FROM mes.log_printed 
       WHERE part_id = ? 
      LIMIT 1`,
      [partId],
    );

    // Parse edit history JSON
    let editHistory = {};
    if (editHistoryData.length > 0 && editHistoryData[0].info) {
      editHistory = JSON.parse(editHistoryData[0].info);
    }

    return NextResponse.json({
      success: true,
      data: {
        panel,
        jobInfo: jobInfo[0] || {},
        trackingLogs: trackingLogs || [],
        editHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching panel:", error);
    return NextResponse.json(
      { error: "Failed to fetch panel" },
      { status: 500 },
    );
  }
}
