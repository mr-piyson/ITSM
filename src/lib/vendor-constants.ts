import { imageUrl } from "@/lib/images";

// Mirrors the legacy ISS vendor contact types (ISS/newVendor.php)
export const CONTACT_TYPES = ["mobile", "email", "other"] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export function vendorImageUrl(image?: string | null): string | null {
	return imageUrl(image);
}
