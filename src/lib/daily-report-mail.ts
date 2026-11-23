import type { RowDataPacket } from "mysql2";

import { todayDateString } from "@/lib/cron";
import db from "@/lib/database";
import { parseEmails, sendMail } from "@/lib/mail";

const TABLE = "daily_report_settings";

export type DailyReportSettings = {
	enabled: boolean;
	recipientUserIds: string;
	extraEmails: string;
};

export type DailyReportRunResult = {
	ok: boolean;
	sent: boolean;
	recipients: number;
	reason?: string;
	error?: string;
};

async function ensureDailyReportSettingsTable(): Promise<void> {
	await db.iss.execute(`
		CREATE TABLE IF NOT EXISTS ${TABLE} (
			id INT PRIMARY KEY,
			enabled TINYINT(1) NOT NULL DEFAULT 0,
			recipientUserIds TEXT,
			extraEmails TEXT
		)
	`);
}

export function parseUserIds(value: string): number[] {
	const ids = value
		.split(",")
		.map((part) => part.trim())
		.filter((part) => /^\d+$/.test(part))
		.map(Number)
		.filter((id) => id > 0);
	return [...new Set(ids)];
}

export function normalizeEmails(value: string): string[] {
	return [
		...new Map(
			parseEmails(value).map((email) => [email.toLowerCase(), email]),
		).values(),
	];
}

export async function getDailyReportSettings(): Promise<DailyReportSettings> {
	await ensureDailyReportSettingsTable();
	const [rows] = await db.iss.execute<RowDataPacket[]>(
		`SELECT enabled, recipientUserIds, extraEmails FROM ${TABLE} WHERE id = 1 LIMIT 1`,
	);
	const row = rows[0];
	if (!row) {
		return { enabled: false, recipientUserIds: "", extraEmails: "" };
	}
	return {
		enabled: Boolean(row.enabled),
		recipientUserIds: String(row.recipientUserIds ?? ""),
		extraEmails: String(row.extraEmails ?? ""),
	};
}

export async function saveDailyReportSettings(
	input: DailyReportSettings,
): Promise<void> {
	await ensureDailyReportSettingsTable();
	const recipientUserIds = parseUserIds(input.recipientUserIds).join(",");
	const extraEmails = normalizeEmails(input.extraEmails).join(",");
	const [existing] = await db.iss.execute<RowDataPacket[]>(
		`SELECT id FROM ${TABLE} WHERE id = 1 LIMIT 1`,
	);
	if (existing[0]) {
		await db.iss.execute(
			`UPDATE ${TABLE} SET enabled = ?, recipientUserIds = ?, extraEmails = ? WHERE id = 1`,
			[input.enabled ? 1 : 0, recipientUserIds, extraEmails],
		);
	} else {
		await db.iss.execute(
			`INSERT INTO ${TABLE} (id, enabled, recipientUserIds, extraEmails)
			 VALUES (1, ?, ?, ?)`,
			[input.enabled ? 1 : 0, recipientUserIds, extraEmails],
		);
	}
}

async function resolveRecipientEmails(
	settings: DailyReportSettings,
): Promise<string[]> {
	const ids = parseUserIds(settings.recipientUserIds);
	const selectedEmails: string[] = [];
	if (ids.length > 0) {
		const placeholders = ids.map(() => "?").join(",");
		const [rows] = await db.iss.execute<RowDataPacket[]>(
			`SELECT email FROM users WHERE id IN (${placeholders})`,
			ids,
		);
		for (const row of rows) {
			selectedEmails.push(String(row.email ?? "").trim());
		}
	}
	return normalizeEmails(
		[...selectedEmails, ...normalizeEmails(settings.extraEmails)].join(","),
	);
}

// shortcut: placeholder body until the daily report content is defined.
export function buildDailyReportMail(): { subject: string; html: string } {
	return {
		subject: `ITSM Daily Report - ${todayDateString()}`,
		html: `
			<p>This is the daily ITSM report.</p>
			<p>The report content will be added soon.</p>
			<br>
			<p>Best Regards,<br><b>BFG IT Department</b></p>
		`,
	};
}

export async function runDailyReport(
	options: { ignoreEnabled?: boolean } = {},
): Promise<DailyReportRunResult> {
	try {
		const settings = await getDailyReportSettings();
		if (!settings.enabled && !options.ignoreEnabled) {
			return {
				ok: true,
				sent: false,
				recipients: 0,
				reason: "Daily reports are disabled",
			};
		}

		const recipients = await resolveRecipientEmails(settings);
		if (recipients.length === 0) {
			return {
				ok: true,
				sent: false,
				recipients: 0,
				reason: "No daily report recipients configured",
			};
		}

		const { subject, html } = buildDailyReportMail();
		const result = await sendMail({ to: recipients, subject, html });
		return {
			ok: true,
			sent: result.sent,
			recipients: recipients.length,
			reason: result.reason,
		};
	} catch (error) {
		return {
			ok: false,
			sent: false,
			recipients: 0,
			error: error instanceof Error ? error.message : "Daily report failed",
		};
	}
}
