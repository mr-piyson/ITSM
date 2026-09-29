/**
 * Migrates the ISS employee keys used by assets / provide / assetBooking from
 * the numeric ISS `employees.empID` to the Oracle `T633_EMPL_MASTER.EMPL_CODE`
 * string (zero padded, e.g. 3 -> "0003").
 *
 *   node scripts/migrate-empl-code.mjs --dry-run   # report only, no changes
 *   node scripts/migrate-empl-code.mjs             # apply the migration
 *
 * Run against a backup first. The migration is not reversible on its own:
 * restore the database backup and redeploy the previous build to roll back.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";
import oracledb from "oracledb";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnv() {
	const raw = readFileSync(resolve(root, ".env"), "utf8");
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (!(key in process.env)) process.env[key] = value;
	}
}

function padCode(value) {
	if (value === null || value === undefined) return null;
	const text = String(value).trim();
	if (!text || text === "0") return null;
	return text.padStart(4, "0");
}

async function columnNames(conn, table) {
	const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
	return rows.map((row) => row.Field);
}

async function fetchOracleCodes() {
	const pool = await oracledb.createPool({
		user: process.env.ORACLE_USER,
		password: process.env.ORACLE_PASSWORD,
		connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`,
		poolMin: 1,
		poolMax: 2,
	});
	const conn = await pool.getConnection();
	try {
		const result = await conn.execute("SELECT EMPL_CODE FROM T633_EMPL_MASTER");
		return new Set((result.rows ?? []).map((row) => String(row[0] ?? "")));
	} finally {
		await conn.close();
		await pool.close();
	}
}

const TABLES = [
	{
		name: "assets",
		oldColumns: ["empID"],
		newColumns: ["emplCode"],
		add: ["ALTER TABLE assets ADD COLUMN emplCode VARCHAR(20) NULL"],
		backfill: [
			`UPDATE assets SET emplCode = NULLIF(LPAD(empID, 4, '0'), '0000')
			 WHERE empID IS NOT NULL`,
		],
		drop: ["ALTER TABLE assets DROP COLUMN empID"],
		sample: `SELECT empID, emplCode FROM assets ORDER BY id DESC LIMIT 5`,
	},
	{
		name: "provide",
		oldColumns: ["empID", "requestBy", "recievedBy"],
		newColumns: ["emplCode", "requestByEmplCode", "recievedByEmplCode"],
		add: [
			`ALTER TABLE provide
			   ADD COLUMN emplCode VARCHAR(20) NOT NULL DEFAULT '',
			   ADD COLUMN requestByEmplCode VARCHAR(20) NOT NULL DEFAULT '',
			   ADD COLUMN recievedByEmplCode VARCHAR(20) NOT NULL DEFAULT ''`,
		],
		backfill: [
			`UPDATE provide SET
			   emplCode = IF(empID IS NULL OR empID = 0, '', LPAD(empID, 4, '0')),
			   requestByEmplCode = IF(requestBy IS NULL OR requestBy = 0, '', LPAD(requestBy, 4, '0')),
			   recievedByEmplCode = IF(recievedBy IS NULL OR recievedBy = 0, '', LPAD(recievedBy, 4, '0'))`,
		],
		drop: [
			"ALTER TABLE provide DROP COLUMN empID",
			"ALTER TABLE provide DROP COLUMN requestBy",
			"ALTER TABLE provide DROP COLUMN recievedBy",
		],
		sample: `SELECT id, emplCode, requestByEmplCode, recievedByEmplCode FROM provide ORDER BY id DESC LIMIT 5`,
	},
	{
		name: "assetBooking",
		oldColumns: ["empID"],
		newColumns: ["emplCode"],
		add: [
			"ALTER TABLE assetBooking ADD COLUMN emplCode VARCHAR(20) NOT NULL DEFAULT ''",
		],
		backfill: [
			`UPDATE assetBooking SET emplCode = IF(empID IS NULL OR empID = 0, '', LPAD(empID, 4, '0'))`,
		],
		drop: ["ALTER TABLE assetBooking DROP COLUMN empID"],
		sample: `SELECT id, emplCode FROM assetBooking ORDER BY id DESC LIMIT 5`,
	},
	{
		name: "assestOwnerUpdateLogs",
		oldColumns: ["oldOwnerEmpID", "newOwnerID"],
		newColumns: ["oldOwnerEmplCode", "newOwnerEmplCode"],
		add: [
			`ALTER TABLE assestOwnerUpdateLogs
			   ADD COLUMN oldOwnerEmplCode VARCHAR(20) NULL,
			   ADD COLUMN newOwnerEmplCode VARCHAR(20) NULL`,
		],
		backfill: [
			`UPDATE assestOwnerUpdateLogs SET
			   oldOwnerEmplCode = NULLIF(LPAD(oldOwnerEmpID, 4, '0'), '0000'),
			   newOwnerEmplCode = NULLIF(LPAD(newOwnerID, 4, '0'), '0000')`,
		],
		drop: [
			"ALTER TABLE assestOwnerUpdateLogs DROP COLUMN oldOwnerEmpID",
			"ALTER TABLE assestOwnerUpdateLogs DROP COLUMN newOwnerID",
		],
		sample: `SELECT id, oldOwnerEmplCode, newOwnerEmplCode FROM assestOwnerUpdateLogs ORDER BY id DESC LIMIT 5`,
	},
];

const SELECT_COLUMNS = {
	assets: ["empID"],
	provide: ["empID", "requestBy", "recievedBy"],
	assetBooking: ["empID"],
	assestOwnerUpdateLogs: ["oldOwnerEmpID", "newOwnerID"],
};

const REPORT_COLUMNS = {
	assets: ["empID"],
	provide: ["empID", "requestBy", "recievedBy"],
	assetBooking: ["empID"],
	assestOwnerUpdateLogs: ["oldOwnerEmpID", "newOwnerID"],
};

async function report(conn, oracleCodes) {
	console.log("\n--- Dry run: values that will be written ---");
	const unmatched = new Map();
	let total = 0;
	let matched = 0;

	for (const [table, columns] of Object.entries(SELECT_COLUMNS)) {
		const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
		console.log(`\n${table}: ${rows.length} rows`);
		for (const column of columns) {
			const values = rows.map((row) => padCode(row[column]));
			const present = values.filter((value) => value !== null);
			const hits = present.filter((value) => oracleCodes.has(value));
			const misses = present.filter((value) => !oracleCodes.has(value));
			total += present.length;
			matched += hits.length;
			for (const miss of misses) {
				unmatched.set(miss, (unmatched.get(miss) ?? 0) + 1);
			}
			console.log(
				`  ${column}: ${present.length} values, ${hits.length} found in Oracle, ${misses.length} not found`,
			);
		}
	}

	console.log(
		`\nTotal values: ${total}, matched: ${matched}, unmatched: ${total - matched}`,
	);
	if (unmatched.size > 0) {
		const sorted = [...unmatched.entries()].sort((a, b) => b[1] - a[1]);
		console.log(
			`Codes with no Oracle record (will render as blank): ${sorted.length}`,
		);
		for (const [code, count] of sorted.slice(0, 60)) {
			console.log(`  ${code}  (used ${count}x)`);
		}
		if (sorted.length > 60) console.log(`  ... and ${sorted.length - 60} more`);
	}
}

async function main() {
	loadEnv();
	process.env.ORACLE_HOME = process.env.ORACLE_CLIENT_DIR;
	oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });

	const conn = await mysql.createConnection({
		uri: process.env.ISS_DATABASE,
		namedPlaceholders: false,
	});

	try {
		console.log("Reading Oracle employee codes…");
		const oracleCodes = await fetchOracleCodes();
		console.log(`Oracle T633_EMPL_MASTER: ${oracleCodes.size} codes`);

		const plan = [];
		for (const table of TABLES) {
			const cols = await columnNames(conn, table.name);
			const missingOld = table.oldColumns.filter((c) => !cols.includes(c));
			const hasNew = cols.includes("emplCode");
			if (missingOld.length > 0 && hasNew) {
				plan.push({ table, state: "done" });
				console.log(`${table.name}: already migrated, skipping`);
				continue;
			}
			if (missingOld.length > 0) {
				throw new Error(
					`${table.name}: expected columns ${missingOld.join(", ")} not found — unexpected schema`,
				);
			}
			if (hasNew) {
				throw new Error(
					`${table.name}: emplCode already exists but old columns are still present — clean up manually`,
				);
			}
			plan.push({ table, state: "pending" });
		}

		await report(conn, oracleCodes);

		if (dryRun) {
			console.log("\nDry run only — no changes were made.");
			return;
		}

		const pending = plan.filter((entry) => entry.state === "pending");
		if (pending.length === 0) {
			console.log("\nNothing to migrate.");
			return;
		}

		console.log("\n--- Applying migration ---");
		for (const { table } of pending) {
			console.log(`\n${table.name}`);
			for (const statement of [...table.add, ...table.backfill]) {
				await conn.query(statement);
			}
			const [sample] = await conn.query(table.sample);
			console.log("  sample:", JSON.stringify(sample));
			for (const statement of table.drop) {
				await conn.query(statement);
			}
			console.log("  old columns dropped");
		}

		console.log("\n--- Verifying ---");
		const residual = [];
		for (const [table, columns] of Object.entries(REPORT_COLUMNS)) {
			const cols = await columnNames(conn, table);
			const survivors = columns.filter((c) => cols.includes(c));
			if (survivors.length > 0)
				residual.push(`${table}: ${survivors.join(", ")}`);
		}
		if (residual.length > 0) {
			throw new Error(`Old columns still present:\n  ${residual.join("\n  ")}`);
		}
		for (const { table } of plan) {
			const cols = await columnNames(conn, table.name);
			const missing = table.newColumns.filter((c) => !cols.includes(c));
			if (missing.length > 0) {
				throw new Error(
					`${table.name}: expected column(s) ${missing.join(", ")} missing after migration`,
				);
			}
		}
		console.log("Schema verified. Migration complete.");
	} finally {
		await conn.end();
	}
}

main().catch((error) => {
	console.error(`\nMigration failed: ${error.message}`);
	process.exitCode = 1;
});
