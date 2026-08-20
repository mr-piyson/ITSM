import nodemailer from "nodemailer";

import db from "@/lib/database";

export type MailConfig = {
	id: number;
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
	fromEmail: string;
	fromName: string;
	toEmails: string;
	ccEmails: string;
	enabled: boolean;
};

export type BookingEmailContext = {
	employeeName: string;
	assetLabel: string;
	startDate: string;
	endDate: string;
	purpose: string;
	otherInfo?: string | null;
};

const TABLE = "mail_settings";

async function ensureMailSettingsTable(): Promise<void> {
	await db.iss.execute(`
		CREATE TABLE IF NOT EXISTS ${TABLE} (
			id INT PRIMARY KEY,
			host VARCHAR(255),
			port INT,
			secure TINYINT(1) DEFAULT 0,
			username VARCHAR(255),
			password VARCHAR(255),
			fromEmail VARCHAR(255),
			fromName VARCHAR(255),
			toEmails TEXT,
			ccEmails TEXT,
			enabled TINYINT(1) DEFAULT 0
		)
	`);
}

export async function getMailConfig(): Promise<MailConfig | null> {
	await ensureMailSettingsTable();
	const [rows] = await db.iss.execute<import("mysql2").RowDataPacket[]>(
		`SELECT * FROM ${TABLE} WHERE id = 1 LIMIT 1`,
	);
	const row = rows[0];
	if (!row) {
		return null;
	}
	return {
		id: Number(row.id),
		host: String(row.host ?? ""),
		port: Number(row.port ?? 587),
		secure: Boolean(row.secure),
		username: String(row.username ?? ""),
		password: String(row.password ?? ""),
		fromEmail: String(row.fromEmail ?? ""),
		fromName: String(row.fromName ?? ""),
		toEmails: String(row.toEmails ?? ""),
		ccEmails: String(row.ccEmails ?? ""),
		enabled: Boolean(row.enabled),
	};
}

export function parseEmails(value: string): string[] {
	return value
		.split(/[,\n;]/)
		.map((email) => email.trim())
		.filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export type SendMailResult = {
	sent: boolean;
	reason?: string;
};

export async function sendMail({
	to,
	cc,
	subject,
	html,
}: {
	to?: string[];
	cc?: string[];
	subject: string;
	html: string;
}): Promise<SendMailResult> {
	const config = await getMailConfig();
	if (!config?.enabled) {
		return {
			sent: false,
			reason: "Mail settings are disabled or not configured",
		};
	}
	return sendMailWithConfig(config, { to, cc, subject, html });
}

export async function sendMailWithConfig(
	config: MailConfig,
	{
		to,
		cc,
		subject,
		html,
	}: {
		to?: string[];
		cc?: string[];
		subject: string;
		html: string;
	},
): Promise<SendMailResult> {
	const recipients = to && to.length > 0 ? to : parseEmails(config.toEmails);
	const ccRecipients = parseEmails(config.ccEmails).concat(cc ?? []);
	if (recipients.length === 0 && ccRecipients.length === 0) {
		return { sent: false, reason: "No recipients configured" };
	}
	if (!config.host) {
		return { sent: false, reason: "SMTP host is not configured" };
	}

	const transporter = nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth:
			config.username && config.password
				? { user: config.username, pass: config.password }
				: undefined,
	});

	await transporter.sendMail({
		from: {
			name: config.fromName || "IT Service Management System",
			address: config.fromEmail || config.username || "no-reply@localhost",
		},
		to: recipients,
		cc: ccRecipients.length > 0 ? ccRecipients : undefined,
		subject,
		html,
	});

	return { sent: true };
}

function assetLine(context: BookingEmailContext): string {
	return context.assetLabel || "an IT asset";
}

export function bookingCreatedMail(context: BookingEmailContext): {
	subject: string;
	html: string;
} {
	const subject = `An IT asset has been booked for ${context.employeeName} - ${context.startDate}`;
	const html = `
		<p>Dear IT,</p>
		<p>The following asset <b>${assetLine(context)}</b> has been booked for
		<b>${context.employeeName}</b> from <b>${context.startDate}</b> until
		<b>${context.endDate}</b>.</p>
		<p><b>Purpose:</b> ${context.purpose}</p>
		${context.otherInfo ? `<p><b>Other Information:</b> ${context.otherInfo}</p>` : ""}
		<p>Please be sure to return it promptly.</p>
		<br>
		<p>Best Regards,<br><b>BFG IT Department</b></p>
	`;
	return { subject, html };
}

export function bookingExtendedMail(context: BookingEmailContext): {
	subject: string;
	html: string;
} {
	const subject = `Booking extended for ${context.employeeName} until ${context.endDate}`;
	const html = `
		<p>Dear IT,</p>
		<p>The booking for <b>${assetLine(context)}</b>
		(<b>${context.employeeName}</b>) has been extended until
		<b>${context.endDate}</b>.</p>
		<p><b>Purpose:</b> ${context.purpose}</p>
		${context.otherInfo ? `<p><b>Other Information:</b> ${context.otherInfo}</p>` : ""}
		<br>
		<p>Best Regards,<br><b>BFG IT Department</b></p>
	`;
	return { subject, html };
}

export function bookingReturnedMail(context: BookingEmailContext): {
	subject: string;
	html: string;
} {
	const subject = `Asset returned: ${context.employeeName}`;
	const html = `
		<p>Dear IT,</p>
		<p>The asset <b>${assetLine(context)}</b> booked for
		<b>${context.employeeName}</b> has been received and returned to stock.</p>
		<br>
		<p>Best Regards,<br><b>BFG IT Department</b></p>
	`;
	return { subject, html };
}

export function bookingTestMail(): { subject: string; html: string } {
	return {
		subject: "ITSM - SMTP test email",
		html: `
			<p>This is a test email from the IT Service Management System.</p>
			<p>Your SMTP configuration is working correctly.</p>
			<br>
			<p>Best Regards,<br><b>BFG IT Department</b></p>
		`,
	};
}
