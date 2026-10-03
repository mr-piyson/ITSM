/**
 * Helpers for the CSV-encoded columns that predate any join table:
 * `hikvision.users.access_group`, `hikvision.groups.devices` and the
 * `hikvision.users.cards` JSON array.
 */

export type CardType = "normalCard" | "patrolCard" | "duressCard" | "superCard";

export const CARD_TYPES: readonly CardType[] = [
	"normalCard",
	"patrolCard",
	"duressCard",
	"superCard",
];

export type AcCard = {
	cardNo: string;
	cardType: CardType;
};

export type VerifyMode =
	| "same_as_device"
	| "face"
	| "card"
	| "faceAndCard"
	| "cardOrFace";

export const VERIFY_MODES: readonly VerifyMode[] = [
	"same_as_device",
	"face",
	"card",
	"faceAndCard",
	"cardOrFace",
];

/**
 * Values that are only forwarded to a device when they differ from
 * `same_as_device` (inc/functions.php:7228-7231).
 */
export function isDeviceVerifyMode(mode: string | null): boolean {
	return !!mode && mode !== "same_as_device";
}

/** "3,7,9" -> [3, 7, 9]. Junk segments are dropped rather than throwing. */
export function parseCsvInts(value: string | null | undefined): number[] {
	if (!value) return [];
	const out: number[] = [];
	for (const part of value.split(",")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const parsed = Number(trimmed);
		if (Number.isInteger(parsed)) out.push(parsed);
	}
	return out;
}

export function formatCsvIds(ids: readonly number[]): string {
	return ids.filter((id) => Number.isInteger(id)).join(",");
}

/** `"[{\"cardNo\":\"1\",\"cardType\":\"normalCard\"}]"` -> Card[]. */
export function readCards(value: string | null | undefined): AcCard[] {
	if (!value) return [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	const cards: AcCard[] = [];
	for (const entry of parsed) {
		if (!entry || typeof entry !== "object") continue;
		const record = entry as Record<string, unknown>;
		const cardNo = String(record.cardNo ?? "").trim();
		if (!cardNo) continue;
		const rawType = String(record.cardType ?? "").trim();
		const cardType = CARD_TYPES.includes(rawType as CardType)
			? (rawType as CardType)
			: "normalCard";
		cards.push({ cardNo, cardType });
	}
	return cards;
}

export function cardsToJson(cards: readonly AcCard[]): string {
	return JSON.stringify(
		cards.map((card) => ({
			cardNo: card.cardNo,
			cardType: CARD_TYPES.includes(card.cardType)
				? card.cardType
				: "normalCard",
		})),
	);
}
