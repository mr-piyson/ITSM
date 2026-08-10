import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

type AssetRow = RowDataPacket & Record<string, unknown>;

export type Asset = AssetRow & { id: number };

export type AssetNote = {
	old: string;
	new: string;
	date: string;
	image: string;
};

export type AssetDetail = Asset & {
	owner?: string;
	empImg?: string;
	ownerChangeLogs: AssetNote[];
};

const updateFieldsSchema = z.object({
	code: z.string().optional(),
	type: z.string().optional(),
	deviceStatus: z.string().optional(),
	location: z.string().optional(),
	department: z.string().optional(),
	purchaseDate: z.string().nullable().optional(),
	purchasePrice: z.string().optional(),
	deviceName: z.string().optional(),
	serialNumber: z.string().optional(),
	manufacturer: z.string().optional(),
	model: z.string().optional(),
	macAddress: z.string().optional(),
	ip: z.string().optional(),
	firmwareVer: z.string().optional(),
	warrantyDate: z.string().nullable().optional(),
	warrantyStatus: z.string().optional(),
	processor: z.string().optional(),
	os: z.string().optional(),
	memory: z.string().optional(),
	hdd: z.string().optional(),
	specification: z.string().optional(),
});

export const assetsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<Asset[]> => {
		const [rows] = await ctx.db.iss.execute<AssetRow[]>(`
			SELECT a.*, e.name as owner, e.image as empImg
			FROM assets a
			LEFT JOIN employees e ON e.empID = a.empID
			ORDER BY a.id DESC
		`);
		return rows as Asset[];
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<AssetDetail | null> => {
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

			const logs: AssetNote[] = logRows.map((row) => ({
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
			} as AssetDetail;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				data: updateFieldsSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;

			const entries = Object.entries(data).filter(
				([, value]) => value !== undefined,
			);

			if (entries.length === 0) {
				return { success: true, affectedRows: 0 };
			}

			const columns = entries.map(([column]) => column);
			const values = entries.map(([, value]) => value);
			const setClause = columns.map((column) => `${column} = ?`).join(", ");

			const [result] = await ctx.db.iss.execute<
				RowDataPacket & { affectedRows: number }
			>(`UPDATE assets SET ${setClause} WHERE id = ?`, [...values, id]);

			return { success: true, affectedRows: result.affectedRows };
		}),
});
