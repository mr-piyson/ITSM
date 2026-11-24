import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import { bookingTestMail, sendMailWithConfig } from "@/lib/mail";
import { protectedProcedure, router } from "@/server/trpc";

type Row = RowDataPacket & Record<string, unknown>;

const mailSettingsSchema = z.object({
	host: z.string().trim().max(255),
	port: z.coerce.number().int().min(1).max(65535),
	secure: z.boolean(),
	username: z.string().trim().max(255),
	password: z.string().max(255).optional(),
	fromEmail: z.string().trim().max(255),
	fromName: z.string().trim().max(255),
	toEmails: z.string().trim().max(2000),
	ccEmails: z.string().trim().max(2000).optional(),
	enabled: z.boolean(),
});

export type MailSettingsValues = z.infer<typeof mailSettingsSchema>;

export type MailSettingsView = {
	host: string;
	port: number;
	secure: boolean;
	username: string;
	hasPassword: boolean;
	fromEmail: string;
	fromName: string;
	toEmails: string;
	ccEmails: string;
	enabled: boolean;
};

export const mailSettingsRouter = router({
	get: protectedProcedure.query(
		async ({ ctx }): Promise<MailSettingsView | null> => {
			const [rows] = await ctx.db.iss.execute<Row[]>(
				`SELECT * FROM mail_settings WHERE id = 1 LIMIT 1`,
			);
			const row = rows[0];
			if (!row) {
				return null;
			}
			return {
				host: String(row.host ?? ""),
				port: Number(row.port ?? 587),
				secure: Boolean(row.secure),
				username: String(row.username ?? ""),
				hasPassword: Boolean(row.password),
				fromEmail: String(row.fromEmail ?? ""),
				fromName: String(row.fromName ?? ""),
				toEmails: String(row.toEmails ?? ""),
				ccEmails: String(row.ccEmails ?? ""),
				enabled: Boolean(row.enabled),
			};
		},
	),

	save: protectedProcedure
		.input(mailSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db.iss.execute<Row[]>(
				`SELECT password FROM mail_settings WHERE id = 1 LIMIT 1`,
			);
			const storedPassword = existing[0]
				? String(existing[0].password ?? "")
				: "";
			const password = input.password?.trim() ? input.password : storedPassword;

			if (existing.length > 0) {
				await ctx.db.iss.execute(
					`UPDATE mail_settings SET
					 host = ?, port = ?, secure = ?, username = ?, password = ?,
					 fromEmail = ?, fromName = ?, toEmails = ?, ccEmails = ?, enabled = ?
					 WHERE id = 1`,
					[
						input.host,
						input.port,
						input.secure ? 1 : 0,
						input.username,
						password,
						input.fromEmail,
						input.fromName,
						input.toEmails,
						input.ccEmails ?? "",
						input.enabled ? 1 : 0,
					],
				);
			} else {
				await ctx.db.iss.execute(
					`INSERT INTO mail_settings
					 (id, host, port, secure, username, password, fromEmail, fromName,
					  toEmails, ccEmails, enabled)
					 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						input.host,
						input.port,
						input.secure ? 1 : 0,
						input.username,
						password,
						input.fromEmail,
						input.fromName,
						input.toEmails,
						input.ccEmails ?? "",
						input.enabled ? 1 : 0,
					],
				);
			}

			return { success: true };
		}),

	test: protectedProcedure
		.input(mailSettingsSchema)
		.mutation(async ({ input }) => {
			const config = {
				id: 1,
				host: input.host,
				port: input.port,
				secure: input.secure,
				username: input.username,
				password: input.password ?? "",
				fromEmail: input.fromEmail,
				fromName: input.fromName,
				toEmails: input.toEmails,
				ccEmails: input.ccEmails ?? "",
				enabled: true,
			};

			const { subject, html } = bookingTestMail();
			const result = await sendMailWithConfig(config, { subject, html });
			if (!result.sent) {
				throw new Error(result.reason ?? "Could not send test email");
			}
			return { success: true };
		}),
});
