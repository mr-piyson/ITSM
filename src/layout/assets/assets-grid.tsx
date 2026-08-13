"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { BadgeCheck, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { assetImageUrl, assetTypeBadge } from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/assets";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 220;

type AssetsGridProps = {
	assets: AssetItem[];
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
};

export function AssetsGrid({ assets, onDetails, onEdit }: AssetsGridProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);

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
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border p-3"
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
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function AssetCard({
	asset,
	onDetails,
	onEdit,
}: {
	asset: AssetItem;
	onDetails: (asset: AssetItem) => void;
	onEdit: (asset: AssetItem) => void;
}) {
	const imageUrl = assetImageUrl(asset.image);

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

			<div className="mt-auto flex flex-wrap items-center gap-1">
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
			</div>

			<div className="mt-2 flex justify-end gap-1 border-t pt-1.5">
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
