"use client";

import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CalendarPlus, CheckCheck, ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	bookingStatusBadge,
	bookingStatusLabel,
	BOOKING_STATUS_BOOKED,
	formatBookingDate,
	isBookingOverdue,
} from "@/lib/booking-constants";
import { employeeImageUrl } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { BookingItem } from "@/server/routers/ITSM/bookings";

type BookingTableProps = {
	bookings: BookingItem[];
	onDetails: (booking: BookingItem) => void;
	onReceived: (booking: BookingItem) => void;
	onExtend: (booking: BookingItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function BookingTable({
	bookings,
	onDetails,
	onReceived,
	onExtend,
}: BookingTableProps) {
	const columns = useMemo<ColumnDef<BookingItem>[]>(
		() => [
			{
				id: "employee",
				header: "Employee",
				size: 200,
				cell: ({ row }) => {
					const imageUrl = employeeImageUrl(row.original.employeeImage);
					return (
						<div className="flex min-w-0 items-center gap-2">
							<Avatar className="size-7 shrink-0">
								{imageUrl && (
									<AvatarImage src={imageUrl} alt={row.original.employeeName} />
								)}
								<AvatarFallback className="text-[10px]">
									{row.original.employeeName[0]?.toUpperCase() ?? "?"}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate font-medium">
									{row.original.employeeName || "-"}
								</p>
								<p className="truncate text-[10px] text-muted-foreground">
									EmpID {row.original.empID}
								</p>
							</div>
						</div>
					);
				},
			},
			{
				id: "asset",
				header: "Asset",
				size: 240,
				cell: ({ row }) => {
					const {
						assetCode,
						assetName,
						assetType,
						assetManufacturer,
						assetModel,
					} = row.original;
					return (
						<div className="min-w-0">
							<p className="truncate font-medium">
								{assetCode}
								{assetName ? ` — ${assetName}` : ""}
							</p>
							<p className="truncate text-[10px] text-muted-foreground">
								{[assetManufacturer, assetModel].filter(Boolean).join(" ") ||
									"-"}
							</p>
							{assetType && (
								<span className="mt-0.5 inline-flex bg-muted px-1 py-px text-[10px] text-muted-foreground">
									{assetType}
								</span>
							)}
						</div>
					);
				},
			},
			{
				id: "status",
				header: "Status",
				size: 110,
				cell: ({ row }) => (
					<span
						className={cn(
							"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
							bookingStatusBadge(row.original.status),
						)}
					>
						{bookingStatusLabel(row.original.status)}
					</span>
				),
			},
			{
				accessorKey: "bookingDate",
				header: "Booking Date",
				size: 120,
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-muted-foreground">
						{formatBookingDate(String(getValue() ?? ""))}
					</span>
				),
			},
			{
				id: "returnDate",
				header: "Return Date",
				size: 150,
				cell: ({ row }) => {
					const overdue = isBookingOverdue(
						row.original.status,
						row.original.returnDate,
					);
					return (
						<span className="flex items-center gap-1.5 whitespace-nowrap">
							<span className="text-muted-foreground">
								{formatBookingDate(row.original.returnDate)}
							</span>
							{overdue && (
								<span className="inline-flex whitespace-nowrap bg-red-100 px-1.5 py-px text-[10px] font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
									Overdue
								</span>
							)}
						</span>
					);
				},
			},
			{
				accessorKey: "purpose",
				header: "Purpose",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "otherInfo",
				header: "Other Info",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate text-muted-foreground">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const isBooked = row.original.status === BOOKING_STATUS_BOOKED;
					return (
						<div className="flex items-center justify-end gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								title="Details"
								onClick={() => onDetails(row.original)}
							>
								<ExternalLink />
							</Button>
							{isBooked && (
								<>
									<Button
										variant="ghost"
										size="icon-sm"
										title="Extend return date"
										onClick={() => onExtend(row.original)}
									>
										<CalendarPlus />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										title="Mark as received"
										className="text-green-600 hover:text-green-700"
										onClick={() => onReceived(row.original)}
									>
										<CheckCheck />
									</Button>
								</>
							)}
						</div>
					);
				},
			},
		],
		[onDetails, onReceived, onExtend],
	);

	const table = useReactTable({
		data: bookings,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const parentRef = useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56,
		overscan: 10,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border"
		>
			<table className="w-full min-w-[1120px] caption-bottom text-xs">
				<TableHeader className="sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="flex w-full bg-muted hover:bg-muted"
							style={{ alignItems: "center" }}
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="flex items-center overflow-hidden border-r px-2 text-xs font-semibold last:border-r-0"
									style={cellStyle(
										() => header.getSize(),
										headerGroup.headers[headerGroup.headers.length - 1].id ===
											header.id,
									)}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
						display: "block",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const row = rows[virtualRow.index];
						return (
							<TableRow
								key={row.id}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								className="flex cursor-pointer"
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									height: `${virtualRow.size}px`,
									alignItems: "center",
								}}
								onClick={() => onDetails(row.original)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className="flex items-center overflow-hidden border-r px-2 last:border-r-0"
										style={cellStyle(
											cell.column.getSize,
											row.getVisibleCells()[row.getVisibleCells().length - 1]
												.id === cell.id,
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						);
					})}
				</TableBody>
			</table>
		</div>
	);
}
