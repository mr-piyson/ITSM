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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { employeeImageUrl } from "@/lib/employees-constants";
import { formatProvideDate } from "@/lib/provide-constants";
import type { ProvideItem } from "@/server/routers/provide";

type ProvideTableProps = {
	provides: ProvideItem[];
	onDetails: (provide: ProvideItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

function itemsSummary(provide: ProvideItem): string {
	return provide.items
		.map(
			(item) =>
				`${item.itemName}${item.itemBrand ? ` (${item.itemBrand})` : ""} ×${item.quantity}`,
		)
		.join(", ");
}

export function ProvideTable({ provides, onDetails }: ProvideTableProps) {
	const columns = useMemo<ColumnDef<ProvideItem>[]>(
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
				id: "items",
				header: "Items",
				size: 260,
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="block min-w-0 truncate">
							{itemsSummary(row.original) || "-"}
						</p>
						<p className="text-[10px] text-muted-foreground">
							{row.original.items.length} item
							{row.original.items.length === 1 ? "" : "s"}
						</p>
					</div>
				),
			},
			{
				id: "date",
				header: "Date",
				size: 120,
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-muted-foreground">
						{formatProvideDate(row.original.date)}
					</span>
				),
			},
			{
				accessorKey: "requestedByName",
				header: "Requested By",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "receivedByName",
				header: "Received By",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "provideBy",
				header: "Provided By",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "notes",
				header: "Notes",
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
				size: 44,
				cell: ({ row }) => (
					<div className="flex items-center justify-end">
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
		data: provides,
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
