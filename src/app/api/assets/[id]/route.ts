import { type NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

import db from "@/lib/database";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: idParam } = await params;
		const id = Number(idParam);

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
		}

		const [assetQuery, logsQuery] = await Promise.all([
			db.iss.execute<RowDataPacket[] & any>(`
				SELECT a.*, e.name as owner, e.image as empImg
				FROM assets a
				LEFT JOIN employees e ON e.empID = a.empID
				WHERE a.id = ${id}
				LIMIT 1
			`),
			db.iss.execute<RowDataPacket[] & any>(`
				SELECT 
					e1.name as old, 
					e2.name as new, 
					a.date, 
					e2.image
				FROM assestOwnerUpdateLogs a
				LEFT JOIN employees e1 ON e1.empID = a.oldOwnerEmpID
				LEFT JOIN employees e2 ON e2.empID = a.newOwnerID
				WHERE a.assetID = ${id}
				ORDER BY a.date ASC
			`),
		]);

		const [assetRows] = assetQuery;
		const [logRows] = logsQuery;

		const asset = assetRows[0] || null;

		if (!asset) {
			return NextResponse.json({ error: "Asset not found" }, { status: 404 });
		}

		const logs = logRows.map((row: any) => ({
			old: row.old || "",
			new: row.new || "",
			date: row.date.toISOString(),
			image: row.image || "",
		}));

		const latestLog = logs[logs.length - 1];

		const assetDetails = {
			...asset,
			owner: latestLog?.new || asset.owner,
			empImg: latestLog?.image || asset.empImg,
			ownerChangeLogs: logs,
		};

		return NextResponse.json(assetDetails);
	} catch (error) {
		console.error("Error fetching asset:", error);
		return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
	}
}
