"use client";

import { CalendarPlus, CheckCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	BOOKING_STATUS_BOOKED,
	bookingStatusBadge,
	bookingStatusLabel,
	formatBookingDate,
	isBookingOverdue,
} from "@/lib/booking-constants";
import { employeeImageUrl } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { BookingItem } from "@/server/routers/ITSM/bookings";

function formatDateTime(value?: string | null): string {
	if (!value) {
		return "-";
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}
	return parsed.toLocaleString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function BookingDetailsDialog({
	booking,
	onOpenChange,
	onExtend,
	onReceived,
}: {
	booking: BookingItem | null;
	onOpenChange: (open: boolean) => void;
	onExtend: (booking: BookingItem) => void;
	onReceived: (booking: BookingItem) => void;
}) {
	const isBooked = booking?.status === BOOKING_STATUS_BOOKED;
	const overdue = booking
		? isBookingOverdue(booking.status, booking.returnDate)
		: false;
	const imageUrl = employeeImageUrl(booking?.employeeImage);

	return (
		<Dialog open={booking !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
				{booking && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<span className="font-mono">#{booking.id}</span>
								<Badge
									className={cn(
										"rounded-none font-normal",
										bookingStatusBadge(booking.status),
									)}
								>
									{bookingStatusLabel(booking.status)}
								</Badge>
							</DialogTitle>
							<DialogDescription>Booking details</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* Employee */}
							<div className="flex items-center gap-3">
								<Avatar className="size-11 shrink-0">
									{imageUrl && (
										<AvatarImage src={imageUrl} alt={booking.employeeName} />
									)}
									<AvatarFallback>
										{booking.employeeName[0]?.toUpperCase() ?? "?"}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate font-medium">{booking.employeeName}</p>
									<p className="text-xs text-muted-foreground">
										Employee ID {booking.empID}
									</p>
								</div>
							</div>

							<Separator />

							{/* Asset */}
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground">
									Asset
								</p>
								<p className="truncate font-medium font-mono">
									{booking.assetCode || "-"}
								</p>
								{booking.assetName && (
									<p className="truncate text-sm">{booking.assetName}</p>
								)}
								<p className="text-xs text-muted-foreground">
									{[booking.assetManufacturer, booking.assetModel]
										.filter(Boolean)
										.join(" ") || "-"}
									{booking.assetType ? ` • ${booking.assetType}` : ""}
								</p>
								{booking.assetLocation && (
									<p className="text-xs text-muted-foreground">
										Location: {booking.assetLocation}
									</p>
								)}
							</div>

							<Separator />

							{/* Dates */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<p className="text-xs font-semibold text-muted-foreground">
										Booking date
									</p>
									<p className="text-sm">
										{formatBookingDate(booking.bookingDate)}
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold text-muted-foreground">
										Return date
									</p>
									<p className="flex items-center gap-1.5 text-sm">
										{formatBookingDate(booking.returnDate)}
										{overdue && (
											<span className="inline-flex bg-red-100 px-1.5 py-px text-[10px] font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
												Overdue
											</span>
										)}
									</p>
								</div>
							</div>

							<Separator />

							{/* Purpose */}
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground">
									Purpose
								</p>
								<p className="text-sm">{booking.purpose || "-"}</p>
							</div>

							{booking.otherInfo && (
								<div className="space-y-1">
									<p className="text-xs font-semibold text-muted-foreground">
										Other information
									</p>
									<p className="text-sm">{booking.otherInfo}</p>
								</div>
							)}

							<div className="space-y-1 border-t pt-3">
								<p className="text-xs text-muted-foreground">
									Booked {formatDateTime(booking.addedTime)}
									{booking.createdByName ? ` by ${booking.createdByName}` : ""}
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Close
							</Button>
							{isBooked && (
								<>
									<Button variant="outline" onClick={() => onExtend(booking)}>
										<CalendarPlus />
										Extend
									</Button>
									<Button onClick={() => onReceived(booking)}>
										<CheckCheck />
										Mark received
									</Button>
								</>
							)}
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
