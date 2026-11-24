"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import {
	BadgeCheck,
	ExternalLink,
	Pencil,
	RadioTower,
	RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { assetImageUrl, assetTypeBadge } from "@/lib/assets-constants";
import { usePing, type PingState, type PingTarget } from "@/lib/use-ping";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/ITSM/assets";

import { ServerPingBadge } from "../server/server-ping-badge";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

type AssetsGridProps = {
	assets: AssetItem[];
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
};

export function AssetsGrid({ assets, onDetails, onEdit }: AssetsGridProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);
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

	useEffect(() => {
		const el = parentRef.current;
		if (!el) {
			return;
		}
		const update = () => {
			setColumns(Math.max(1, Math.floor(el.clientWidth / CARD_WIDTH)));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const rowCount = Math.ceil(assets.length / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => CARD_HEIGHT,
		overscan: 4,
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
				className="min-h-0 flex-1 overflow-auto rounded-none border p-3"
			>
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const start = virtualRow.index * columns;
						const rowItems = assets.slice(start, start + columns);
						return (
							<div
								key={virtualRow.key}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<div
									className="grid gap-3"
									style={{
										gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
									}}
								>
									{rowItems.map((asset) => (
										<AssetCard
											key={asset.id}
											asset={asset}
											onDetails={onDetails}
											onEdit={onEdit}
											pingState={get(`asset:${asset.id}`)}
											onPing={() =>
												ping({
													id: `asset:${asset.id}`,
													host: asset.ip!.trim(),
												})
											}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function AssetCard({
	asset,
	onDetails,
	onEdit,
	pingState,
	onPing,
}: {
	asset: AssetItem;
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
	pingState?: PingState;
	onPing: () => void;
}) {
	const imageUrl = assetImageUrl(asset.image);
	const ip = asset.ip?.trim();

	return (
		<div className="flex h-[200px] flex-col rounded-none border bg-card p-3">
			<div className="flex items-start gap-3">
				{imageUrl && (
					<img
						src={imageUrl}
						alt={asset.code}
						className="h-14 w-20 shrink-0 object-contain"
					/>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{asset.code}</p>
					<p className="truncate text-xs text-muted-foreground">
						{asset.deviceName ?? "-"}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{asset.serialNumber}
					</p>
				</div>
			</div>

			<p className="mt-1 truncate text-xs text-muted-foreground">
				Owner: {asset.owner ?? "-"}
			</p>

			<div className="mt-2 flex flex-wrap items-center gap-1">
				<span
					className={cn(
						"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
						assetTypeBadge(asset.type),
					)}
				>
					{asset.type ?? "-"}
				</span>
				{asset.location && (
					<span className="inline-flex whitespace-nowrap rounded-none bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
						{asset.location}
					</span>
				)}
				{asset.department && (
					<span className="inline-flex whitespace-nowrap rounded-none bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
						{asset.department}
					</span>
				)}
				{asset.verified && <BadgeCheck className="size-4 text-green-600" />}
				{ip && <ServerPingBadge state={pingState} className="ml-auto" />}
			</div>

			<div className="mt-auto flex justify-end gap-1 border-t pt-1.5">
				{ip && (
					<Button
						variant="ghost"
						size="icon-sm"
						title="Ping"
						disabled={pingState?.loading}
						onClick={onPing}
					>
						<RefreshCw className={cn(pingState?.loading && "animate-spin")} />
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(asset)}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(asset)}
				>
					<Pencil />
				</Button>
			</div>
		</div>
	);
}
