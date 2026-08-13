export const BOOKING_STATUS_BOOKED = "booked";
export const BOOKING_STATUS_RECEIVED = "recieved";

export const BOOKING_PURPOSES = [
	"Traveling",
	"Maternity Leave",
	"Working from Home",
	"Meeting",
	"Site",
	"Factory Visit",
] as const;

export type BookingPurpose = (typeof BOOKING_PURPOSES)[number];

export function bookingStatusLabel(status?: string | null): string {
	if (status === BOOKING_STATUS_RECEIVED) {
		return "Received";
	}
	if (status === BOOKING_STATUS_BOOKED) {
		return "Booked";
	}
	return status ?? "-";
}

export function bookingStatusBadge(status?: string | null): string {
	if (status === BOOKING_STATUS_RECEIVED) {
		return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
	}
	if (status === BOOKING_STATUS_BOOKED) {
		return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
	}
	return "bg-muted text-muted-foreground";
}

export function formatBookingDate(date?: string | null): string {
	if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return "-";
	}
	const [year, month, day] = date.split("-").map(Number);
	const parsed = new Date(year, month - 1, day);
	if (Number.isNaN(parsed.getTime())) {
		return date;
	}
	return parsed.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function bookingToday(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function isBookingOverdue(
	status?: string | null,
	returnDate?: string | null,
): boolean {
	return (
		status === BOOKING_STATUS_BOOKED &&
		!!returnDate &&
		returnDate < bookingToday()
	);
}
