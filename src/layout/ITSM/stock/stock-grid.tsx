"use client";

import { Boxes } from "lucide-react";

import {
	itemImageUrl,
	stockBadgeClass,
	stockStatusLabel,
} from "@/lib/stock-constants";
import { cn } from "@/lib/utils";
import type { StockItem } from "@/server/routers/ITSM/stock";

type StockGridProps = {
	items: StockItem[];
	onDetails: (item: StockItem) => void;
};

export function StockGrid({ items, onDetails }: StockGridProps) {
	return (
		<div className="min-h-0 flex-1 overflow-auto rounded-none border bg-background">
			<div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5">
				{items.map((item) => {
					const imageUrl = itemImageUrl(item.img);
					return (
						<button
							type="button"
							key={item.id}
							onClick={() => onDetails(item)}
							className="group flex flex-col overflow-hidden border bg-background text-left transition-colors hover:border-primary/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							{imageUrl ? (
								<div className="flex aspect-[4/3] items-center justify-center border-b bg-muted p-2">
									<img
										src={imageUrl}
										alt={item.name}
										loading="lazy"
										className="size-full object-contain"
									/>
								</div>
							) : (
								<div className="flex aspect-[4/3] items-center justify-center border-b bg-muted text-muted-foreground">
									<Boxes className="size-8 opacity-60" />
								</div>
							)}

							<div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
								<p className="truncate text-sm font-semibold">
									{item.name || "-"}
								</p>
								{item.brand && (
									<p className="truncate text-xs text-muted-foreground">
										{item.brand}
									</p>
								)}
								<p className="truncate text-xs text-muted-foreground">
									{item.category || "-"}
								</p>
							</div>

							<div className="flex items-center justify-between gap-3 border-t px-3 py-2">
								<span
									className={cn(
										"inline-flex items-center gap-1 px-1.5 py-px text-xs font-medium",
										stockBadgeClass(item.stock),
									)}
								>
									<span className="tabular-nums">{item.stock}</span>
									<span className="hidden sm:inline">
										· {stockStatusLabel(item.stock)}
									</span>
								</span>
								<div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
									<span>+{item.purchased}</span>
									<span aria-hidden="true">/</span>
									<span>-{item.provided}</span>
								</div>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
