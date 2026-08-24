import type { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";
import { z } from "zod";

import db from "@/lib/database";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const schema = z.object({
	requesterName: z.string().trim().min(1).max(100),
	requesterManager: z.string().trim().min(1).max(100),
	department: z.string().trim().min(1).max(100),
	location: z.string().trim().min(1).max(100),
	softwareMES: z.boolean(),
	softwareOffice365: z.boolean(),
	softwareEPICOR: z.boolean(),
	softwareOther: z.string().trim().max(500).optional().default(""),
	similarPermissions: z.string().trim().max(500).optional().default(""),
	hardwareSelection: z.enum(["", "pc", "laptop"]),
	hardwareOther: z.string().trim().max(500).optional().default(""),
	sharedFilesAccess: z.string().trim().max(500).optional().default(""),
	othersSpecify: z.string().trim().max(500).optional().default(""),
	justification: z.string().trim().max(2000).optional().default(""),
});

const HARDWARE_LABELS: Record<string, string> = {
	pc: "PC",
	laptop: "Laptop",
};

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function buildSummary(data: z.infer<typeof schema>): string {
	const software = [
		data.softwareMES && "MES",
		data.softwareOffice365 && "Office 365",
		data.softwareEPICOR && "EPICOR",
		data.softwareOther && `Other: ${data.softwareOther}`,
	]
		.filter(Boolean)
		.join(", ");

	const lines = [
		`Requester: ${data.requesterName}`,
		`Manager: ${data.requesterManager}`,
		`Department: ${data.department}`,
		`Location: ${data.location}`,
		`Hardware: ${data.hardwareSelection ? HARDWARE_LABELS[data.hardwareSelection] : "-"}${data.hardwareOther ? ` (${data.hardwareOther})` : ""}`,
		`Software: ${software || "-"}`,
		`Similar Permissions From: ${data.similarPermissions || "-"}`,
		`Shared Files Access: ${data.sharedFilesAccess || "-"}`,
		`Others: ${data.othersSpecify || "-"}`,
		`Justification: ${data.justification || "-"}`,
	];
	return lines.join("\n");
}

/**
 * Public submission endpoint for the IT Request Form (/documents/it-request).
 * Stores the request so it appears in the Requests module and notifies IT.
 */
export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Please fill out all required fields" },
			{ status: 400 },
		);
	}
	const data = parsed.data;

	const summary = buildSummary(data);

	const [result] = await db.iss.execute<ResultSetHeader>(
		`INSERT INTO requests
		     (user, pgtype, newpg, slctname, otherpg, modifi, descrip,
		      status, submitDate, requestPrio)
		 VALUES (0, 'it-request', NULL, 'other', 'IT Request Form', 'add',
		         ?, 'pending', NOW(), 'medium')`,
		[summary],
	);

	await sendMail({
		subject: `New IT Request Form - ${data.requesterName} (${data.department})`,
		html: `
			<p>A new IT request form has been submitted:</p>
			<table style="border:1px solid black;border-collapse:collapse;">
				<tr><td style="border:1px solid black;padding:4px;"><b>Requester</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.requesterName)}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Manager</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.requesterManager)}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Department</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.department)}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Location</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.location)}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Hardware</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.hardwareSelection ? HARDWARE_LABELS[data.hardwareSelection] : "-")}${escapeHtml(data.hardwareOther ? ` (${data.hardwareOther})` : "")}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Software</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml([data.softwareMES && "MES", data.softwareOffice365 && "Office 365", data.softwareEPICOR && "EPICOR", data.softwareOther && `Other: ${data.softwareOther}`].filter(Boolean).join(", ") || "-")}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Similar Permissions From</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.similarPermissions || "-")}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Shared Files Access</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.sharedFilesAccess || "-")}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Others</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.othersSpecify || "-")}</td></tr>
				<tr><td style="border:1px solid black;padding:4px;"><b>Justification</b></td><td style="border:1px solid black;padding:4px;">${escapeHtml(data.justification || "-")}</td></tr>
			</table>
			<br>
			<p>Best Regards,<br><b>IT Service Management System</b></p>
		`,
	});

	return NextResponse.json({
		ok: true,
		requestId: result.insertId,
	});
}
