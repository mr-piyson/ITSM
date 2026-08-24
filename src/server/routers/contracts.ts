import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import { BILLING_CYCLES, CURRENCIES } from "@/lib/contract-constants";
import {
	getContractReminderSettings,
	runContractReminderScan,
	saveContractReminderSettings,
} from "@/lib/contract-mail";
import type { Context } from "@/server/context";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type Contract = {
	id: number;
	productName: string;
	vendorID: number;
	vendorName: string | null;
	startDate: string;
	endDate: string;
	notes: string;
	support: string;
	account: string;
	cost: string;
	currency: string;
	bilingCycle: string;
	docslink: string | null;
};

const contractSchema = z.object({
	productName: z.string().trim().min(1).max(100),
	vendorID: z.coerce.number().int().positive(),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	currency: z.enum(CURRENCIES),
	cost: z.string().trim().min(1).max(50),
	bilingCycle: z.enum(BILLING_CYCLES),
	account: z.string().trim().max(100).optional(),
	notes: z.string().trim().max(5000).optional(),
	support: z.string().trim().max(5000).optional(),
	docslink: z.string().trim().max(2000).optional(),
});

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	data: contractSchema,
});

async function assertVendorExists(
	ctx: Context,
	vendorID: number,
): Promise<void> {
	const [rows] = await ctx.db.iss.execute<Row[]>(
		`SELECT id FROM vendors WHERE id = ? AND inActive = 0 LIMIT 1`,
		[vendorID],
	);
	if (!rows[0]) {
		throw new Error("Selected vendor no longer exists");
	}
}

async function logChange(
	ctx: Context,
	userID: number,
	action: "add" | "update" | "delete",
	contractID: number,
) {
	await ctx.db.iss.execute(
		`INSERT INTO changes_logs (userID, date, action, node, nodeID)
		 VALUES (?, NOW(), ?, 'contract', ?)`,
		[userID, action, contractID],
	);
}

function toContract(row: Row): Contract {
	return {
		id: Number(row.id),
		productName: String(row.productName ?? ""),
		vendorID: Number(row.vendorID),
		vendorName:
			row.vendorName === null || row.vendorName === undefined
				? null
				: String(row.vendorName),
		startDate: String(row.startDate ?? ""),
		endDate: String(row.endDate ?? ""),
		notes: String(row.notes ?? ""),
		support: String(row.support ?? ""),
		account: String(row.account ?? ""),
		cost: String(row.cost ?? ""),
		currency: String(row.currency ?? ""),
		bilingCycle: String(row.bilingCycle ?? ""),
		docslink:
			row.docslink === null || row.docslink === undefined
				? null
				: String(row.docslink),
	};
}

const reminderSettingsSchema = z.object({
	enabled: z.boolean(),
	remindDays: z.string().trim().min(1).max(100),
});

const remindersRouter = router({
	get: protectedProcedure.query(async () => {
		return getContractReminderSettings();
	}),

	save: protectedProcedure
		.input(reminderSettingsSchema)
		.mutation(async ({ input }) => {
			await saveContractReminderSettings(input);
			return { success: true };
		}),

	run: protectedProcedure.mutation(async () => {
		return runContractReminderScan({ ignoreEnabled: true });
	}),
});

export const contractsRouter = router({
	list: protectedProcedure.query(async ({ ctx }): Promise<Contract[]> => {
		const [rows] = await ctx.db.iss.execute<Row[]>(
			`SELECT c.id, c.productName, c.vendorID, v.name AS vendorName,
				DATE_FORMAT(c.startDate, '%Y-%m-%d') AS startDate,
				DATE_FORMAT(c.endDate, '%Y-%m-%d') AS endDate,
				c.notes, c.support, c.account, c.cost, c.currency, c.bilingCycle, c.docslink
			 FROM contracts c
			 LEFT JOIN vendors v ON v.id = c.vendorID
			 WHERE c.inActive = 0
			 ORDER BY c.endDate ASC`,
		);
		return rows.map(toContract);
	}),

	create: protectedProcedure
		.input(contractSchema)
		.mutation(async ({ ctx, input }) => {
			await assertVendorExists(ctx, input.vendorID);

			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO contracts
				 (productName, vendorID, startDate, endDate, notes, support, account,
				  cost, currency, bilingCycle, inActive, docslink)
				 VALUES (?, ?, STR_TO_DATE(?, '%Y-%m-%d'), STR_TO_DATE(?, '%Y-%m-%d'),
				 ?, ?, ?, ?, ?, ?, 0, ?)`,
				[
					input.productName,
					input.vendorID,
					input.startDate,
					input.endDate,
					input.notes ?? "",
					input.support ?? "",
					input.account ?? "",
					input.cost,
					input.currency,
					input.bilingCycle,
					input.docslink ?? null,
				],
			);

			await logChange(ctx, ctx.user.id, "add", result.insertId);

			return { success: true, id: result.insertId };
		}),

	update: protectedProcedure
		.input(updateSchema)
		.mutation(async ({ ctx, input }) => {
			const [target] = await ctx.db.iss.execute<Row[]>(
				`SELECT id FROM contracts WHERE id = ? AND inActive = 0 LIMIT 1`,
				[input.id],
			);
			if (!target[0]) {
				throw new Error("Contract no longer exists");
			}
			await assertVendorExists(ctx, input.data.vendorID);

			await ctx.db.iss.execute(
				`UPDATE contracts SET
				 productName = ?, vendorID = ?,
				 startDate = STR_TO_DATE(?, '%Y-%m-%d'),
				 endDate = STR_TO_DATE(?, '%Y-%m-%d'),
				 notes = ?, support = ?, account = ?, cost = ?, currency = ?,
				 bilingCycle = ?, docslink = ?
				 WHERE id = ?`,
				[
					input.data.productName,
					input.data.vendorID,
					input.data.startDate,
					input.data.endDate,
					input.data.notes ?? "",
					input.data.support ?? "",
					input.data.account ?? "",
					input.data.cost,
					input.data.currency,
					input.data.bilingCycle,
					input.data.docslink ?? null,
					input.id,
				],
			);

			await logChange(ctx, ctx.user.id, "update", input.id);

			return { success: true };
		}),

	deactivate: protectedProcedure
		.input(z.object({ id: z.coerce.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE contracts SET inActive = 1 WHERE id = ?`,
				[input.id],
			);

			if (result.affectedRows > 0) {
				await logChange(ctx, ctx.user.id, "delete", input.id);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	reminders: remindersRouter,
});
