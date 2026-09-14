export function employeeStaffLabel(staffType: "S" | "W"): string {
	return staffType === "S" ? "Staff" : "Worker";
}

export function employeeImageUrl(image?: string | null): string | null {
	if (!image) {
		return null;
	}
	if (/^https?:\/\//.test(image)) {
		return image;
	}
	return `http://iss.bfginternational.com/ISS/itemsImages/${image}`;
}
