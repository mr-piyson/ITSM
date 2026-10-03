import type { RowDataPacket } from "mysql2";

import {
	AC_DEFAULT_PAGE_SIZE,
	AC_MAX_PAGE_SIZE,
	AC_TABLES,
	USER_DEFAULT_ORDER,
	USER_FILTER_SQL,
	USER_SEARCH_SQL,
} from "./constants";
import { parseCsvInts } from "./csv";
import { getAcGroupsByIds } from "./groups";
import {
	acCount,
	acQuery,
	acQueryOne,
	asInt,
	asNumber,
	asString,
	clampPageSize,
	pageCount,
} from "./query";
import type {
	AcGroupSummary,
	AcUserListArgs,
	AcUserListInput,
	AcUserListResult,
	AcUserRecord,
} from "./types";
import { AcUserListInputSchema } from "./types";

type Row = RowDataPacket & Record<string, unknown>;

const USER_COLUMNS = `
	u.person_id AS personId,
	u.employee_id AS employeeId,
	u.name,
	u.access,
	u.is_admin AS isAdmin,
	u.emp_source AS empSource,
	u.device_ip AS deviceIp,
	u.access_group AS accessGroup,
	u.cards,
	u.begin_time AS beginTime,
	u.end_time AS endTime,
	u.model,
	u.verify_mode AS verifyMode,
	u.sync_source AS syncSource,
	u.sync_updated_at AS syncUpdatedAt,
	u.sync_datetime AS syncDatetime,
	u.created_at AS createdAt,
	u.created_by AS createdBy,
	u.updated_at AS updatedAt,
	u.updated_by AS updatedBy`;

function toUser(row: Row): AcUserRecord {
	return {
		personId: String(row.personId ?? ""),
		employeeId: asNumber(row.employeeId),
		name: asString(row.name),
		access: asInt(row.access),
		isAdmin: asInt(row.isAdmin),
		empSource: asString(row.empSource),
		deviceIp: asString(row.deviceIp),
		accessGroup: asString(row.accessGroup),
		cards: asString(row.cards),
		beginTime: asString(row.beginTime),
		endTime: asString(row.endTime),
		model: asString(row.model),
		verifyMode: asString(row.verifyMode),
		syncSource: asString(row.syncSource),
		syncUpdatedAt: asString(row.syncUpdatedAt),
		syncDatetime: asString(row.syncDatetime),
		createdAt: asString(row.createdAt),
		createdBy: asNumber(row.createdBy),
		updatedAt: asString(row.updatedAt),
		updatedBy: asNumber(row.updatedBy),
	};
}

function buildUserWhere(input: AcUserListInput) {
	const where: string[] = ["u.deleted_at IS NULL"];
	const values: unknown[] = [];

	if (input.q) {
		const fields =
			input.searchIn === "all"
				? Object.keys(USER_SEARCH_SQL)
				: [input.searchIn];
		const columns = fields
			.map((field) => USER_SEARCH_SQL[field])
			.filter((column): column is string => !!column);
		if (columns.length) {
			where.push(
				`(${columns.map((column) => `${column} LIKE ?`).join(" OR ")})`,
			);
			const like = `%${input.q}%`;
			values.push(...columns.map(() => like));
		}
	}

	for (const filter of new Set(input.filters)) {
		const fragment = USER_FILTER_SQL[filter];
		if (fragment) where.push(fragment);
	}

	return { whereSql: `WHERE ${where.join(" AND ")}`, values };
}

export async function listAcUsers(
	args: AcUserListArgs,
): Promise<AcUserListResult> {
	const input: AcUserListInput = AcUserListInputSchema.parse(args);
	const perPage = clampPageSize(
		input.perPage,
		AC_DEFAULT_PAGE_SIZE,
		AC_MAX_PAGE_SIZE,
	);
	const page = Math.max(1, Math.floor(input.page));
	const { whereSql, values } = buildUserWhere(input);

	const total = await acCount(
		`SELECT COUNT(*) AS total FROM ${AC_TABLES.users} u ${whereSql}`,
		values,
	);

	const rows = await acQuery<Row>(
		`SELECT${USER_COLUMNS}
		 FROM ${AC_TABLES.users} u
		 ${whereSql}
		 ORDER BY ${USER_DEFAULT_ORDER.join(", ")}
		 LIMIT ? OFFSET ?`,
		[...values, perPage, (page - 1) * perPage],
	);

	const records = rows.map(toUser);
	const groupIds = records.flatMap((user) => parseCsvInts(user.accessGroup));

	return {
		rows: records,
		total,
		page,
		perPage,
		pageCount: pageCount(total, perPage),
		groups: await getAcGroupsByIds(groupIds),
	};
}

export async function getAcUser(
	personId: string,
): Promise<AcUserRecord | null> {
	const row = await acQueryOne<Row>(
		`SELECT${USER_COLUMNS}
		 FROM ${AC_TABLES.users} u
		 WHERE u.person_id = ?
		 LIMIT 1`,
		[personId],
	);
	return row ? toUser(row) : null;
}

export async function getAcUsersByIds(
	personIds: readonly string[],
): Promise<AcUserRecord[]> {
	const unique = [
		...new Set(personIds.map((id) => id.trim()).filter((id) => id.length > 0)),
	];
	if (unique.length === 0) return [];
	const rows = await acQuery<Row>(
		`SELECT${USER_COLUMNS} FROM ${AC_TABLES.users} u WHERE u.person_id IN (?)`,
		[unique],
	);
	return rows.map(toUser);
}

/** Group membership for a single user, ignoring soft-deleted groups. */
export async function getGroupsForUser(
	personId: string,
): Promise<AcGroupSummary[]> {
	const user = await acQueryOne<Row>(
		`SELECT u.access_group AS accessGroup
		 FROM ${AC_TABLES.users} u
		 WHERE u.person_id = ?
		 LIMIT 1`,
		[personId],
	);
	if (!user) return [];
	return getAcGroupsByIds(parseCsvInts(asString(user.accessGroup)));
}

/** Count of live users per group id, for group list screens. */
export async function countUsersPerGroup(
	groupIds: readonly number[],
): Promise<Map<number, number>> {
	const ids = [...new Set(groupIds.filter((id) => Number.isInteger(id)))];
	const counts = new Map<number, number>();
	if (ids.length === 0) return counts;
	for (const groupId of ids) counts.set(groupId, 0);

	const rows = await acQuery<Row>(
		`SELECT u.access_group AS accessGroup
		 FROM ${AC_TABLES.users} u
		 WHERE u.deleted_at IS NULL
		   AND (${ids.map(() => "FIND_IN_SET(?, u.access_group)").join(" OR ")})`,
		ids,
	);

	for (const row of rows) {
		for (const groupId of parseCsvInts(asString(row.accessGroup))) {
			if (counts.has(groupId)) {
				counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
			}
		}
	}
	return counts;
}
