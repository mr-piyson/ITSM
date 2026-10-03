import type { RowDataPacket } from "mysql2";

import { AC_TABLES } from "./constants";
import { acQuery } from "./query";

/**
 * Access to the module is gated on the signed-in app user. The legacy PHP app
 * granted it to anyone holding a role literally named `access_control`
 * (inc/functions.php:3374); this app's session lives in `ISS.users`, so parity
 * requires resolving that account to a `mes.users` row and checking its roles.
 */

export const AC_ROLE_NAME = "access_control";

/** `mes.users.role_id = 1` is the MES superuser role. */
const MES_ADMIN_ROLE_ID = 1;

export type AcSessionUser = {
	id: number;
	type: string;
	email: string;
};

type Row = RowDataPacket & Record<string, unknown>;

/**
 * Single lookup of the MES account behind a session email, together with every
 * extra role granted through `mes.user_roles`.
 */
export async function hasMesAccessControlGrant(
	email: string,
): Promise<boolean> {
	if (!email) return false;

	const rows = await acQuery<Row>(
		`SELECT u.id AS mesUserId, u.role_id AS roleId, r.name AS roleName
		 FROM ${AC_TABLES.mesUsers} u
		 LEFT JOIN ${AC_TABLES.userRoles} ur ON ur.user_id = u.id
		 LEFT JOIN mes.roles r ON r.id = ur.role_id
		 WHERE u.email = ? AND u.deleted_at IS NULL`,
		[email],
	);
	if (rows.length === 0) return false;

	return rows.some((row) => {
		if (Number(row.roleId ?? 0) === MES_ADMIN_ROLE_ID) return true;
		return String(row.roleName ?? "") === AC_ROLE_NAME;
	});
}

export async function canAccessControl(
	user: AcSessionUser | null | undefined,
): Promise<boolean> {
	if (!user) return false;
	if (user.type === "admin") return true;
	return hasMesAccessControlGrant(user.email);
}
