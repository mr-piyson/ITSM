import { z } from "zod";

import type { AcCard, VerifyMode } from "./csv";

export type { AcCard, VerifyMode };

/** Row shape returned by the user queries (aliases applied in SQL). */
export type AcUserRecord = {
	personId: string;
	employeeId: number | null;
	name: string | null;
	access: number;
	isAdmin: number;
	empSource: string | null;
	deviceIp: string | null;
	accessGroup: string | null;
	cards: string | null;
	beginTime: string | null;
	endTime: string | null;
	model: string | null;
	verifyMode: string | null;
	syncSource: string | null;
	syncUpdatedAt: string | null;
	syncDatetime: string | null;
	createdAt: string | null;
	createdBy: number | null;
	updatedAt: string | null;
	updatedBy: number | null;
};

export type AcGroupRecord = {
	id: number;
	name: string;
	devices: string | null;
	startDatetime: string | null;
	endDatetime: string | null;
	repeated: number;
	currentActivated: number;
	activatedDevices: string | null;
	activatedUsers: string | null;
	activatedAt: string | null;
	createdAt: string | null;
	createdBy: number | null;
	updatedAt: string | null;
	updatedBy: number | null;
	deletedAt: string | null;
	deletedBy: number | null;
};

/** Compact group payload used to label user rows without an N+1 query. */
export type AcGroupSummary = {
	id: number;
	name: string;
};

export type AcDeviceRecord = {
	id: number;
	deviceIp: string;
	ip: string;
	port: number | null;
	acDirection: "In" | "Out" | null;
	description: string | null;
	locationId: number | null;
	locationAbbreviation: string | null;
	locationName: string | null;
	active: number;
	failedConnect: number;
	/** Device credentials as stored in `mes.peripherals.attrs`. Server-only. */
	attrs: string | null;
};

/** Device shape safe to send to the browser — no credentials. */
export type AcDevicePublic = Omit<AcDeviceRecord, "attrs">;

export type AcDeviceCredentials = {
	user: string | null;
	password: string | null;
};

/** A `mes.resources` row backing an access control face photo. */
export type AcPhotoAsset = {
	id: number;
	model: string;
	uid: string;
	filename: string;
	ext: string;
	mime: string | null;
	size: number | null;
	/** Web-relative storage path of the full image. */
	file: string;
	/** Web-relative storage path of the `_m` variant, when present. */
	thumbnail: string | null;
};

export const AC_USER_FILTERS = [
	"hr",
	"manual",
	"outsourced",
	"bfg",
	"activeonly",
	"inactive",
	"no_access",
] as const;

export const AC_USER_SEARCH_FIELDS = [
	"person_id",
	"name",
	"emp_source",
	"model",
	"device_ip",
	"sync_source",
] as const;

export const AC_GROUP_SEARCH_FIELDS = ["id", "name"] as const;

/** Legacy filter id, e.g. `"hr"` or `"no_access"`. */
export type AcUserFilter = (typeof AC_USER_FILTERS)[number];

/** Column the user search box scans, or `"all"`. */
export type AcUserSearchField = (typeof AC_USER_SEARCH_FIELDS)[number] | "all";

/** Column the group search box scans, or `"all"`. */
export type AcGroupSearchField =
	| (typeof AC_GROUP_SEARCH_FIELDS)[number]
	| "all";

export const AcUserFilterSchema = z.enum(AC_USER_FILTERS);
export const AcUserSearchFieldSchema = z.enum([
	...AC_USER_SEARCH_FIELDS,
	"all",
]);

export const PersonIdSchema = z
	.string()
	.trim()
	.min(1, "person_id is required")
	.max(128, "person_id is too long");

export const AcUserListInputSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	perPage: z.coerce.number().int().min(1).max(100).default(30),
	q: z.string().trim().max(128).optional(),
	searchIn: AcUserSearchFieldSchema.default("all"),
	filters: z.array(AcUserFilterSchema).max(AC_USER_FILTERS.length).default([]),
});

export type AcUserListInput = z.infer<typeof AcUserListInputSchema>;

/** Accepted (pre-default) input shape for `listAcUsers`. */
export type AcUserListArgs = z.input<typeof AcUserListInputSchema>;

export const AcGroupListInputSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	perPage: z.coerce.number().int().min(1).max(100).default(30),
	q: z.string().trim().max(255).optional(),
	searchIn: z.enum([...AC_GROUP_SEARCH_FIELDS, "all"]).default("all"),
	includeDeleted: z.coerce.boolean().default(false),
});

export type AcGroupListInput = z.infer<typeof AcGroupListInputSchema>;

/** Accepted (pre-default) input shape for `listAcGroups`. */
export type AcGroupListArgs = z.input<typeof AcGroupListInputSchema>;

export const AcDeviceListInputSchema = z.object({
	activeOnly: z.coerce.boolean().default(true),
});

export type AcDeviceListInput = z.infer<typeof AcDeviceListInputSchema>;

export const AcUserDetailInputSchema = z.object({
	personId: PersonIdSchema,
});

export const AcGroupIdInputSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export type AcUserListResult = {
	rows: AcUserRecord[];
	total: number;
	page: number;
	perPage: number;
	pageCount: number;
	/** Distinct groups referenced by the returned page. */
	groups: AcGroupSummary[];
};

export type AcGroupListResult = {
	rows: AcGroupRecord[];
	total: number;
	page: number;
	perPage: number;
	pageCount: number;
};
