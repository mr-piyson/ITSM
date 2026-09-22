import { z } from "zod";

import { ASSET_TYPES } from "@/lib/assets-constants";

const maxField = (max: number) =>
	z.string().trim().max(max, `Max ${max} characters`).optional().nullable();

export const assetPrefillSchema = z.object({
	type: z.enum(ASSET_TYPES).optional().nullable(),
	serialNumber: maxField(50),
	manufacturer: maxField(50),
	model: maxField(50),
	processor: maxField(50),
	os: maxField(50),
	memory: maxField(50),
	hdd: maxField(50),
	deviceName: maxField(50),
	ip: maxField(50),
});

export type AssetPrefill = z.infer<typeof assetPrefillSchema>;

const MAX_PAYLOAD_LENGTH = 8000;

function decodeBase64Url(input: string): string | null {
	if (input.length > MAX_PAYLOAD_LENGTH) {
		return null;
	}
	try {
		const padding = input.length % 4;
		const padded = padding
			? `${input.replaceAll("-", "+").replaceAll("_", "/")}${"=".repeat(4 - padding)}`
			: input.replaceAll("-", "+").replaceAll("_", "/");
		return decodeURIComponent(
			Array.from(
				atob(padded),
				(char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
			).join(""),
		);
	} catch {
		return null;
	}
}

export function parseAssetPrefill(param: string | null): AssetPrefill | null {
	if (!param) {
		return null;
	}
	const json = decodeBase64Url(param);
	if (!json) {
		return null;
	}
	let raw: unknown;
	try {
		raw = JSON.parse(json);
	} catch {
		return null;
	}
	if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
		return null;
	}
	const result = assetPrefillSchema.safeParse(raw);
	if (!result.success) {
		return null;
	}
	return result.data;
}
