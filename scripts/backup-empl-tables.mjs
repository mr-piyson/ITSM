/**
 * Dumps the ISS tables touched by migrate-empl-code.mjs (rows + original DDL)
 * so the migration can be rolled back by restoring the file.
 *
 *   node scripts/backup-empl-tables.mjs [outfile]
 *
 * Restore: `node scripts/backup-empl-tables.mjs --restore <file>`
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TABLES = ["assets", "provide", "assetBooking", "assestOwnerUpdateLogs"];
const DEFAULT_OUT = resolve(
	root,
	"scripts",
	"backups",
	`iss-empl-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);

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

async function connect() {
	return mysql.createConnection({ uri: process.env.ISS_DATABASE });
}

/** Dates do not survive JSON round-tripping, so tag them explicitly. */
function serialize(value) {
	if (value instanceof Date) {
		return { __date: value.toISOString() };
	}
	return value;
}

function revive(value) {
	if (Array.isArray(value)) {
		return value.map(revive);
	}
	if (value && typeof value === "object" && typeof value.__date === "string") {
		return new Date(value.__date);
	}
	return value;
}

/**
 * MySQL DATE/DATETIME columns come back from `SHOW CREATE TABLE`; anything else
 * in the JSON that merely looks like a timestamp is left alone on purpose.
 */
function dateColumns(ddl) {
	const found = new Set();
	for (const line of ddl.split("\n")) {
		const match = /^\s*`([^`]+)`\s+(date|datetime|timestamp)/i.exec(line);
		if (match) found.add(match[1]);
	}
	return found;
}

async function backup(conn, outfile) {
	const payload = { createdAt: new Date().toISOString(), tables: {} };
	for (const table of TABLES) {
		const [[ddl]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
		const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
		payload.tables[table] = {
			ddl: ddl["Create Table"],
			columns: rows.length > 0 ? Object.keys(rows[0]) : [],
			rows: rows.map((row) => {
				const copy = {};
				for (const [key, value] of Object.entries(row)) {
					copy[key] = serialize(value);
				}
				return copy;
			}),
		};
		console.log(`${table}: ${rows.length} rows captured`);
	}
	mkdirSync(dirname(outfile), { recursive: true });
	writeFileSync(outfile, `${JSON.stringify(payload, null, 2)}\n`);
	console.log(`\nBackup written to ${outfile}`);
}

async function restore(conn, infile) {
	const payload = JSON.parse(readFileSync(infile, "utf8"));
	const entries = Object.entries(payload.tables);
	console.log(`Restoring from ${infile} (created ${payload.createdAt})`);
	for (const [table, { ddl }] of entries) {
		await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
		await conn.query(ddl);
		console.log(`${table}: schema restored`);
	}
	for (const [table, { ddl, columns, rows }] of entries) {
		if (rows.length === 0) {
			console.log(`${table}: no rows`);
			continue;
		}
		const cols = columns?.length > 0 ? columns : Object.keys(rows[0]);
		const quoted = cols.map((column) => `\`${column}\``).join(", ");
		const isDateColumn = dateColumns(ddl);
		const values = rows.map((row) =>
			cols.map((column) => {
				let value = revive(row[column]);
				if (typeof value === "string" && isDateColumn.has(column)) {
					const parsed = new Date(value);
					if (!Number.isNaN(parsed.getTime())) value = parsed;
				}
				return value;
			}),
		);
		await conn.query(`INSERT INTO \`${table}\` (${quoted}) VALUES ?`, [values]);
		console.log(`${table}: ${rows.length} rows restored`);
	}
	console.log("\nRestore complete.");
}

async function main() {
	loadEnv();
	const args = process.argv.slice(2);
	const restoring = args[0] === "--restore";
	const target = restoring ? args[1] : (args[0] ?? DEFAULT_OUT);
	if (restoring && !target) {
		throw new Error(
			"Usage: node scripts/backup-empl-tables.mjs --restore <file>",
		);
	}

	const conn = await connect();
	try {
		if (restoring) {
			await restore(conn, resolve(root, target));
		} else {
			await backup(conn, resolve(root, target));
		}
	} finally {
		await conn.end();
	}
}

main().catch((error) => {
	console.error(`\nFailed: ${error.message}`);
	process.exitCode = 1;
});
