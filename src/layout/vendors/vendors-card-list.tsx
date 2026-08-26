"use client";

import { ChevronRight, Store } from "lucide-react";

import { vendorImageUrl } from "@/lib/vendor-constants";
import type { Vendor } from "@/server/routers/vendors";

type VendorsCardListProps = {
	vendors: Vendor[];
	onDetails: (vendor: Vendor) => void;
};

export function VendorsCardList({ vendors, onDetails }: VendorsCardListProps) {
	return (
		<div className="flex-1 min-h-0 divide-y overflow-y-auto rounded-none border">
			{vendors.map((vendor) => {
				const imageUrl = vendorImageUrl(vendor.image);
				const firstContact = vendor.contacts[0];

				return (
					<button
						key={vendor.id}
						type="button"
						onClick={() => onDetails(vendor)}
						className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
					>
						{imageUrl ? (
							<img
								src={imageUrl}
								alt={vendor.name}
								className="size-10 shrink-0 border bg-background object-contain p-0.5"
							/>
						) : (
							<div className="flex size-10 shrink-0 items-center justify-center border bg-muted text-muted-foreground">
								<Store className="size-4" />
							</div>
						)}
						<div className="min-w-0 flex-1 space-y-0.5">
							<p className="truncate text-sm font-medium">{vendor.name}</p>
							<p className="truncate text-xs text-muted-foreground">
								{firstContact
									? [
											firstContact.contactName,
											firstContact.personPosition,
											firstContact.contact,
										]
											.filter(Boolean)
											.join(" · ")
									: vendor.notes || "No contacts"}
							</p>
						</div>
						<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
					</button>
				);
			})}
		</div>
	);
}
