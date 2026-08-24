import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

import { checkCronSecret, formatDate, todayDateString } from "@/lib/cron";
import db from "@/lib/database";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

type Row = RowDataPacket & Record<string, unknown>;

/**
 * Cron job (tapesEmail.php equivalent): emails IT a digest of backup tapes
 * that will expire in 90 days.
 */
export async function GET(request: Request) {
	const unauthorized = checkCronSecret(request);
	if (unauthorized) {
		return unauthorized;
	}

	const today = todayDateString();

	const [rows] = await db.iss.execute<Row[]>(
		`SELECT tapeID, location, lastWritten, expire
		 FROM tapes
		 WHERE inActive = 0 AND expire IS NOT NULL
		   AND DATE(DATE_SUB(expire, INTERVAL 90 DAY)) = ?`,
		[today],
	);

	if (rows.length === 0) {
		return NextResponse.json({ ok: true, expiring: 0 });
	}

	const digestRows = rows
		.map(
			(row) => `<tr>
				<td style="border:1px solid black;padding:4px;">${row.tapeID}</td>
				<td style="border:1px solid black;padding:4px;">${row.location ?? "-"}</td>
				<td style="border:1px solid black;padding:4px;">${formatDate(row.lastWritten)}</td>
				<td style="border:1px solid black;padding:4px;">${formatDate(row.expire)}</td>
			</tr>`,
		)
		.join("");

	const result = await sendMail({
		subject: "Tapes Expiration Reminder",
		html: `
			<p>The following backup tapes will expire within 90 days:-</p>
			<table style="border:1px solid black;border-collapse:collapse;">
				<tr>
					<td style="border:1px solid black;padding:4px;"><b>Tape ID</b></td>
					<td style="border:1px solid black;padding:4px;"><b>Location</b></td>
					<td style="border:1px solid black;padding:4px;"><b>Last Written</b></td>
					<td style="border:1px solid black;padding:4px;"><b>Expires On</b></td>
				</tr>
				${digestRows}
			</table>
			<br>
			<p>Please plan to rewrite or rotate these tapes.</p>
			<br>
			<p>Best Regards,<br><br><b>BFG IT Department</b></p>
		`,
	});

	return NextResponse.json({
		ok: true,
		expiring: rows.length,
		emailSent: result.sent,
	});
}
