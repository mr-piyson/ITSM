"use client";

import { LayoutGrid, Loader2, Plus, Search, Table2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSET_TYPES } from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/assets";
import { trpc } from "@/trpc/react";

import { AssetDetailsDialog } from "./asset-details-dialog";
import { AssetFormDialog } from "./asset-form";
import { AssetsGrid } from "./assets-grid";
import { AssetsTable } from "./assets-table";

type View = "table" | "grid";

export function AssetsPage() {
	const utils = trpc.useUtils();
	const { data: assets = [], isPending } = trpc.assets.list.useQuery();

	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("All");
	const [view, setView] = useState<View>("table");

	const [formOpen, setFormOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
	const [detailsAsset, setDetailsAsset] = useState<AssetItem | null>(null);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return assets.filter((asset) => {
			if (typeFilter !== "All" && asset.type !== typeFilter) {
				return false;
			}
			if (!q) {
				return true;
			}
			return [
				asset.deviceName,
				asset.manufacturer,
				asset.code,
				asset.serialNumber,
				asset.owner,
				asset.model,
				asset.location,
				asset.department,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(q);
		});
	}, [assets, query, typeFilter]);

	const openAdd = () => {
		setEditingAsset(null);
		setFormOpen(true);
	};

	const openEdit = (asset: AssetItem) => {
		setEditingAsset(asset);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingAsset(null);
		utils.assets.list.invalidate();
		utils.assets.byId.invalidate();
	};

	const handleDeleted = () => {
		setDetailsAsset(null);
		utils.assets.list.invalidate();
		utils.assets.byId.invalidate();
	};

	return (
		<div className="space-y-4 p-4 md:p-6">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Assets</h1>
						<p className="text-xs text-muted-foreground">
							Assets ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center overflow-hidden rounded-none border">
							<button
								type="button"
								onClick={() => setView("table")}
								title="Table view"
								className={cn(
									"flex size-8 items-center justify-center border-r transition-colors",
									view === "table"
										? "bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								<Table2 className="size-4" />
							</button>
							<button
								type="button"
								onClick={() => setView("grid")}
								title="Grid view"
								className={cn(
									"flex size-8 items-center justify-center transition-colors",
									view === "grid"
										? "bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								<LayoutGrid className="size-4" />
							</button>
						</div>
						<Button onClick={openAdd} size="sm">
							<Plus data-icon="inline-start" />
							Add Asset
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<div className="relative w-full max-w-md">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by code, name, serial, owner, model, location…"
							className="pl-8"
						/>
					</div>

					<div className="flex flex-wrap gap-1.5">
						{["All", ...ASSET_TYPES].map((type) => (
							<button
								key={type}
								onClick={() => setTypeFilter(type)}
								className={cn(
									"rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap transition-colors",
									typeFilter === type
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{type}
							</button>
						))}
					</div>
				</div>
			</div>

			{isPending ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
					<p className="text-sm text-muted-foreground">No assets found</p>
					<Button variant="outline" size="sm" onClick={openAdd}>
						<Plus data-icon="inline-start" />
						Add the first asset
					</Button>
				</div>
			) : view === "table" ? (
				<AssetsTable
					assets={filtered}
					onDetails={setDetailsAsset}
					onEdit={openEdit}
				/>
			) : (
				<AssetsGrid
					assets={filtered}
					onDetails={setDetailsAsset}
					onEdit={openEdit}
				/>
			)}

			<AssetFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				asset={editingAsset}
				onSuccess={handleFormSuccess}
			/>

			<AssetDetailsDialog
				asset={detailsAsset}
				onOpenChange={setDetailsAsset}
				onEdit={() => {
					if (detailsAsset) {
						setDetailsAsset(null);
						setEditingAsset(detailsAsset);
						setFormOpen(true);
					}
				}}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
