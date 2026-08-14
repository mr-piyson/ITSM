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
import { printerImageUrl } from "@/lib/printer-constants";
import type { PrinterItem } from "@/server/routers/printers";

type PrintersTableProps = {
	printers: PrinterItem[];
	onDetails: (printer: PrinterItem) => void;
	onEdit: (printer: PrinterItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

function ImageCell({ img, name }: { img?: string | null; name: string }) {
	const imageUrl = printerImageUrl(img);
	return (
		<div className="flex items-center justify-center">
			{imageUrl ? (
				<img src={imageUrl} alt={name} className="h-10 w-14 object-contain" />
			) : (
				<div className="flex h-10 w-14 items-center justify-center bg-muted text-[10px] text-muted-foreground">
					No image
				</div>
			)}
		</div>
	);
}

export function PrintersTable({
	printers,
	onDetails,
	onEdit,
}: PrintersTableProps) {
	const columns = useMemo<ColumnDef<PrinterItem>[]>(
		() => [
			{
				id: "image",
				header: "Image",
				size: 90,
				cell: ({ row }) => (
					<ImageCell img={row.original.img} name={row.original.name} />
				),
			},
			{
				id: "name",
				header: "Name",
				size: 220,
				grow: true,
				cell: ({ row }) => (
					<span className="block min-w-0 truncate font-medium">
						{row.original.name || "-"}
					</span>
				),
			},
			{
				accessorKey: "location",
				header: "Location",
				size: 200,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "usedBy",
				header: "Used By",
				size: 200,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
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
		data: printers,
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
			<table className="w-full min-w-[820px] caption-bottom text-xs">
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
