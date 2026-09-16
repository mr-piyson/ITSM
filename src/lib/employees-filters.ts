import { parseAsJson } from "nuqs";

import { employeeStaffLabel } from "./employees-constants";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

const columnGetters: Record<string, (e: EmployeeItem) => string> = {
	emplCode: (e) => e.emplCode,
	name: (e) => e.name ?? "",
	email: (e) => e.email ?? "",
	staffType: (e) => employeeStaffLabel(e.staffType),
	onPayroll: (e) => (e.onPayroll === "Y" ? "Yes" : "No"),
	status: (e) => (e.leftDate ? "Left" : "Active"),
};

type TextFilter = {
	filterType?: string;
	type?: string | null;
	filter?: string | null;
	filterTo?: string | null;
};

function matchText(value: string, model: TextFilter): boolean {
	const op = model.type;
	const target = model.filter ?? "";
	const lower = value.toLowerCase();
	const targetLower = target.toLowerCase();

	switch (op) {
		case "equals":
			return lower === targetLower;
		case "notEqual":
			return lower !== targetLower;
		case "contains":
			return lower.includes(targetLower);
		case "notContains":
			return !lower.includes(targetLower);
		case "startsWith":
			return lower.startsWith(targetLower);
		case "endsWith":
			return lower.endsWith(targetLower);
		case "blank":
			return !value;
		case "notBlank":
			return !!value;
		default:
			return true;
	}
}

export function employeeMatchesFilters(
	employee: EmployeeItem,
	model: Record<string, TextFilter> | null | undefined,
): boolean {
	if (!model) return true;

	for (const [colId, filter] of Object.entries(model)) {
		const getter = columnGetters[colId];
		if (!getter) continue;
		const value = getter(employee);
		if (!matchText(value, filter)) return false;
	}

	return true;
}

function parseFilterModel(value: unknown): Record<string, TextFilter> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value as Record<string, TextFilter>;
}

export const filterModelParser = parseAsJson(parseFilterModel)
	.withOptions({ history: "replace" });
