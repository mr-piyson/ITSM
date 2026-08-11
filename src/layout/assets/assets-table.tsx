"use client";

import { useMemo, useRef } from "react";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BadgeCheck, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { assetImageUrl, assetTypeBadge } from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/assets";

type AssetsTableProps = {
	assets: AssetItem[];
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
};

export function AssetsTable({ assets, onDetails, onEdit }: AssetsTableProps) {
	const columns = useMemo<ColumnDef<AssetItem>[]>(
		() => [
			{
				accessorKey: "image",
				header: "Image",
				cell: ({ row }) => {
					const url = assetImageUrl(row.original.image);
					return url ? (
						<img
							src={url}
							alt={row.original.code}
							className="h-10 w-14 object-cover"
						/>
					) : (
						<span className="text-muted-foreground">-</span>
					);
				},
			},
			{
				accessorKey: "code",
				header: "Code",
				cell: ({ getValue }) => (
					<span className="font-medium">{String(getValue())}</span>
				),
			},
			{
				accessorKey: "serialNumber",
				header: "Serial Number",
				cell: ({ getValue }) => (
					<span className="block max-w-40 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "deviceName",
				header: "Device Name",
				cell: ({ getValue }) => (
					<span className="block max-w-52 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ getValue }) => {
					const type = String(getValue() ?? "");
					return (
						<span
							className={cn(
								"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
								assetTypeBadge(type),
							)}
						>
							{type || "-"}
						</span>
					);
				},
			},
			{
				accessorKey: "owner",
				header: "Owner",
				cell: ({ getValue }) => (
					<span className="block max-w-40 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "verified",
				header: "Verified",
				cell: ({ row }) =>
					row.original.verified ? (
						<BadgeCheck className="size-4 text-green-600" />
					) : null,
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							title="Details"
							onClick={() => onDetails(row.original)}
						>
							<ExternalLink />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							title="Edit"
							onClick={() => onEdit(row.original)}
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
		data: assets,
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
			className="max-h-[65vh] overflow-auto rounded-none border"
		>
			<Table>
				<TableHeader className="sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="bg-muted/50 hover:bg-muted/50"
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="h-9 text-xs font-semibold"
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
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const row = rows[virtualRow.index];
						return (
							<TableRow
								key={row.id}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									height: `${virtualRow.size}px`,
								}}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
