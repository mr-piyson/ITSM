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
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	formatTapeDateTime,
	locationLabel,
	tapeStatusBadge,
} from "@/lib/tape-constants";
import { cn } from "@/lib/utils";
import type { TapeItem } from "@/server/routers/ITSM/tapes";

type TapesTableProps = {
	tapes: TapeItem[];
	onDetails: (tape: TapeItem) => void;
	onEdit: (tape: TapeItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

function StatusCell({ tape }: { tape: TapeItem }) {
	const badge = tapeStatusBadge(tape.status, Boolean(tape.month && tape.year));
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
				badge.className,
			)}
		>
			{badge.label}
		</span>
	);
}

export function TapesTable({ tapes, onDetails, onEdit }: TapesTableProps) {
	const columns = useMemo<ColumnDef<TapeItem>[]>(
		() => [
			{
				id: "tapeID",
				header: "Tape ID",
				size: 140,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate font-mono text-xs font-medium">
						{row.original.tapeID || "-"}
					</span>
				),
			},
			{
				id: "location",
				header: "Location",
				size: 190,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{locationLabel(row.original.location)}
					</span>
				),
			},
			{
				id: "period",
				header: "Period",
				size: 170,
				grow: true,
				cell: ({ row }) => {
					const { month, year, sequenceNum } = row.original;
					if (!month && !year) {
						return <span className="text-muted-foreground">-</span>;
					}
					return (
						<span className="block min-w-0 truncate">
							{[month, year].filter(Boolean).join(" ")}
							{sequenceNum ? ` · #${sequenceNum}` : ""}
						</span>
					);
				},
			},
			{
				id: "status",
				header: "Status",
				size: 110,
				cell: ({ row }) => <StatusCell tape={row.original} />,
			},
			{
				id: "lastWritten",
				header: "Last Written",
				size: 180,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{formatTapeDateTime(row.original.lastWritten)}
					</span>
				),
			},
			{
				id: "expire",
				header: "Expires On",
				size: 180,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{formatTapeDateTime(row.original.expire)}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				size: 88,
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
						<Button
							variant="ghost"
							size="icon-sm"
							title="Edit"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(row.original);
							}}
						>
							<Pencil />
						</Button>
					</div>
				),
			},
		],
		[onDetails, onEdit],
	);

	const table = useReactTable({
		data: tapes,
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
			<table className="w-full min-w-[880px] caption-bottom text-xs">
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
