"use client";

import { useState } from "react";

import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingToday, formatBookingDate } from "@/lib/booking-constants";
import type { BookingItem } from "@/server/routers/bookings";
import { trpc } from "@/trpc/react";

export function MarkReceivedDialog({
	booking,
	onOpenChange,
	onSuccess,
}: {
	booking: BookingItem | null;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	const utils = trpc.useUtils();
	const mutation = trpc.bookings.markReceived.useMutation({
		onSuccess: () => {
			utils.bookings.list.invalidate();
			onSuccess();
			toast.success("Asset marked as received");
		},
		onError: (error) => toast.error(error.message),
	});

	const confirm = () => {
		if (!booking) {
			return;
		}
		mutation.mutate({ id: booking.id, assetID: booking.assetID });
	};

	return (
		<AlertDialog
			open={booking !== null && !mutation.isSuccess}
			onOpenChange={(open) => {
				if (!open && !mutation.isPending) {
					onOpenChange(false);
				}
			}}
		>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia>
						<CalendarPlus />
					</AlertDialogMedia>
					<AlertDialogTitle>Mark asset as received?</AlertDialogTitle>
					<AlertDialogDescription>
						This confirms that {booking?.employeeName || "the employee"} has
						returned the asset. It will be set back to{" "}
						<b className="text-foreground">Available</b> in stock.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={mutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						variant="default"
						disabled={mutation.isPending}
						onClick={confirm}
					>
						{mutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							"Confirm received"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function ExtendDialog({
	booking,
	onOpenChange,
	onSuccess,
}: {
	booking: BookingItem | null;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	const utils = trpc.useUtils();
	const mutation = trpc.bookings.extend.useMutation({
		onSuccess: () => {
			utils.bookings.list.invalidate();
			onSuccess();
			toast.success("Booking extended successfully");
		},
		onError: (error) => toast.error(error.message),
	});

	const [value, setValue] = useState(booking?.returnDate ?? bookingToday());
	const minDate = booking ? booking.returnDate : bookingToday();
	const error =
		booking && value < booking.bookingDate
			? "Return date cannot be before the booking date"
			: null;

	const submit = () => {
		if (!booking || error) {
			return;
		}
		mutation.mutate({
			id: booking.id,
			assetID: booking.assetID,
			endDate: value,
		});
	};

	return (
		<Dialog
			open={booking !== null}
			onOpenChange={(open) => {
				if (!open && !mutation.isPending) {
					onOpenChange(false);
				}
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Extend return date</DialogTitle>
					<DialogDescription>
						{booking
							? `Current return date is ${formatBookingDate(booking.returnDate)}.`
							: "Set a new return date for this booking."}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<Label htmlFor="extend-date">New return date</Label>
					<Input
						id="extend-date"
						type="date"
						min={minDate}
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					{error && (
						<p className="text-xs font-medium text-destructive">{error}</p>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						disabled={mutation.isPending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={submit}
						disabled={!value || !!error || mutation.isPending}
					>
						{mutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<CalendarPlus />
						)}
						Extend booking
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
