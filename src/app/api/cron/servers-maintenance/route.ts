import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

import { checkCronSecret, formatDate, todayDateString } from "@/lib/cron";
import db from "@/lib/database";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

type Row = RowDataPacket & Record<string, unknown>;

/**
 * Cron job (serverMaintenenceEmail.php equivalent): emails IT a digest of
 * servers whose maintenance due date has arrived.
 */
export async function GET(request: Request) {
	const unauthorized = checkCronSecret(request);
	if (unauthorized) {
		return unauthorized;
	}

	const [rows] = await db.iss.execute<Row[]>(
		`SELECT name, maintenanceLast, maintenanceDue
		 FROM servers
		 WHERE inActive = 0 AND maintenanceDue <= ?
		 ORDER BY maintenanceDue ASC`,
		[todayDateString()],
	);

	if (rows.length === 0) {
		return NextResponse.json({ ok: true, due: 0 });
	}

	const digestRows = rows
		.map(
			(row) => `<tr>
				<td style="border:1px solid black;padding:4px;">${row.name}</td>
				<td style="border:1px solid black;padding:4px;">${formatDate(row.maintenanceLast)}</td>
				<td style="border:1px solid black;padding:4px;">${formatDate(row.maintenanceDue)}</td>
			</tr>`,
		)
		.join("");

	const result = await sendMail({
		subject: `Servers Due For Maintenance: ${todayDateString()}`,
		html: `
			<p>The following servers are due for maintenance:-</p>
			<table style="border:1px solid black;border-collapse:collapse;">
				<tr>
					<td style="border:1px solid black;padding:4px;"><b>Server Name</b></td>
					<td style="border:1px solid black;padding:4px;"><b>Last Maintenance</b></td>
					<td style="border:1px solid black;padding:4px;"><b>Maintenance Due</b></td>
				</tr>
				${digestRows}
			</table>
			<br>
			<p>Best Regards,<br><br><b>BFG IT Department</b></p>
		`,
	});

	return NextResponse.json({
		ok: true,
		due: rows.length,
		emailSent: result.sent,
	});
}
