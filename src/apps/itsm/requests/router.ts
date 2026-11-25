import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";

import {
	PROBLEM_CATEGORIES,
	REQUEST_KINDS,
	REQUEST_PRIORITIES,
	REQUEST_STATUSES,
} from "@/lib/request-constants";
import { sendMail } from "@/lib/mail";
import { requesterProcedure, router as tRpcRouter } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

export type RequestItem = {
	id: number;
	user: number;
	userName: string | null;
	kind: string | null;
	payload: string | null;
	requesterEmplCode: string | null;
	pgtype: string | null;
	newpg: string | null;
	slctname: string | null;
	otherpg: string | null;
	modifi: string | null;
	descrip: string | null;
	imagefilePath: string | null;
	status: string | null;
	submitDate: string | null;
	requestPrio: string | null;
	replyCount: number;
};

export type RequestReplyItem = {
	id: number;
	requestID: number;
	reply: string;
	replyDate: string | null;
	userID: number;
	userName: string | null;
};

const priority = z.enum(REQUEST_PRIORITIES);
const description = z.string().trim().min(1, "Description is required").max(2000);

const createSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("problem"),
		requestPrio: priority,
		descrip: description,
		payload: z.object({
			category: z.enum(PROBLEM_CATEGORIES),
			affected: z.string().trim().min(1).max(200),
			impact: z.string().trim().min(1, "Impact is required").max(500),
			steps: z.string().trim().max(2000).default(""),
			expected: z.string().trim().max(1000).default(""),
		}),
	}),
	z.object({
		kind: z.literal("asset"),
		requestPrio: priority,
		descrip: description,
		payload: z.object({
			item: z.string().trim().min(1, "Item is required").max(200),
			quantity: z.number().int().positive().max(999),
			neededBy: z.string().trim().max(20).default(""),
			justification: z
				.string()
				.trim()
				.min(1, "Justification is required")
				.max(2000),
		}),
	}),
]);

const listSchema = z.object({
	status: z.enum(["all", ...REQUEST_STATUSES]).default("all"),
	kind: z.enum(["all", ...REQUEST_KINDS]).default("all"),
});

function toRequest(row: Row): RequestItem {
	return {
		id: Number(row.id),
		user: Number(row.user),
		userName: row.userName ? String(row.userName) : null,
		kind: row.kind ? String(row.kind) : null,
		payload: row.payload ? String(row.payload) : null,
		requesterEmplCode: row.requesterEmplCode
			? String(row.requesterEmplCode)
			: null,
		pgtype: row.pgtype ? String(row.pgtype) : null,
		newpg: row.newpg ? String(row.newpg) : null,
		slctname: row.slctname ? String(row.slctname) : null,
		otherpg: row.otherpg ? String(row.otherpg) : null,
		modifi: row.modifi ? String(row.modifi) : null,
		descrip: row.descrip ? String(row.descrip) : null,
		imagefilePath: row.imagefilePath ? String(row.imagefilePath) : null,
		status: row.status ? String(row.status) : null,
		submitDate: row.submitDate ? String(row.submitDate) : null,
		requestPrio: row.requestPrio ? String(row.requestPrio) : null,
		replyCount: Number(row.replyCount ?? 0),
	};
}

export const router = tRpcRouter({
	/** The MIS employee resolved from the signed-in user's email. */
	requester: requesterProcedure.query(({ ctx }) => ctx.requester),

	list: requesterProcedure
		.input(listSchema)
		.query(async ({ ctx, input }): Promise<RequestItem[]> => {
			const isAdmin = ctx.user.type === "admin";
			const conditions: string[] = [];
			const params: (string | number)[] = [];
			if (!isAdmin) {
				conditions.push("r.user = ?");
				params.push(ctx.user.id);
			}
			if (input.status !== "all") {
				conditions.push("r.status = ?");
				params.push(input.status);
			}
			if (input.kind !== "all") {
				conditions.push("r.kind = ?");
				params.push(input.kind);
			}
			const whereClause =
				conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT r.*, u.name AS userName,
				        (SELECT COUNT(*) FROM requestReplies rr WHERE rr.requestID = r.id) AS replyCount
				 FROM requests r
				 LEFT JOIN users u ON u.id = r.user
				${whereClause}
				 ORDER BY r.submitDate DESC`,
				params,
			);
			return rows.map(toRequest);
		}),

	replies: requesterProcedure
		.input(z.object({ requestID: z.coerce.number().int().positive() }))
		.query(async ({ ctx, input }): Promise<RequestReplyItem[]> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT rr.*, u.name AS userName
				 FROM requestReplies rr
				 LEFT JOIN users u ON u.id = rr.userID
				 WHERE rr.requestID = ?
				 ORDER BY rr.replyDate ASC`,
				[input.requestID],
			);
			return rows.map((row) => ({
				id: Number(row.id),
				requestID: Number(row.requestID),
				reply: String(row.reply ?? ""),
				replyDate: row.replyDate ? String(row.replyDate) : null,
				userID: Number(row.userID),
				userName: row.userName ? String(row.userName) : null,
			}));
		}),

	create: requesterProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO requests
				     (user, kind, payload, requesterEmplCode, descrip,
				      status, submitDate, requestPrio)
				 VALUES (?, ?, ?, ?, ?, 'pending', NOW(), ?)`,
				[
					ctx.user.id,
					input.kind,
					JSON.stringify(input.payload),
					ctx.requester.emplCode,
					input.descrip,
					input.requestPrio,
				],
			);
			const requestId = result.insertId;

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'add', 'requests', ?)`,
				[ctx.user.id, requestId],
			);

			return { success: true, id: requestId };
		}),

	updateStatus: requesterProcedure
		.input(
			z.object({
				id: z.coerce.number().int().positive(),
				status: z.enum(REQUEST_STATUSES),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`UPDATE requests SET status = ? WHERE id = ?`,
				[input.status, input.id],
			);

			if (result.affectedRows > 0) {
				await ctx.db.iss.execute(
					`INSERT INTO changes_logs (userID, date, action, node, nodeID)
					 VALUES (?, NOW(), 'update', 'requests', ?)`,
					[ctx.user.id, input.id],
				);
			}

			return { success: true, affectedRows: result.affectedRows };
		}),

	addReply: requesterProcedure
		.input(
			z.object({
				requestID: z.coerce.number().int().positive(),
				reply: z.string().trim().min(1, "Reply is required").max(2000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [result] = await ctx.db.iss.execute<ResultSetHeader>(
				`INSERT INTO requestReplies (requestID, reply, replyDate, userID)
				 VALUES (?, ?, NOW(), ?)`,
				[input.requestID, input.reply, ctx.user.id],
			);

			await ctx.db.iss.execute(
				`INSERT INTO changes_logs (userID, date, action, node, nodeID)
				 VALUES (?, NOW(), 'reply', 'requests', ?)`,
				[ctx.user.id, input.requestID],
			);

			const [ownerRows] = await ctx.db.iss.execute<Row[]>(
				`SELECT u.id, u.name, u.email
				 FROM requests r
				 LEFT JOIN users u ON u.id = r.user
				 WHERE r.id = ?
				 LIMIT 1`,
				[input.requestID],
			);
			const owner = ownerRows[0];
			if (owner?.email && Number(owner.id ?? 0) !== ctx.user.id) {
				await sendMail({
					to: [String(owner.email)],
					subject: `New reply on your request #${input.requestID}`,
					html: `
						<p>Dear ${String(owner.name ?? "user")},</p>
						<p>A new reply was received on your request:</p>
						<blockquote>${input.reply}</blockquote>
						<br>
						<p>Best Regards,<br><b>BFG IT Department</b></p>
					`,
				});
			}

			return { success: true, id: result.insertId };
		}),
});
