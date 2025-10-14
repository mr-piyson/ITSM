import type { assets } from "@prisma/client";
import db from "@/lib/prisma";
import AssetDetailsPage from "./AssetDetails";

export interface AssetsWithLogs extends assets {
	ownerChangeLogs: {
		old: string;
		new: string;
		date: string;
	}[];
}

export default async function Page({
	searchParams,
}: {
	searchParams: { id: string };
}) {
	const id = (await searchParams).id || null;
	console.log(id);
	const asset = await db.assets.findFirst({
		where: {
			id: {
				equals: Number(id),
			},
		},
	});

	const logs: {
		old: string;
		new: string;
		date: string;
	}[] = await db.$queryRaw`
	SELECT a.date,e1.name as old,e2.name as new
	FROM assestOwnerUpdateLogs a
	LEFT JOIN employees e1
	ON e1.empID = a.oldOwnerEmpID
	LEFT JOIN employees e2
	ON e2.empID = a.newOwnerID
	WHERE a.assetID= ${id}
	`;

	if (!asset) {
		// Handle asset not found, you can return an error or a fallback UI
		return <div>Asset not found</div>;
	}

	const assetWithLogs: AssetsWithLogs = {
		...asset,
		ownerChangeLogs: logs || [],
	};
	console.log(assetWithLogs);

	return <AssetDetailsPage asset={assetWithLogs} />;
}
