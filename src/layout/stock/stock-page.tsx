"use client";

import { Boxes, Loader2, Plus, Search } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StockItem } from "@/server/routers/stock";
import { trpc } from "@/trpc/react";

import { StockDetailsDialog } from "./stock-details-dialog";
import { StockFormDialog } from "./stock-form-dialog";
import { StockTable } from "./stock-table";

const FILTER_VALUES = ["all", "in", "out"] as const;

type StockFilter = (typeof FILTER_VALUES)[number];

const FILTER_LABELS: Record<StockFilter, string> = {
	all: "All",
	in: "In Stock",
	out: "Out of Stock",
};

export function StockPage() {
	const utils = trpc.useUtils();
	const { data: items = [], isPending } = trpc.stock.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [filter, setFilter] = useQueryState(
		"filter",
		parseAsStringEnum([...FILTER_VALUES])
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [itemID, setItemID] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<StockItem | null>(null);

	const detailsItem = useMemo(
		() => items.find((item) => String(item.id) === itemID) ?? null,
		[items, itemID],
	);

	const counts = useMemo(
		() => ({
			all: items.length,
			in: items.filter((item) => item.stock > 0).length,
			out: items.filter((item) => item.stock === 0).length,
		}),
		[items],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return items.filter((item) => {
			if (filter === "in" && item.stock <= 0) {
				return false;
			}
			if (filter === "out" && item.stock !== 0) {
				return false;
			}
			if (!q) {
				return true;
			}
			return [item.name, item.brand, item.category].some((part) =>
				part.toLowerCase().includes(q),
			);
		});
	}, [items, query, filter]);

	const openAdd = () => {
		setEditingItem(null);
		setFormOpen(true);
	};

	const openEdit = (item: StockItem) => {
		setEditingItem(item);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingItem(null);
		utils.stock.list.invalidate();
		utils.stock.history.invalidate();
		utils.provides.list.invalidate();
		utils.purchases.list.invalidate();
	};

	const closeDetails = () => setItemID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		utils.stock.list.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Stock</h1>
						<p className="text-xs text-muted-foreground">
							Items ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={openAdd}>
						<Plus data-icon="inline-start" />
						Add Item
					</Button>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative w-full max-w-lg">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by name, brand, category…"
							className="h-9 pl-8"
						/>
					</div>
					<div className="flex items-center overflow-hidden rounded-none border">
						{FILTER_VALUES.map((value) => (
							<button
								key={value}
								type="button"
								onClick={() => setFilter(value)}
								className={cn(
									"flex h-8 items-center border-r px-3 text-xs transition-colors last:border-r-0",
									filter === value
										? "bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{FILTER_LABELS[value]} ({counts[value]})
							</button>
						))}
					</div>
				</div>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Boxes />
						</EmptyMedia>
						<EmptyTitle>
							{items.length === 0 ? "No stock items yet" : "No items found"}
						</EmptyTitle>
						<EmptyDescription>
							{items.length === 0
								? "Add your first item to start tracking stock."
								: "Try adjusting your search or filter."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{items.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first item
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<StockTable
					items={filtered}
					onDetails={(item) => setItemID(String(item.id))}
				/>
			)}

			<StockFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				item={editingItem}
				onSuccess={handleFormSuccess}
			/>

			<StockDetailsDialog
				item={detailsItem}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
				onEdit={() => {
					if (detailsItem) {
						closeDetails();
						openEdit(detailsItem);
					}
				}}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
