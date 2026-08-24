export const CURRENCIES = ["BHD", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const BILLING_CYCLES = ["monthly", "quarterly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const DEFAULT_REMIND_DAYS = "30,60,90";

export type ContractStatusTone = "expired" | "soon" | "valid";

export type ContractStatus = {
	tone: ContractStatusTone;
	label: string;
	days: number;
};

function toLocalDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function contractStatus(endDateISO: string): ContractStatus {
	const end = toLocalDate(endDateISO);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const days = Math.round((end.getTime() - today.getTime()) / 86_400_000);

	if (days < 0) {
		return { tone: "expired", label: "Expired", days };
	}
	if (days === 0) {
		return { tone: "soon", label: "Expires today", days };
	}
	if (days <= 30) {
		return {
			tone: "soon",
			label: `${days} day${days === 1 ? "" : "s"} left`,
			days,
		};
	}
	return {
		tone: "valid",
		label: `${days} days left`,
		days,
	};
}

export function formatDateLabel(isoDate: string): string {
	return toLocalDate(isoDate).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
