import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import {
	mkdir,
	readFile,
	readdir,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

const DATA_ROOT = path.resolve(env.DATA_DIR || ".data");
const UPLOAD_ROOT = path.join(DATA_ROOT, "uploads");
const MANIFEST_PATH = path.join(DATA_ROOT, "migration-manifest.csv");

// Legacy roots for read-compatibility during migration.
const LEGACY_ROOT = path.resolve("public");
const LEGACY_ISS_ITEMS = path.resolve(
	process.cwd(),
	"..",
	"ISS",
	"itemsImages",
);
const LEGACY_ISS_PRINTERS = path.resolve(
	process.cwd(),
	"..",
	"ISS",
	"printersImages",
);

function datePath(now = new Date()) {
	const y = String(now.getFullYear());
	const m = String(now.getMonth() + 1).padStart(2, "0");
	// literal "/" for URL-safe stored paths
	return `${y}/${m}`;
}

function normalizeStoragePath(storagePath: string) {
	return storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

function parseCsvLine(line: string): string[] {
	const fields: string[] = [];
	let current = "";
	let quoted = false;
	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];
		if (char === '"') {
			if (quoted && line[i + 1] === '"') {
				current += '"';
				i += 1;
			} else {
				quoted = !quoted;
			}
		} else if (char === "," && !quoted) {
			fields.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	fields.push(current);
	return fields;
}

let manifestCache: { mtimeMs: number; map: Map<string, string> } | null = null;

/**
 * Legacy image files have been copied into `DATA_DIR/uploads` and the migration
 * wrote `DATA_DIR/migration-manifest.csv` keyed by the old basename. Resolve
 * those old names to their new storage paths so existing DB rows keep working.
 */
function manifestPathFor(storagePath: string): string | null {
	let mtimeMs: number;
	try {
		mtimeMs = statSync(MANIFEST_PATH).mtimeMs;
	} catch {
		return null;
	}

	if (!manifestCache || manifestCache.mtimeMs !== mtimeMs) {
		const map = new Map<string, string>();
		try {
			const lines = readFileSync(MANIFEST_PATH, "utf8").split(/\r?\n/);
			for (let i = 1; i < lines.length; i += 1) {
				if (!lines[i].trim()) continue;
				const [, oldBasename, newStoragePath] = parseCsvLine(lines[i]);
				if (oldBasename && newStoragePath) {
					map.set(oldBasename, newStoragePath);
				}
			}
		} catch {
			return null;
		}
		manifestCache = { mtimeMs, map };
	}

	const basename = path.basename(normalizeStoragePath(storagePath));
	if (!basename) return null;
	return manifestCache.map.get(basename) ?? null;
}

export function toAbsolute(storagePath: string): string {
	const normalized = normalizeStoragePath(storagePath);
	const resolved = path.resolve(DATA_ROOT, normalized);
	const rel = path.relative(DATA_ROOT, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
		throw new Error("Invalid storage path");
	}
	return resolved;
}

function legacyCandidates(storagePath: string): string[] {
	const normalized = normalizeStoragePath(storagePath);
	// strip leading "uploads/" for legacy lookups by basename
	const base = path.basename(normalized);
	const candidates = [
		path.resolve(LEGACY_ROOT, normalized),
		path.resolve(LEGACY_ISS_ITEMS, base),
		path.resolve(LEGACY_ISS_PRINTERS, base),
	];
	return candidates;
}

export async function write(
	buffer: Buffer,
	filename: string,
	now = new Date(),
): Promise<{ storagePath: string; absolutePath: string }> {
	const relDir = path.posix.join("uploads", datePath(now));
	const absDir = path.join(DATA_ROOT, relDir);
	await mkdir(absDir, { recursive: true });
	const storagePath = `/${path.posix.join(relDir, filename)}`;
	const absolutePath = path.join(absDir, filename);
	await writeFile(absolutePath, buffer);
	return { storagePath, absolutePath };
}

export async function readByStoragePath(
	storagePath: string,
): Promise<Buffer | null> {
	try {
		const abs = toAbsolute(storagePath);
		if (existsSync(abs)) return await readFile(abs);
	} catch {
		// fall through to migrated/legacy
	}
	const migrated = manifestPathFor(storagePath);
	if (migrated) {
		try {
			const abs = toAbsolute(migrated);
			if (existsSync(abs)) return await readFile(abs);
		} catch {
			// fall through to legacy
		}
	}
	for (const candidate of legacyCandidates(storagePath)) {
		try {
			const rel = path.relative(path.parse(candidate).root, candidate);
			if (rel.startsWith("..")) continue;
			if (existsSync(candidate)) return await readFile(candidate);
		} catch {
			// ignore
		}
	}
	return null;
}

export async function remove(storagePath: string): Promise<void> {
	try {
		const abs = toAbsolute(storagePath);
		if (existsSync(abs)) await rm(abs, { force: true });
		return;
	} catch {
		// ignore
	}
	for (const candidate of legacyCandidates(storagePath)) {
		try {
			if (existsSync(candidate)) await rm(candidate, { force: true });
		} catch {
			// ignore
		}
	}
}

export async function exists(storagePath: string): Promise<boolean> {
	try {
		const abs = toAbsolute(storagePath);
		if (existsSync(abs)) return true;
	} catch {
		// ignore
	}
	const migrated = manifestPathFor(storagePath);
	if (migrated) {
		try {
			if (existsSync(toAbsolute(migrated))) return true;
		} catch {
			// ignore
		}
	}
	return legacyCandidates(storagePath).some((c) => existsSync(c));
}

export async function listAllFiles(dir = UPLOAD_ROOT): Promise<string[]> {
	const results: string[] = [];
	async function walk(current: string) {
		if (!existsSync(current)) return;
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) await walk(full);
			else if (entry.isFile()) {
				const rel = path.relative(DATA_ROOT, full).split(path.sep).join("/");
				results.push(`/${rel}`);
			}
		}
	}
	await walk(dir);
	return results;
}

export function createReadStreamFor(storagePath: string) {
	try {
		const abs = toAbsolute(storagePath);
		if (existsSync(abs)) return createReadStream(abs);
	} catch {
		// ignore
	}
	const migrated = manifestPathFor(storagePath);
	if (migrated) {
		try {
			const abs = toAbsolute(migrated);
			if (existsSync(abs)) return createReadStream(abs);
		} catch {
			// ignore
		}
	}
	for (const candidate of legacyCandidates(storagePath)) {
		if (existsSync(candidate)) return createReadStream(candidate);
	}
	return null;
}

export async function fileStat(storagePath: string) {
	try {
		const abs = toAbsolute(storagePath);
		if (existsSync(abs)) return await stat(abs);
	} catch {
		// ignore
	}
	const migrated = manifestPathFor(storagePath);
	if (migrated) {
		try {
			const abs = toAbsolute(migrated);
			if (existsSync(abs)) return await stat(abs);
		} catch {
			// ignore
		}
	}
	for (const candidate of legacyCandidates(storagePath)) {
		if (existsSync(candidate)) return await stat(candidate);
	}
	return null;
}
