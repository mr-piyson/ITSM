import type { RowDataPacket } from "mysql2";

import {
	AC_DEFAULT_DEVICE_PORT,
	AC_PERIPHERAL_TYPE,
	AC_TABLES,
} from "./constants";
import { acQuery, acQueryOne, asInt, asNumber, asString } from "./query";
import type {
	AcDeviceCredentials,
	AcDevicePublic,
	AcDeviceRecord,
} from "./types";

type Row = RowDataPacket & Record<string, unknown>;

/**
 * `CONCAT(ip, ':', port)` returns NULL when `port` is NULL, which would poison
 * the device address. COALESCE keeps every device address usable.
 */
const DEVICE_COLUMNS = `
	p.id,
	CONCAT(p.ip, ':', COALESCE(p.port, ${AC_DEFAULT_DEVICE_PORT})) AS deviceIp,
	p.ip,
	p.port,
	p.ac_direction AS acDirection,
	p.description,
	p.location_id AS locationId,
	l.abbreviation AS locationAbbreviation,
	l.name AS locationName,
	p.active,
	p.failed_connect AS failedConnect,
	p.attrs`;

const DEVICE_FROM = `
	FROM ${AC_TABLES.peripherals} p
	LEFT JOIN ${AC_TABLES.locations} l ON l.id = p.location_id`;

function toDevice(row: Row): AcDeviceRecord {
	return {
		id: asInt(row.id),
		deviceIp: String(row.deviceIp ?? ""),
		ip: String(row.ip ?? ""),
		port: asNumber(row.port),
		acDirection:
			row.acDirection === "In" || row.acDirection === "Out"
				? row.acDirection
				: null,
		description: asString(row.description),
		locationId: asNumber(row.locationId),
		locationAbbreviation: asString(row.locationAbbreviation),
		locationName: asString(row.locationName),
		active: asInt(row.active),
		failedConnect: asInt(row.failedConnect),
		attrs: asString(row.attrs),
	};
}

/** Strips `attrs`, which holds the device credentials. */
export function toPublicDevice(device: AcDeviceRecord): AcDevicePublic {
	const { attrs: _attrs, ...rest } = device;
	return rest;
}

export async function listAccessControlDevices(
	activeOnly = true,
): Promise<AcDeviceRecord[]> {
	const rows = await acQuery<Row>(
		`SELECT${DEVICE_COLUMNS}
		 ${DEVICE_FROM}
		 WHERE p.type = ? AND p.deleted_at IS NULL${activeOnly ? " AND p.active = 1" : ""}
		 ORDER BY p.id ASC`,
		[AC_PERIPHERAL_TYPE],
	);
	return rows.map(toDevice);
}

/**
 * Looks up any peripheral by id, mirroring `getPeripheralData()`. The type is
 * not constrained: groups store bare `mes.peripherals.id` values, so the caller
 * decides how to treat a non access control row.
 */
export async function getPeripheral(
	id: number,
): Promise<AcDeviceRecord | null> {
	const row = await acQueryOne<Row>(
		`SELECT${DEVICE_COLUMNS} ${DEVICE_FROM} WHERE p.id = ? LIMIT 1`,
		[id],
	);
	return row ? toDevice(row) : null;
}

/**
 * Access control terminals a group may point at, including inactive ones: the
 * group editor must still render devices that were switched off. Devices that
 * are referenced but already soft-deleted stay visible too, otherwise editing a
 * group would silently drop them.
 */
export async function listGroupDeviceChoices(
	deviceIds: readonly number[] = [],
): Promise<AcDeviceRecord[]> {
	const ids = [...new Set(deviceIds.filter((id) => Number.isInteger(id)))];
	const rows = await acQuery<Row>(
		`SELECT${DEVICE_COLUMNS}
		 ${DEVICE_FROM}
		 WHERE p.type = ? AND (p.active = 1 OR p.id IN (?))
		 ORDER BY p.id ASC`,
		[AC_PERIPHERAL_TYPE, ids],
	);
	return rows.map(toDevice);
}

/** Device credentials from `mes.peripherals.attrs`; no fallback defaults yet. */
export function deviceCredentials(
	device: Pick<AcDeviceRecord, "attrs">,
): AcDeviceCredentials {
	const raw = asString(device.attrs);
	if (!raw) return { user: null, password: null };
	try {
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		return {
			user: asString(parsed.user),
			password: asString(parsed.password),
		};
	} catch {
		return { user: null, password: null };
	}
}
