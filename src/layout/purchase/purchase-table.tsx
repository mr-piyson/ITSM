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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatPurchaseDate } from "@/lib/purchase-constants";
import type { Purchase } from "@/server/routers/purchases";

type PurchaseTableProps = {
	purchases: Purchase[];
	onDetails: (purchase: Purchase) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function PurchaseTable({ purchases, onDetails }: PurchaseTableProps) {
	const columns = useMemo<ColumnDef<Purchase>[]>(
		() => [
			{
				id: "poNumber",
				header: "PO #",
				size: 90,
				cell: ({ row }) => (
					<span className="font-mono font-medium">{row.original.poNumber}</span>
				),
			},
			{
				id: "type",
				header: "Type",
				size: 100,
				cell: ({ row }) =>
					row.original.serviceType ? (
						<Badge variant="secondary">Service</Badge>
					) : (
						<Badge variant="outline">Purchase</Badge>
					),
			},
			{
				id: "vendor",
				header: "Vendor",
				size: 220,
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="truncate font-medium">{row.original.vendorName}</p>
						<p className="truncate text-[10px] text-muted-foreground">
							{row.original.items.length > 0
								? `${row.original.items.length} item${row.original.items.length === 1 ? "" : "s"}`
								: `${row.original.services.length} service${row.original.services.length === 1 ? "" : "s"}`}
						</p>
					</div>
				),
			},
			{
				id: "total",
				header: "Grand Total",
				size: 140,
				cell: ({ row }) => (
					<span className="whitespace-nowrap font-semibold">
						{row.original.grandTotal || "-"}{" "}
						<span className="text-[10px] font-normal text-muted-foreground">
							{row.original.currency}
						</span>
					</span>
				),
			},
			{
				accessorKey: "buyer",
				header: "Buyer",
				size: 80,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				id: "quotationDate",
				header: "Quotation",
				size: 120,
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-muted-foreground">
						{formatPurchaseDate(row.original.quotationDate)}
					</span>
				),
			},
			{
				id: "paidDate",
				header: "Paid",
				size: 120,
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-muted-foreground">
						{row.original.paidDate
							? formatPurchaseDate(row.original.paidDate)
							: "-"}
					</span>
				),
			},
			{
				id: "flags",
				header: "Docs",
				size: 180,
				cell: ({ row }) => {
					const flags = [
						row.original.advanceRequest && "AR",
						row.original.LPO && "LPO",
						row.original.invoice && "INV",
						row.original.deliveryNote && "DN",
						row.original.mrn && "MRN",
					].filter((flag): flag is string => Boolean(flag));
					if (flags.length === 0) {
						return <span className="text-muted-foreground">-</span>;
					}
					return (
						<div className="flex flex-wrap gap-1">
							{flags.map((flag) => (
								<Badge
									key={flag}
									variant="secondary"
									className="px-1 text-[10px]"
								>
									{flag}
								</Badge>
							))}
						</div>
					);
				},
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
		data: purchases,
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
