import type { CardType, VerifyMode } from "./csv";

/** Human labels for the legacy filter set, in display order. */
export const AC_USER_FILTER_LABELS = {
	hr: "HR",
	manual: "Manual",
	outsourced: "Outsourced",
	bfg: "BFG",
	activeonly: "Active only",
	inactive: "Inactive",
	no_access: "No access group",
} as const satisfies Record<string, string>;

/**
 * `activeonly` and `inactive` describe opposite halves of `users.access`, so
 * only one of each pair can be active at a time.
 */
export const AC_EXCLUSIVE_FILTERS: readonly (readonly string[])[] = [
	["activeonly", "inactive"],
];

export const AC_USER_SEARCH_FIELD_LABELS = {
	all: "All fields",
	person_id: "Person ID",
	name: "Name",
	emp_source: "Employee source",
	model: "Model",
	device_ip: "Device IP",
	sync_source: "Sync source",
} as const satisfies Record<string, string>;

export const AC_GROUP_SEARCH_FIELD_LABELS = {
	all: "All fields",
	id: "Group ID",
	name: "Name",
} as const satisfies Record<string, string>;

export const AC_VERIFY_MODE_LABELS: Record<VerifyMode, string> = {
	same_as_device: "Device default",
	face: "Face",
	card: "Card",
	faceAndCard: "Face + card",
	cardOrFace: "Card or face",
};

export function acVerifyModeLabel(mode: string | null | undefined): string {
	if (!mode) return "Device default";
	return AC_VERIFY_MODE_LABELS[mode as VerifyMode] ?? mode;
}

export const AC_CARD_TYPE_LABELS: Record<CardType, string> = {
	normalCard: "Normal",
	patrolCard: "Patrol",
	duressCard: "Duress",
	superCard: "Super",
};

export function acCardTypeLabel(type: string | null | undefined): string {
	if (!type) return AC_CARD_TYPE_LABELS.normalCard;
	return AC_CARD_TYPE_LABELS[type as CardType] ?? type;
}

/** `emp_source` is stored capitalized ("Outsourced", "BFG"). */
export const AC_EMP_SOURCE_LABELS: Record<string, string> = {
	outsourced: "Outsourced",
	bfg: "BFG",
	hr: "HR",
	manual: "Manual",
};

export function acEmpSourceLabel(source: string | null | undefined): string {
	if (!source) return "—";
	return AC_EMP_SOURCE_LABELS[source.toLowerCase()] ?? source;
}
