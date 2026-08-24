"use client";

import { Loader2, Plus, Search, Store } from "lucide-react";
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
import type { Vendor } from "@/server/routers/vendors";
import { trpc } from "@/trpc/react";

import { VendorDetailsDialog } from "./vendor-details-dialog";
import { VendorFormDialog } from "./vendor-form-dialog";
import { VendorsGrid } from "./vendors-grid";

export function VendorsPage() {
	const utils = trpc.useUtils();
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
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Vendors</h1>
						<p className="text-xs text-muted-foreground">
							Vendors ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={openAdd}>
						<Plus data-icon="inline-start" />
						Add Vendor
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
							placeholder="Search by name or notes…"
							className="h-9 pl-8"
						/>
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
