import type { assets } from "@prisma/client";
import db from "@/lib/prisma";
import AssetDetailsPage from "./AssetDetails";

export interface AssetsWithLogs extends assets {
	empImg?: string | null;
	ownerChangeLogs: {
		old: string;
		new: string;
		date: string;
		image: string;
	}[];
}

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page(props: PageProps) {
	const id = Number((await props.params).id).toString();
	const numId = Number(id);

	// Run queries in parallel to minimize wait time
	const [assetResult, logsResult] = await Promise.all([
		// Query 1: Get asset with current employee (single row)
		db.$queryRaw<
			Array<{
				id: number;
				empID: number | null;
				owner: string | null;
				empImg: string | null;
				// ... other asset fields
			}>
		>`	SELECT a.*, e.name as owner, e.image as empImg
			FROM assets a
			LEFT JOIN employees e ON e.empID = a.empID
			WHERE a.id = ${numId}
			LIMIT 1
		`,

		// Query 2: Get logs only (multiple rows)
		db.$queryRaw<
			Array<{
				old: string | null;
				new: string | null;
				date: Date;
				image: string | null;
			}>
		>`
			SELECT e1.name as old, e2.name as new, a.date, e2.image
			FROM assestOwnerUpdateLogs a
			LEFT JOIN employees e1 ON e1.empID = a.oldOwnerEmpID
			LEFT JOIN employees e2 ON e2.empID = a.newOwnerID
			WHERE a.assetID = ${numId}
			ORDER BY a.date ASC
		`,
	]);

	await db.$disconnect();

	if (!assetResult.length) {
		return <div>Asset not found</div>;
	}

	const asset = assetResult[0];
	const logs = logsResult.map((row) => ({
		old: row.old || "",
		new: row.new || "",
		date: row.date.toISOString(),
		image: row.image || "",
	}));

	// Use the most recent log data if available
	const latestLog = logs[logs.length - 1];

	const assetDetails: Partial<AssetsWithLogs> = {
		...asset,
		owner: latestLog?.new || asset.owner,
		empImg: latestLog?.image || asset.empImg,
		ownerChangeLogs: logs,
	};

	console.log("Asset Details:", assetDetails);
	return <AssetDetailsPage asset={assetDetails} />;
}
