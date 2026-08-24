import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

import { checkCronSecret, formatDate, todayDateString } from "@/lib/cron";
import db from "@/lib/database";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

type Row = RowDataPacket & Record<string, unknown>;

function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function bookingRow(row: Row) {
	return {
		assetID: Number(row.assetID),
		type: row.type ? String(row.type) : "-",
		model: row.model ? String(row.model) : "-",
		deviceName: row.deviceName ? String(row.deviceName) : "",
		otherInfo: row.otherInfo ? String(row.otherInfo) : "-",
		employeeName: row.employeeName ? String(row.employeeName) : "Unknown",
		empID: Number(row.empID),
		purpose: row.bookingPurpose ? String(row.bookingPurpose) : "-",
		bookingDate: formatDate(row.bookingDate),
		returnDate: formatDate(row.returnDate),
	};
}

/**
 * Cron job (outdateScript.php equivalent): emails an overdue notice for every
 * booked asset past its return date plus a digest table to IT.
 */
export async function GET(request: Request) {
	const unauthorized = checkCronSecret(request);
	if (unauthorized) {
		return unauthorized;
	}

	const today = todayDateString();

	const [rows] = await db.iss.execute<Row[]>(
		`SELECT ab.*, e.name AS employeeName, e.email AS employeeEmail,
		        a.deviceName, a.type, a.model
		 FROM assetBooking ab
		 LEFT JOIN employees e ON e.empID = ab.empID
		 LEFT JOIN assets a ON a.id = ab.assetID
		 WHERE ab.status != 'recieved' AND ab.returnDate <= ?
		 ORDER BY ab.returnDate ASC`,
		[today],
	);

	if (rows.length === 0) {
		return NextResponse.json({ ok: true, overdue: 0 });
	}

	let sent = 0;
	for (const raw of rows) {
		const b = bookingRow(raw);
		const result = await sendMail({
			to: raw.employeeEmail ? [String(raw.employeeEmail)] : undefined,
			subject: "Outdated Booked Asset",
			html: `
				<p>Dear ${escapeHtml(b.employeeName)},</p>
				<p>Your booked asset <b>(${escapeHtml(b.type)}: ${escapeHtml(b.model)} - ${escapeHtml(b.deviceName)})</b>
				was due to be returned on <b>${b.returnDate}</b>.</p>
				<p>Please be sure to return it promptly.</p>
				<p>If you would like to extend your booking, please reply back with the preferred time period.</p>
				<br>
				<p>Best Regards,<br><br><b>BFG IT Department</b></p>
			`,
		});
		if (result.sent) {
			sent += 1;
		}
	}

	const digestRows = rows
		.map((raw) => {
			const b = bookingRow(raw);
			return `<tr>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${b.assetID}</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${escapeHtml(b.type)}</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${escapeHtml(b.model)} (${escapeHtml(b.deviceName)})</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${escapeHtml(b.otherInfo)}</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${escapeHtml(b.employeeName)} (EmpID- ${b.empID})</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${escapeHtml(b.purpose)}</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${b.bookingDate}</td>
				<td style="border:1px solid;border-collapse:collapse;padding:8px;">${b.returnDate}</td>
			</tr>`;
		})
		.join("");

	await sendMail({
		subject: `Outdated Booked Assets Report: ${formatDate(today)}`,
		html: `
			<p>The following Asset Bookings are overdue:-</p>
			<table style="border:1px solid;border-collapse:collapse;">
				<tr>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Asset ID</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Asset Type</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Asset Model (Name)</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Other Info</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>For Employee</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Purpose</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Booking Date</b></td>
					<td style="border:1px solid;border-collapse:collapse;padding:8px;"><b>Return Date</b></td>
				</tr>
				${digestRows}
			</table>
			<br>
			<p>Best Regards,<br><br><b>BFG IT Department</b></p>
		`,
	});

	return NextResponse.json({
		ok: true,
		overdue: rows.length,
		noticesSent: sent,
	});
}
