import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type AssetRow = RowDataPacket & Record<string, unknown>;

export const assetsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const [rows] = await ctx.db.iss.execute<AssetRow[]>(`
			SELECT a.*, e.name as owner
			FROM assets a
			LEFT JOIN employees e ON e.empID = a.empID
			ORDER BY a.id DESC
		`);
		return rows;
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			const [assetQuery, logsQuery] = await Promise.all([
				ctx.db.iss.execute<AssetRow[]>(`
					SELECT a.*, e.name as owner, e.image as empImg
					FROM assets a
					LEFT JOIN employees e ON e.empID = a.empID
					WHERE a.id = ${input.id}
					LIMIT 1
				`),
				ctx.db.iss.execute<AssetRow[]>(`
					SELECT
						e1.name as old,
						e2.name as new,
						a.date,
						e2.image
					FROM assestOwnerUpdateLogs a
					LEFT JOIN employees e1 ON e1.empID = a.oldOwnerEmpID
					LEFT JOIN employees e2 ON e2.empID = a.newOwnerID
					WHERE a.assetID = ${input.id}
					ORDER BY a.date ASC
				`),
			]);

			const [assetRows] = assetQuery;
			const [logRows] = logsQuery;

			const asset = assetRows[0] ?? null;

			if (!asset) {
				return null;
			}

			const logs = logRows.map((row) => ({
				old: String(row.old ?? ""),
				new: String(row.new ?? ""),
				date: (row.date as Date).toISOString(),
				image: String(row.image ?? ""),
			}));

			const latestLog = logs[logs.length - 1];

			return {
				...asset,
				owner: latestLog?.new || asset.owner,
				empImg: latestLog?.image || asset.empImg,
				ownerChangeLogs: logs,
			};
		}),
});
