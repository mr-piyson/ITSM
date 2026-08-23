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
import { Boxes, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { itemImageUrl, stockBadgeClass } from "@/lib/stock-constants";
import { cn } from "@/lib/utils";
import type { StockItem } from "@/server/routers/stock";

type StockTableProps = {
	items: StockItem[];
	onDetails: (item: StockItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function StockTable({ items, onDetails }: StockTableProps) {
	const columns = useMemo<ColumnDef<StockItem>[]>(
		() => [
			{
				id: "image",
				header: "Image",
				size: 72,
				cell: ({ row }) => {
					const imageUrl = itemImageUrl(row.original.img);
					if (!imageUrl) {
						return (
							<div className="flex size-9 shrink-0 items-center justify-center border bg-muted text-muted-foreground">
								<Boxes className="size-4" />
							</div>
						);
					}
					return (
						<img
							src={imageUrl}
							alt={row.original.name}
							className="size-9 shrink-0 border bg-background object-contain"
							loading="lazy"
						/>
					);
				},
			},
			{
				id: "name",
				header: "Name",
				size: 240,
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="truncate font-medium">{row.original.name || "-"}</p>
						<p className="truncate text-[10px] text-muted-foreground">
							{row.original.brand || "-"}
						</p>
					</div>
				),
			},
			{
				accessorKey: "category",
				header: "Category",
				size: 190,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate text-muted-foreground">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "stock",
				header: "Stock",
				size: 90,
				cell: ({ getValue }) => {
					const stock = Number(getValue() ?? 0);
					return (
						<span
							className={cn(
								"inline-flex min-w-9 justify-center px-1.5 py-px text-xs font-medium",
								stockBadgeClass(stock),
							)}
						>
							{stock}
						</span>
					);
				},
			},
			{
				accessorKey: "purchased",
				header: "Purchased",
				size: 110,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate tabular-nums">
						{Number(getValue() ?? 0)}
					</span>
				),
			},
			{
				accessorKey: "provided",
				header: "Provided",
				size: 110,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate tabular-nums">
						{Number(getValue() ?? 0)}
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
		data: items,
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
			<table className="w-full min-w-[880px] caption-bottom text-xs">
				<TableHeader className="sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="flex w-full bg-muted hover:bg-muted"
							style={{ alignItems: "center" }}
						>
							{headerGroup.headers.map((header, index) => (
								<TableHead
									key={header.id}
									className="flex items-center overflow-hidden border-r px-2 text-xs font-semibold last:border-r-0"
									style={cellStyle(
										() => header.getSize(),
										index === headerGroup.headers.length - 1,
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
								{row.getVisibleCells().map((cell, index) => (
									<TableCell
										key={cell.id}
										className="flex items-center overflow-hidden border-r px-2 last:border-r-0"
										style={cellStyle(
											cell.column.getSize,
											index === row.getVisibleCells().length - 1,
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
