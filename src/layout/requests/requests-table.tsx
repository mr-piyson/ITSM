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
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	modificationLabel,
	priorityLabel,
	statusLabel,
} from "@/lib/request-constants";
import { cn } from "@/lib/utils";
import type { RequestItem } from "@/server/routers/requests";

type RequestsTableProps = {
	requests: RequestItem[];
	onDetails: (request: RequestItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function PriorityBadge({ priority }: { priority: string | null }) {
	const label = priorityLabel(priority);
	const className =
		priority === "high"
			? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200"
			: priority === "medium"
				? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200"
				: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200";
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
				className,
			)}
		>
			{label}
		</span>
	);
}

export function StatusBadge({ status }: { status: string | null }) {
	const label = statusLabel(status);
	const className =
		status === "pending"
			? "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200"
			: status === "accepted"
				? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200"
				: status === "declined"
					? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200"
					: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200";
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
				className,
			)}
		>
			{label}
		</span>
	);
}

function formatSubmitDate(value: string | null): string {
	if (!value) {
		return "-";
	}
	const date = new Date(value.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

export function RequestsTable({ requests, onDetails }: RequestsTableProps) {
	const columns = useMemo<ColumnDef<RequestItem>[]>(
		() => [
			{
				id: "submitDate",
				header: "Submitted",
				size: 170,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{formatSubmitDate(row.original.submitDate)}
					</span>
				),
			},
			{
				id: "id",
				header: "ID",
				size: 70,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate font-mono text-xs font-medium">
						#{row.original.id}
					</span>
				),
			},
			{
				id: "priority",
				header: "Priority",
				size: 100,
				cell: ({ row }) => (
					<PriorityBadge priority={row.original.requestPrio} />
				),
			},
			{
				id: "userName",
				header: "User",
				size: 150,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{row.original.userName ?? "-"}
					</span>
				),
			},
			{
				id: "page",
				header: "Page",
				size: 190,
				grow: true,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{row.original.slctname === "other"
							? `Other (${row.original.otherpg ?? "-"})`
							: row.original.pgtype === "new"
								? `New: ${row.original.newpg ?? "-"}`
								: (row.original.slctname ?? "-")}
					</span>
				),
			},
			{
				id: "modifi",
				header: "Modification",
				size: 140,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{modificationLabel(row.original.modifi)}
					</span>
				),
			},
			{
				id: "descrip",
				header: "Description",
				size: 240,
				grow: true,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate text-muted-foreground">
						{row.original.descrip || "-"}
					</span>
				),
			},
			{
				id: "status",
				header: "Status",
				size: 110,
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
			},
			{
				id: "replies",
				header: "Replies",
				size: 80,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate tabular-nums">
						{row.original.replyCount}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				size: 56,
				cell: ({ row }) => (
					<div className="flex items-center justify-end gap-0.5">
						<Button
							variant="ghost"
							size="icon-sm"
							title="Details"
							onClick={(e) => {
								e.stopPropagation();
								onDetails(row.original);
							}}
						>
							<ExternalLink />
						</Button>
					</div>
				),
			},
		],
		[onDetails],
	);

	const table = useReactTable({
		data: requests,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const parentRef = useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48,
		overscan: 10,
	});

	return (
		<div
			ref={parentRef}
			className="min-h-0 flex-1 overflow-auto rounded-none border"
		>
			<table className="w-full min-w-[1100px] caption-bottom text-xs">
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
