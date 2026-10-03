/**
 * Schema and table references for the access control module.
 *
 * `MES_DATABASE` is a URI without a default schema, so every statement issued
 * through this module must schema-qualify its tables. This mirrors the legacy
 * PDO connection, which reached `hikvision.*` and `meslogs.*` the same way.
 */
export const AC_SCHEMA = "hikvision";
export const MES_SCHEMA = "mes";

export const AC_TABLES = {
	users: `${AC_SCHEMA}.users`,
	groups: `${AC_SCHEMA}.groups`,
	peripherals: `${MES_SCHEMA}.peripherals`,
	locations: `${MES_SCHEMA}.locations`,
	employees: `${MES_SCHEMA}.employees`,
	resources: `${MES_SCHEMA}.resources`,
	mesUsers: `${MES_SCHEMA}.users`,
	userRoles: `${MES_SCHEMA}.user_roles`,
} as const;

/** `mes.peripherals.type` discriminator for access control terminals. */
export const AC_PERIPHERAL_TYPE = "Access Control";

/** Device HTTP port assumed when `mes.peripherals.port` is NULL. */
export const AC_DEFAULT_DEVICE_PORT = 80;

export const AC_DEFAULT_PAGE_SIZE = 30;
export const AC_MAX_PAGE_SIZE = 100;

/**
 * `hikvision.users.access_group` holds a CSV of `hikvision.groups.id`
 * (e.g. "3,7,9"); `hikvision.groups.devices` holds a CSV of
 * `mes.peripherals.id` (e.g. "4,9,12"). Membership can only be tested with
 * FIND_IN_SET until a join table exists.
 */
export const USER_GROUP_COLUMN = "access_group";
export const GROUP_DEVICE_COLUMN = "devices";

/**
 * Legacy list filters (access_control/index.php:674-703). Each fragment is a
 * literal, never user input.
 */
export const USER_FILTER_SQL = {
	hr: "u.model LIKE 'employee'",
	manual: "u.model <> 'employee'",
	outsourced: "u.emp_source LIKE 'Outsourced'",
	bfg: "u.emp_source LIKE 'BFG'",
	activeonly: "u.access = 1",
	inactive: "u.access = 0",
	no_access: "u.access_group IS NULL",
} as const;

/**
 * Columns the legacy search box scans. Audit columns and the CSV/JSON blobs
 * are excluded on purpose: they are not useful search targets and would make
 * the OR chain expensive.
 */
export const USER_SEARCH_SQL: Record<string, string> = {
	person_id: "u.person_id",
	name: "u.name",
	emp_source: "u.emp_source",
	model: "u.model",
	device_ip: "u.device_ip",
	sync_source: "u.sync_source",
};

export const USER_DEFAULT_ORDER = [
	"u.sync_datetime DESC",
	"u.sync_updated_at DESC",
	"u.updated_at DESC",
	"u.created_at DESC",
] as const;

export const GROUP_SEARCH_SQL: Record<string, string> = {
	id: "g.id",
	name: "g.name",
};

export const GROUP_DEFAULT_ORDER = ["g.id DESC"] as const;
