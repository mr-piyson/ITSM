"use client";

import { LayoutGrid, Loader2, Plus, Search, Table2 } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ASSET_TYPES } from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/ITSM/assets";
import { trpc } from "@/trpc/react";

import { AssetDetailsDialog } from "./asset-details-dialog";
import { AssetFormDialog } from "./asset-form";
import { AssetsGrid } from "./assets-grid";
import { AssetsTable } from "./assets-table";

const VIEW_VALUES = ["table", "grid"] as const;

const SEARCH_FIELD_VALUES = [
	"all",
	"code",
	"serialNumber",
	"deviceName",
	"manufacturer",
	"model",
	"owner",
	"location",
	"department",
	"type",
] as const;

type SearchField = (typeof SEARCH_FIELD_VALUES)[number];

const TYPE_VALUES = ["All", ...ASSET_TYPES] as const;

const SEARCH_FIELDS: {
	value: SearchField;
	label: string;
	placeholder: string;
}[] = [
	{ value: "all", label: "All fields", placeholder: "Search all fields…" },
	{ value: "code", label: "Code", placeholder: "Search by code…" },
	{
		value: "serialNumber",
		label: "Serial Number",
		placeholder: "Search by serial number…",
	},
	{
		value: "deviceName",
		label: "Device Name",
		placeholder: "Search by device name…",
	},
	{
		value: "manufacturer",
		label: "Manufacturer",
		placeholder: "Search by manufacturer…",
	},
	{ value: "model", label: "Model", placeholder: "Search by model…" },
	{ value: "owner", label: "Owner", placeholder: "Search by owner…" },
	{ value: "location", label: "Location", placeholder: "Search by location…" },
	{
		value: "department",
		label: "Department",
		placeholder: "Search by department…",
	},
	{ value: "type", label: "Type", placeholder: "Search by type…" },
];

export function AssetsPage() {
	const utils = trpc.useUtils();
	const { data: assets = [], isPending } = trpc.assets.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [searchField, setSearchField] = useQueryState(
		"field",
		parseAsStringEnum([...SEARCH_FIELD_VALUES])
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [typeFilter, setTypeFilter] = useQueryState(
		"type",
		parseAsStringEnum([...TYPE_VALUES])
			.withDefault("All")
			.withOptions({ history: "replace" }),
	);
	const [view, setView] = useQueryState(
		"view",
		parseAsStringEnum([...VIEW_VALUES])
			.withDefault("grid")
			.withOptions({ history: "replace" }),
	);
	const [assetCode, setAssetCode] = useQueryState("asset", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

	const detailsAsset = useMemo(
		() => assets.find((a) => a.code === assetCode) ?? null,
		[assets, assetCode],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return assets.filter((asset) => {
			if (typeFilter !== "All" && asset.type !== typeFilter) {
				return false;
			}
			if (!q) {
				return true;
			}
			const value =
				searchField === "all"
					? [
							asset.deviceName,
							asset.manufacturer,
							asset.code,
							asset.serialNumber,
							asset.owner,
							asset.model,
							asset.location,
							asset.department,
							asset.type,
						]
							.filter(Boolean)
							.join(" ")
					: (asset[searchField] ?? "");
			return value.toLowerCase().includes(q);
		});
	}, [assets, query, typeFilter, searchField]);

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

	const closeDetails = () => setAssetCode(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		utils.assets.list.invalidate();
		utils.assets.byId.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
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
						<Button onClick={openAdd} size="default">
							<Plus data-icon="inline-start" />
							Add Asset
						</Button>
					</div>
				</div>

				<div className="flex min-w-0 flex-col gap-3">
					<div className="flex w-full max-w-lg items-stretch overflow-hidden rounded-none border bg-background transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
						<Select
							value={searchField}
							onValueChange={(value) =>
								setSearchField((value ?? "all") as SearchField)
							}
						>
							<SelectTrigger className="h-full w-fit rounded-none border-0 bg-transparent px-2.5 focus-visible:ring-0">
								<SelectValue>
									{(value) =>
										SEARCH_FIELDS.find((f) => f.value === value)?.label ??
										"All fields"
									}
								</SelectValue>
							</SelectTrigger>
							<SelectContent align="start" alignItemWithTrigger={false}>
								{SEARCH_FIELDS.map((field) => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="my-1.5 w-px shrink-0 bg-border" />
						<div className="relative flex-1">
							<Search
								data-icon="inline-start"
								className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={
									SEARCH_FIELDS.find((f) => f.value === searchField)
										?.placeholder ?? "Search…"
								}
								className="h-full border-0 pl-8 shadow-none focus-visible:ring-0"
							/>
						</div>
					</div>

					<div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1">
						{([...TYPE_VALUES] as const).map((type) => (
							<button
								key={type}
								onClick={() => setTypeFilter(type)}
								className={cn(
									"shrink-0 rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap transition-colors",
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
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
					<p className="text-sm text-muted-foreground">No assets found</p>
					<Button variant="outline" size="sm" onClick={openAdd}>
						<Plus data-icon="inline-start" />
						Add the first asset
					</Button>
				</div>
			) : view === "table" ? (
				<AssetsTable
					assets={filtered}
					onDetails={(asset) => setAssetCode(asset.code)}
					onEdit={openEdit}
				/>
			) : (
				<AssetsGrid
					assets={filtered}
					onDetails={(asset) => setAssetCode(asset.code)}
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
				onOpenChange={(asset) =>
					setAssetCode(asset?.code ?? null, { history: "replace" })
				}
				onEdit={() => {
					if (detailsAsset) {
						closeDetails();
						setEditingAsset(detailsAsset);
						setFormOpen(true);
					}
				}}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
