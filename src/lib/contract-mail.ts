import db from "@/lib/database";
import { DEFAULT_REMIND_DAYS } from "@/lib/contract-constants";
import { sendMail } from "@/lib/mail";

const TABLE = "contract_reminder_settings";

export type ContractReminderSettings = {
	enabled: boolean;
	remindDays: string;
};

type ReminderContract = {
	id: number;
	productName: string;
	vendorName: string | null;
	startDate: string;
	endDate: string;
	cost: string;
	currency: string;
};

async function ensureReminderSettingsTable(): Promise<void> {
	await db.iss.execute(`
		CREATE TABLE IF NOT EXISTS ${TABLE} (
			id INT PRIMARY KEY,
			enabled TINYINT(1) DEFAULT 0,
			remindDays VARCHAR(100)
		)
	`);
}

export async function getContractReminderSettings(): Promise<ContractReminderSettings> {
	await ensureReminderSettingsTable();
	const [rows] = await db.iss.execute<import("mysql2").RowDataPacket[]>(
		`SELECT enabled, remindDays FROM ${TABLE} WHERE id = 1 LIMIT 1`,
	);
	const row = rows[0];
	if (!row) {
		return { enabled: false, remindDays: DEFAULT_REMIND_DAYS };
	}
	return {
		enabled: Boolean(row.enabled),
		remindDays: String(row.remindDays ?? "") || DEFAULT_REMIND_DAYS,
	};
}

function sanitizeRemindDays(value: string): string {
	const offsets = value
		.split(/[,\s]+/)
		.map((part) => Number.parseInt(part, 10))
		.filter((n) => Number.isInteger(n) && n > 0 && n <= 3650);
	return [...new Set(offsets)].sort((a, b) => a - b).join(",");
}

export async function saveContractReminderSettings(
	input: ContractReminderSettings,
): Promise<void> {
	await ensureReminderSettingsTable();
	const remindDays = sanitizeRemindDays(input.remindDays);
	const [existing] = await db.iss.execute<import("mysql2").RowDataPacket[]>(
		`SELECT id FROM ${TABLE} WHERE id = 1 LIMIT 1`,
	);
	if (existing[0]) {
		await db.iss.execute(
			`UPDATE ${TABLE} SET enabled = ?, remindDays = ? WHERE id = 1`,
			[input.enabled ? 1 : 0, remindDays],
		);
	} else {
		await db.iss.execute(
			`INSERT INTO ${TABLE} (id, enabled, remindDays) VALUES (1, ?, ?)`,
			[input.enabled ? 1 : 0, remindDays],
		);
	}
}

export type ReminderScanResult = {
	ok: boolean;
	matched: number;
	sent: boolean;
	reason?: string;
	error?: string;
};

async function loadDueContracts(
	offsets: number[],
): Promise<ReminderContract[]> {
	const placeholders = offsets.map(() => "?").join(", ");
	type Row = import("mysql2").RowDataPacket & Record<string, unknown>;
	const [rows] = await db.iss.execute<Row[]>(
		`SELECT c.id, c.productName, v.name AS vendorName,
			DATE_FORMAT(c.startDate, '%Y-%m-%d') AS startDate,
			DATE_FORMAT(c.endDate, '%Y-%m-%d') AS endDate,
			c.cost, c.currency
		 FROM contracts c
		 LEFT JOIN vendors v ON v.id = c.vendorID
		 WHERE c.inActive = 0
		   AND DATEDIFF(c.endDate, CURDATE()) IN (${placeholders})
		 ORDER BY c.endDate ASC`,
		offsets,
	);
	return rows.map((row) => ({
		id: Number(row.id),
		productName: String(row.productName ?? ""),
		vendorName:
			row.vendorName === null || row.vendorName === undefined
				? null
				: String(row.vendorName),
		startDate: String(row.startDate ?? ""),
		endDate: String(row.endDate ?? ""),
		cost: String(row.cost ?? ""),
		currency: String(row.currency ?? ""),
	}));
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function buildReminderHtml(contracts: ReminderContract[]): string {
	const blocks = contracts.map((contract) => {
		const vendor = contract.vendorName || "Unknown vendor";
		return [
			`<p style="margin:0 0 4px;"><b>${escapeHtml(contract.productName)}</b></p>`,
			`<p style="margin:0;">Vendor: ${escapeHtml(vendor)}<br>`,
			`Contract Started: ${escapeHtml(contract.startDate)}<br>`,
			`Contract Ends: <b>${escapeHtml(contract.endDate)}</b><br>`,
			`Cost: ${escapeHtml(contract.currency)} ${escapeHtml(contract.cost)}</p>`,
		].join("\n");
	});
	return [
		"<p>The following service contracts are due for renewal:</p>",
		blocks.join(
			'<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">',
		),
		"<br><p>Best Regards,<br><b>BFG IT Department</b></p>",
	].join("\n");
}

export async function runContractReminderScan(
	options: { ignoreEnabled?: boolean } = {},
): Promise<ReminderScanResult> {
	try {
		const settings = await getContractReminderSettings();
		if (!settings.enabled && !options.ignoreEnabled) {
			return {
				ok: true,
				matched: 0,
				sent: false,
				reason: "Contract reminders are disabled",
			};
		}

		const offsets = settings.remindDays
			.split(/[,\s]+/)
			.map((part) => Number.parseInt(part, 10))
			.filter((n) => Number.isInteger(n) && n > 0 && n <= 3650);
		if (offsets.length === 0) {
			return {
				ok: true,
				matched: 0,
				sent: false,
				reason: "No reminder days configured",
			};
		}

		const dueContracts = await loadDueContracts(offsets);
		if (dueContracts.length === 0) {
			return {
				ok: true,
				matched: 0,
				sent: false,
				reason: "No contracts reaching a reminder date today",
			};
		}

		const result = await sendMail({
			subject: `Contract Renewal Reminder (${dueContracts.length})`,
			html: buildReminderHtml(dueContracts),
		});

		return {
			ok: true,
			matched: dueContracts.length,
			sent: result.sent,
			reason: result.reason,
		};
	} catch (error) {
		return {
			ok: false,
			matched: 0,
			sent: false,
			error: error instanceof Error ? error.message : "Reminder scan failed",
		};
	}
}
