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
import {
	BadgeCheck,
	ExternalLink,
	Pencil,
	RadioTower,
	RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { assetImageUrl, assetTypeBadge } from "@/lib/assets-constants";
import { usePing, type PingTarget } from "@/lib/use-ping";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/ITSM/assets";

import { ServerPingBadge } from "../server/server-ping-badge";

type AssetsTableProps = {
	assets: AssetItem[];
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

export function AssetsTable({ assets, onDetails, onEdit }: AssetsTableProps) {
	const { get, ping, pingMany } = usePing("assets");

	const targets = useMemo<PingTarget[]>(() => {
		const list: PingTarget[] = [];
		for (const asset of assets) {
			const ip = asset.ip?.trim();
			if (ip) {
				list.push({ id: `asset:${asset.id}`, host: ip });
			}
		}
		return list;
	}, [assets]);

	const offlineCount = targets.filter((target) => {
		const state = get(target.id);
		return state && !state.loading && state.status === "inactive";
	}).length;

	const columns = useMemo<ColumnDef<AssetItem>[]>(
		() => [
			{
				accessorKey: "image",
				header: "Image",
				size: 72,
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
				size: 110,
				cell: ({ getValue }) => (
					<span className="font-medium">{String(getValue())}</span>
				),
			},
			{
				accessorKey: "serialNumber",
				header: "Serial Number",
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "deviceName",
				header: "Device Name",
				size: 200,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "type",
				header: "Type",
				size: 140,
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
				size: 150,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "verified",
				header: "Verified",
				size: 50,
				cell: ({ row }) =>
					row.original.verified ? (
						<BadgeCheck className="size-4 text-green-600" />
					) : null,
			},
			{
				id: "connectivity",
				header: "Connectivity",
				size: 130,
				cell: ({ row }) => {
					const ip = row.original.ip?.trim();
					return ip ? (
						<ServerPingBadge state={get(`asset:${row.original.id}`)} />
					) : (
						<span className="text-xs text-muted-foreground">—</span>
					);
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const ip = row.original.ip?.trim();
					const targetId = `asset:${row.original.id}`;
					return (
						<div className="flex items-center gap-1">
							{ip && (
								<Button
									variant="ghost"
									size="icon-sm"
									title="Ping"
									disabled={get(targetId)?.loading}
									onClick={() => ping({ id: targetId, host: ip })}
								>
									<RefreshCw
										className={cn(get(targetId)?.loading && "animate-spin")}
									/>
								</Button>
							)}
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
					);
				},
			},
		],
		[onDetails, onEdit, get, ping],
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
		<div className="flex min-h-0 flex-1 flex-col rounded-none border">
			<div className="flex items-center justify-between gap-2 border-b px-3 py-2">
				<span className="text-xs text-muted-foreground">
					{assets.length} asset{assets.length === 1 ? "" : "s"}
					{offlineCount > 0 && (
						<span className="text-red-700 dark:text-red-400">
							{" "}
							· {offlineCount} offline
						</span>
					)}
				</span>
				<Button size="sm" variant="outline" onClick={() => pingMany(targets)}>
					<RadioTower />
					Ping all
				</Button>
			</div>
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
									className="flex"
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})}
					</TableBody>
				</table>
			</div>
		</div>
	);
}
