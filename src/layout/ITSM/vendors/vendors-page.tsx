"use client";

import { Plus, Search, Store } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Vendor } from "@/server/routers/ITSM/vendors";
import { trpc } from "@/trpc/react";

import { VendorDetailsDialog } from "./vendor-details-dialog";
import { VendorFormDialog } from "./vendor-form-dialog";
import { VendorsCardList } from "./vendors-card-list";
import { VendorsGrid } from "./vendors-grid";

function VendorsGridSkeleton() {
	return (
		<div className="min-h-0 flex-1 rounded-none border p-3">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, index) => (
					<div
						key={index}
						className="flex h-[184px] flex-col rounded-none border bg-card p-3"
					>
						<div className="flex items-start gap-3">
							<Skeleton className="h-12 w-20 shrink-0" />
							<Skeleton className="h-4 w-2/3 flex-1" />
						</div>
						<Skeleton className="mt-3 h-3 w-full" />
						<Skeleton className="mt-2 h-3 w-3/4" />
						<div className="mt-auto flex items-center justify-between border-t pt-1.5">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="size-7" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function VendorsListSkeleton() {
	return (
		<div className="divide-y rounded-none border">
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} className="flex items-center gap-3 p-3">
					<Skeleton className="size-10 shrink-0" />
					<div className="min-w-0 flex-1 space-y-1.5">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="size-4 shrink-0" />
				</div>
			))}
		</div>
	);
}

export function VendorsPage() {
	const utils = trpc.useUtils();
	const isMobile = useIsMobile();
	const { data: vendors = [], isPending } = trpc.vendors.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [vendorID, setVendorID] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

	const detailsVendor = useMemo(
		() => vendors.find((vendor) => String(vendor.id) === vendorID) ?? null,
		[vendors, vendorID],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return vendors;
		}
		return vendors.filter((vendor) =>
			[vendor.name, vendor.notes].some((part) =>
				part.toLowerCase().includes(q),
			),
		);
	}, [vendors, query]);

	const isFiltering = query.trim().length > 0;

	const openAdd = () => {
		setEditingVendor(null);
		setFormOpen(true);
	};

	const openEdit = (vendor: Vendor) => {
		setEditingVendor(vendor);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingVendor(null);
		utils.vendors.list.invalidate();
	};

	const closeDetails = () => setVendorID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		utils.vendors.list.invalidate();
		utils.purchases.vendors.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="min-w-0">
						<h1 className="text-xl font-semibold tracking-tight">Vendors</h1>
						<p className="text-xs text-muted-foreground">
							{isPending
								? "Loading vendors…"
								: isFiltering
									? `Showing ${filtered.length} of ${vendors.length} vendors`
									: `${vendors.length} vendor${vendors.length === 1 ? "" : "s"}`}
						</p>
					</div>
					<Button onClick={openAdd} className="w-full sm:w-auto">
						<Plus data-icon="inline-start" />
						Add Vendor
					</Button>
				</div>

				<div className="relative w-full sm:max-w-sm">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search by name or notes…"
						className="pl-8"
					/>
				</div>
			</div>

			{isPending ? (
				isMobile ? (
					<VendorsListSkeleton />
				) : (
					<VendorsGridSkeleton />
				)
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Store />
						</EmptyMedia>
						<EmptyTitle>
							{vendors.length === 0 ? "No vendors yet" : "No vendors found"}
						</EmptyTitle>
						<EmptyDescription>
							{vendors.length === 0
								? "Add your first vendor to start tracking purchases."
								: "Try adjusting your search."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{vendors.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first vendor
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : isMobile ? (
				<VendorsCardList
					vendors={filtered}
					onDetails={(vendor) => setVendorID(String(vendor.id))}
				/>
			) : (
				<VendorsGrid
					vendors={filtered}
					onDetails={(vendor) => setVendorID(String(vendor.id))}
					onEdit={openEdit}
				/>
			)}

			<VendorFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				vendor={editingVendor}
				onSuccess={handleFormSuccess}
			/>

			<VendorDetailsDialog
				vendor={detailsVendor}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
				onEdit={() => {
					if (detailsVendor) {
						closeDetails();
						openEdit(detailsVendor);
					}
				}}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
