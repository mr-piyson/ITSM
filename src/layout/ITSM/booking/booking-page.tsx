"use client";

import { CalendarDays, Loader2, Plus, Search } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BookingItem } from "@/server/routers/ITSM/bookings";
import { trpc } from "@/trpc/react";

import { ExtendDialog, MarkReceivedDialog } from "./booking-actions";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { BookingFormDialog } from "./booking-form-dialog";
import { BookingTable } from "./booking-table";

const STATUS_VALUES = ["all", "booked", "recieved"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "booked", label: "Booked" },
	{ value: "recieved", label: "Received" },
];

export function BookingPage() {
	const utils = trpc.useUtils();
	const { data: bookings = [], isPending } = trpc.bookings.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [status, setStatus] = useQueryState(
		"status",
		parseAsStringEnum([...STATUS_VALUES])
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [bookingId, setBookingId] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [receivedBooking, setReceivedBooking] = useState<BookingItem | null>(
		null,
	);
	const [extendBooking, setExtendBooking] = useState<BookingItem | null>(null);

	const detailsBooking = useMemo(
		() => bookings.find((b) => String(b.id) === bookingId) ?? null,
		[bookings, bookingId],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return bookings.filter((booking) => {
			if (status !== "all" && booking.status !== status) {
				return false;
			}
			if (!q) {
				return true;
			}
			return [
				booking.employeeName,
				String(booking.empID),
				booking.assetCode,
				booking.assetName,
				booking.assetType,
				booking.assetManufacturer,
				booking.assetModel,
				booking.purpose,
				booking.otherInfo,
			]
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [bookings, query, status]);

	const invalidate = () => utils.bookings.list.invalidate();

	const handleFormSuccess = () => {
		setFormOpen(false);
		invalidate();
	};

	const handleReceived = (booking: BookingItem) => {
		setBookingId(null, { history: "replace" });
		setReceivedBooking(booking);
	};

	const handleExtend = (booking: BookingItem) => {
		setBookingId(null, { history: "replace" });
		setExtendBooking(booking);
	};

	const closeDetails = () => setBookingId(null, { history: "replace" });

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							Asset Bookings
						</h1>
						<p className="text-xs text-muted-foreground">
							Bookings ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={() => setFormOpen(true)}>
						<Plus data-icon="inline-start" />
						New Booking
					</Button>
				</div>

				<div className="flex min-w-0 flex-col gap-3">
					<div className="relative w-full max-w-lg">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search employee, asset, purpose…"
							className="h-9 pl-8"
						/>
					</div>

					<div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1">
						{STATUS_TABS.map((tab) => (
							<button
								key={tab.value}
								onClick={() => setStatus(tab.value)}
								className={cn(
									"shrink-0 rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap transition-colors",
									status === tab.value
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<CalendarDays />
						</EmptyMedia>
						<EmptyTitle>
							{bookings.length === 0 ? "No bookings yet" : "No bookings found"}
						</EmptyTitle>
						<EmptyDescription>
							{bookings.length === 0
								? "Reserve an available asset for an employee to get started."
								: "Try adjusting your search or status filter."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{bookings.length === 0 && (
							<Button size="sm" onClick={() => setFormOpen(true)}>
								<Plus data-icon="inline-start" />
								Create the first booking
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<BookingTable
					bookings={filtered}
					onDetails={(booking) => setBookingId(String(booking.id))}
					onReceived={setReceivedBooking}
					onExtend={setExtendBooking}
				/>
			)}

			<BookingFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSuccess={handleFormSuccess}
			/>

			<BookingDetailsDialog
				booking={detailsBooking}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
				onExtend={handleExtend}
				onReceived={handleReceived}
			/>

			<MarkReceivedDialog
				booking={receivedBooking}
				onOpenChange={(open) => {
					if (!open) {
						setReceivedBooking(null);
					}
				}}
				onSuccess={() => {
					setReceivedBooking(null);
					invalidate();
				}}
			/>

			<ExtendDialog
				key={extendBooking?.id ?? "closed"}
				booking={extendBooking}
				onOpenChange={(open) => {
					if (!open) {
						setExtendBooking(null);
					}
				}}
				onSuccess={() => {
					setExtendBooking(null);
					invalidate();
				}}
			/>
		</div>
	);
}
