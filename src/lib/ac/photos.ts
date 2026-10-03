import { createHash } from "node:crypto";

import type { RowDataPacket } from "mysql2";

import { AC_TABLES } from "./constants";
import { acQueryOne, asInt, asNumber, asString } from "./query";
import type { AcPhotoAsset } from "./types";

type Row = RowDataPacket & Record<string, unknown>;

/** `mes.resources.model` values used by this module. */
const AC_MODEL = "access_control";
const EMPLOYEE_MODEL = "employee";

/** Web-relative directory that serves the legacy `storage/` tree. */
const STORAGE_ROOT = "storage";

function md5(value: string): string {
	return createHash("md5").update(value).digest("hex");
}

/** `{model}/{md5(uid)}/{filename}.{ext}` (inc/config.php:192). */
export function acPhotoPath(
	model: string,
	uid: string,
	filename: string,
	ext: string,
	variant: "full" | "medium" = "full",
): string {
	const suffix = variant === "medium" ? `_m.${ext}` : `.${ext}`;
	return `${STORAGE_ROOT}/${model}/${md5(uid)}/${filename}${suffix}`;
}

function toAsset(row: Row): AcPhotoAsset {
	const model = String(row.model ?? AC_MODEL);
	const uid = String(row.uid ?? "");
	const filename = String(row.filename ?? "");
	const ext = String(row.ext ?? "jpg");
	return {
		id: asInt(row.id),
		model,
		uid,
		filename,
		ext,
		mime: asString(row.mime),
		size: asNumber(row.size),
		file: acPhotoPath(model, uid, filename, ext),
		thumbnail: acPhotoPath(model, uid, filename, ext, "medium"),
	};
}

/**
 * Resolves the face photo for an access control user. HR-linked rows keep the
 * photo under `model = 'employee'` keyed by `mes.employees.id`; manual users
 * use `model = 'access_control'` keyed by `person_id`
 * (inc/class.hikvision.php:1235-1260).
 */
export async function findAcUserPhoto(
	personId: string,
): Promise<AcPhotoAsset | null> {
	const user = await acQueryOne<Row>(
		`SELECT u.employee_id AS employeeId
		 FROM ${AC_TABLES.users} u
		 WHERE u.person_id = ?
		 LIMIT 1`,
		[personId],
	);
	if (!user) return null;

	const employeeId = asNumber(user.employeeId);
	const model = employeeId === null ? AC_MODEL : EMPLOYEE_MODEL;
	const uid = employeeId === null ? personId : String(employeeId);

	const row = await acQueryOne<Row>(
		`SELECT r.id, r.model, r.uid, r.filename, r.ext, r.mime, r.size
		 FROM ${AC_TABLES.resources} r
		 WHERE r.model = ? AND r.type = 'image' AND r.uid = ?
		 ORDER BY r.id DESC
		 LIMIT 1`,
		[model, uid],
	);

	return row ? toAsset(row) : null;
}
