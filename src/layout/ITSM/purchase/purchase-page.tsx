"use client";

import { Loader2, Plus, Search, ShoppingCart } from "lucide-react";
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
import type { Purchase } from "@/server/routers/ITSM/purchases";
import { trpc } from "@/trpc/react";

import { PurchaseDetailsDialog } from "./purchase-details-dialog";
import { PurchaseEditDialog } from "./purchase-edit-dialog";
import { PurchaseFormDialog } from "./purchase-form-dialog";
import { PurchaseTable } from "./purchase-table";

export function PurchasePage() {
	const utils = trpc.useUtils();
	const { data: purchases = [], isPending } = trpc.purchases.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [purchaseId, setPurchaseId] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [prefillPurchase, setPrefillPurchase] = useState<Purchase | null>(null);
	const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);

	const detailsPurchase = useMemo(
		() => purchases.find((p) => String(p.id) === purchaseId) ?? null,
		[purchases, purchaseId],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return purchases;
		}
		return purchases.filter((purchase) => {
			const parts = [
				String(purchase.poNumber),
				purchase.mrnNumber,
				purchase.vendorName,
				purchase.buyer,
				purchase.currency,
				purchase.grandTotal,
				purchase.forWho,
				purchase.notes,
				...purchase.items.map((item) => `${item.itemName} ${item.itemBrand}`),
				...purchase.services.map((service) => service.serviceName),
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [purchases, query]);

	const invalidate = () => utils.purchases.list.invalidate();

	const handleFormSuccess = () => {
		setFormOpen(false);
		setPrefillPurchase(null);
		invalidate();
	};

	const handleEditSuccess = () => {
		setEditPurchase(null);
		invalidate();
	};

	const closeDetails = () => setPurchaseId(null, { history: "replace" });

	const openDuplicate = (purchase: Purchase) => {
		closeDetails();
		setPrefillPurchase(purchase);
		setFormOpen(true);
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							Purchases / Services
						</h1>
						<p className="text-xs text-muted-foreground">
							Purchases ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={() => setFormOpen(true)}>
						<Plus data-icon="inline-start" />
						New Purchase
					</Button>
				</div>

				<div className="relative w-full max-w-lg">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search PO, vendor, item…"
						className="h-9 pl-8"
					/>
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
							<ShoppingCart />
						</EmptyMedia>
						<EmptyTitle>
							{purchases.length === 0
								? "No purchases yet"
								: "No purchases found"}
						</EmptyTitle>
						<EmptyDescription>
							{purchases.length === 0
								? "Register a purchase order or service PO to get started."
								: "Try adjusting your search."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{purchases.length === 0 && (
							<Button size="sm" onClick={() => setFormOpen(true)}>
								<Plus data-icon="inline-start" />
								Create the first purchase
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<PurchaseTable
					purchases={filtered}
					onDetails={(purchase) => setPurchaseId(String(purchase.id))}
				/>
			)}

			<PurchaseFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSuccess={handleFormSuccess}
				prefill={prefillPurchase}
			/>

			<PurchaseEditDialog
				purchase={editPurchase}
				onOpenChange={setEditPurchase}
				onSuccess={handleEditSuccess}
			/>

			<PurchaseDetailsDialog
				purchase={detailsPurchase}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
				onEdit={(purchase) => {
					closeDetails();
					setEditPurchase(purchase);
				}}
				onDuplicate={openDuplicate}
			/>
		</div>
	);
}
