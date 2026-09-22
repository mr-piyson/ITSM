import type { MappedFields } from "./map";

export function toBase64Url(json: string): string {
	return Buffer.from(json, "utf8").toString("base64url");
}

export function buildLink(baseUrl: string, fields: MappedFields): string {
	const payload = toBase64Url(JSON.stringify(fields));
	return `${baseUrl}/app/assets?new=${payload}`;
}
