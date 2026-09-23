import { imageUrl } from "@/lib/images";

export function employeeStaffLabel(staffType: "S" | "W"): string {
	return staffType === "S" ? "Staff" : "Worker";
}

export function employeeImageUrl(image?: string | null): string | null {
	return imageUrl(image);
}
