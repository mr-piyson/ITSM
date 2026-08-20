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

import { Badge } from "@/components/ui/badge";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DailyAttendance } from "@/server/routers/attendance";

type AttendanceTableProps = {
	days: DailyAttendance[];
};

function formatMinutes(minutes: number): string {
	if (minutes === 0) {
		return "-";
	}
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) {
		return `${h}h ${m}m`;
	}
	if (h > 0) {
		return `${h}h`;
	}
	return `${m}m`;
}

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

function StatusBadge({ status }: { status: DailyAttendance["status"] }) {
	if (status === "absent") {
		return (
			<Badge
				variant="destructive"
				className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
			>
				Absent
			</Badge>
		);
	}
	if (status === "late") {
		return (
			<Badge
				variant="secondary"
				className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
			>
				Late
			</Badge>
		);
	}
	if (status === "weekend") {
		return (
			<Badge
				variant="secondary"
				className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
			>
				Weekend
			</Badge>
		);
	}
	return (
		<Badge
			variant="secondary"
			className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
		>
			On Time
		</Badge>
	);
}

export function AttendanceTable({ days }: AttendanceTableProps) {
	const columns = useMemo<ColumnDef<DailyAttendance>[]>(
		() => [
			{
				id: "weekday",
				header: "Day",
				size: 80,
				accessorFn: (row) => row.date,
				cell: ({ getValue }) => {
					const value = String(getValue());
					const [y, m, d] = value.split("-");
					const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
					const weekday = dateObj.toLocaleDateString("en-US", {
						weekday: "long",
					});
					return <span className="font-medium">{weekday}</span>;
				},
			},
			{
				accessorKey: "date",
				header: "Date",
				size: 110,
				cell: ({ getValue }) => {
					const value = String(getValue());
					return <span className="font-mono text-xs">{value}</span>;
				},
			},
			{
				accessorKey: "checkIn",
				header: "Check In",
				size: 100,
				cell: ({ getValue }) => {
					const value = getValue() as string | null;
					return (
						<span
							className={cn(
								"font-mono text-xs",
								!value && "text-muted-foreground",
							)}
						>
							{value ?? "-"}
						</span>
					);
				},
			},
			{
				accessorKey: "checkOut",
				header: "Check Out",
				size: 100,
				cell: ({ getValue }) => {
					const value = getValue() as string | null;
					return (
						<span
							className={cn(
								"font-mono text-xs",
								!value && "text-muted-foreground",
							)}
						>
							{value ?? "-"}
						</span>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				size: 100,
				cell: ({ getValue }) => {
					const status = getValue() as DailyAttendance["status"];
					return <StatusBadge status={status} />;
				},
			},
			{
				accessorKey: "lateMinutes",
				header: "Late",
				size: 100,
				cell: ({ getValue }) => {
					const minutes = getValue() as number;
					return (
						<span
							className={cn(
								"font-mono text-xs",
								minutes > 0
									? "text-red-600 dark:text-red-400"
									: "text-muted-foreground",
							)}
						>
							{formatMinutes(minutes)}
						</span>
					);
				},
			},
			{
				accessorKey: "extraMinutes",
				header: "Extra Hours",
				size: 110,
				cell: ({ getValue }) => {
					const minutes = getValue() as number;
					return (
						<span
							className={cn(
								"font-mono text-xs",
								minutes > 0
									? "text-emerald-600 dark:text-emerald-400"
									: "text-muted-foreground",
							)}
						>
							{formatMinutes(minutes)}
						</span>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: days,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const parentRef = useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40,
		overscan: 10,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border"
		>
			<table className="w-full min-w-[640px] caption-bottom text-xs">
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
								className={cn(
									"flex",
									row.original.weekend && "bg-muted/50 text-muted-foreground",
								)}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									height: `${virtualRow.size}px`,
									alignItems: "center",
								}}
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
