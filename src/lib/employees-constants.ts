export const STAFF_ID_THRESHOLD = 100000;

export function isStaff(empID: number): boolean {
	return empID <= STAFF_ID_THRESHOLD;
}

export function employeeCategory(empID: number): "Staff" | "nonStaff" {
	return isStaff(empID) ? "Staff" : "nonStaff";
}

export function employeeImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `/ISS/itemsImages/${image}`;
}

export const LICENSE_LABELS: Record<string, string> = {
	standard: "Business Standard",
	basic: "Business Basic",
	e3: "E3",
};
