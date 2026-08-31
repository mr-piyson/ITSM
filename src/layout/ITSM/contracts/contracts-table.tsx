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
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDateLabel } from "@/lib/contract-constants";
import type { Contract } from "@/server/routers/ITSM/contracts";
import { StatusBadge } from "./status-badge";

type ContractsTableProps = {
	contracts: Contract[];
	onDetails: (contract: Contract) => void;
	onEdit: (contract: Contract) => void;
	onDelete: (contract: Contract) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function ContractsTable({
	contracts,
	onDetails,
	onEdit,
	onDelete,
}: ContractsTableProps) {
	const columns = useMemo<ColumnDef<Contract>[]>(
		() => [
			{
				id: "product",
				header: "Product / Service",
				size: 260,
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="truncate font-medium">{row.original.productName}</p>
						{row.original.account && (
							<p className="truncate text-[10px] text-muted-foreground">
								{row.original.account}
							</p>
						)}
					</div>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				size: 200,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate">
						{row.original.vendorName || "-"}
					</span>
				),
			},
			{
				id: "endDate",
				header: "End Date",
				size: 190,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<span className="whitespace-nowrap">
							{formatDateLabel(row.original.endDate)}
						</span>
						<StatusBadge endDate={row.original.endDate} />
					</div>
				),
			},
			{
				id: "cost",
				header: "Cost",
				size: 130,
				cell: ({ row }) => (
					<span className="whitespace-nowrap font-semibold">
						{row.original.cost}{" "}
						<span className="text-[10px] font-normal text-muted-foreground">
							{row.original.currency}
						</span>
					</span>
				),
			},
			{
				id: "cycle",
				header: "Billing",
				size: 110,
				cell: ({ row }) => (
					<Badge variant="secondary" className="capitalize">
						{row.original.bilingCycle}
					</Badge>
				),
			},
			{
				id: "docs",
				header: "",
				size: 48,
				cell: ({ row }) =>
					row.original.docslink ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Open documents"
							onClick={(e) => {
								e.stopPropagation();
								window.open(
									row.original.docslink ?? "",
									"_blank",
									"noreferrer",
								);
							}}
						>
							<ExternalLink />
						</Button>
					) : (
						<span className="text-muted-foreground">-</span>
					),
			},
			{
				id: "actions",
				header: "",
				size: 44,
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									size="icon-sm"
									title="Actions"
									onClick={(e) => e.stopPropagation()}
								/>
							}
						>
							<MoreHorizontal />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							onClick={(e) => e.stopPropagation()}
						>
							<DropdownMenuItem onClick={() => onEdit(row.original)}>
								<Pencil />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => onDelete(row.original)}
							>
								<Trash2 />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[onDetails, onEdit, onDelete],
	);

	const table = useReactTable({
		data: contracts,
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
			<table className="w-full min-w-[900px] caption-bottom text-xs">
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
									className="flex items-center overflow-hidden border-r px-3 text-xs font-semibold last:border-r-0"
									style={cellStyle(
										() => header.getSize(),
										header.column.id === "product",
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
										className="flex items-center overflow-hidden border-r px-3 last:border-r-0"
										style={cellStyle(
											cell.column.getSize,
											cell.column.id === "product",
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
