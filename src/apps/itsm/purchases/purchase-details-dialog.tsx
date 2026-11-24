"use client";

import { Copy, ExternalLink, Pencil, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatPurchaseDate } from "@/lib/purchase-constants";
import type { Purchase } from "@/server/routers/ITSM/purchases";

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3">
			<span className="text-xs font-semibold text-muted-foreground">
				{label}
			</span>
			<span className="min-w-0 truncate text-right text-sm">
				{value || "-"}
			</span>
		</div>
	);
}

export function PurchaseDetailsDialog({
	purchase,
	onOpenChange,
	onEdit,
	onDuplicate,
}: {
	purchase: Purchase | null;
	onOpenChange: (open: boolean) => void;
	onEdit: (purchase: Purchase) => void;
	onDuplicate: (purchase: Purchase) => void;
}) {
	const flags = purchase
		? [
				purchase.advanceRequest && "Advance Request",
				purchase.LPO && "LPO",
				purchase.invoice && "Invoice",
				purchase.deliveryNote && "Delivery Note",
				purchase.mrn && "MRN",
			].filter((flag): flag is string => Boolean(flag))
		: [];

	return (
		<Dialog open={purchase !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				{purchase && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<span className="font-mono">PO #{purchase.poNumber}</span>
								{purchase.serviceType ? (
									<Badge variant="secondary">Service</Badge>
								) : (
									<Badge variant="outline">Purchase</Badge>
								)}
							</DialogTitle>
							<DialogDescription>
								Created {formatPurchaseDate(purchase.createdAt)}
								{purchase.createdByName ? ` by ${purchase.createdByName}` : ""}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* General */}
							<div className="space-y-1.5">
								<p className="text-xs font-semibold text-muted-foreground">
									General information
								</p>
								<div className="space-y-1.5 rounded-md border p-3">
									<InfoRow label="Vendor" value={purchase.vendorName} />
									<InfoRow label="Buyer" value={purchase.buyer} />
									<InfoRow label="MRN Number" value={purchase.mrnNumber} />
									<InfoRow
										label="Quotation Date"
										value={formatPurchaseDate(purchase.quotationDate)}
									/>
									<InfoRow
										label="Paid Date"
										value={
											purchase.paidDate
												? formatPurchaseDate(purchase.paidDate)
												: ""
										}
									/>
								</div>
							</div>

							{/* Totals */}
							<div className="space-y-1.5">
								<p className="text-xs font-semibold text-muted-foreground">
									Totals ({purchase.currency})
								</p>
								<div className="grid grid-cols-3 gap-2">
									<div className="rounded-md border p-2 text-center">
										<p className="text-[10px] text-muted-foreground">Total</p>
										<p className="truncate text-sm font-medium">
											{purchase.currentTotal || "-"}
										</p>
									</div>
									<div className="rounded-md border p-2 text-center">
										<p className="text-[10px] text-muted-foreground">VAT</p>
										<p className="truncate text-sm font-medium">
											{purchase.vat || "-"}
										</p>
									</div>
									<div className="rounded-md border p-2 text-center">
										<p className="text-[10px] text-muted-foreground">
											Grand Total
										</p>
										<p className="truncate text-sm font-semibold">
											{purchase.grandTotal || "-"}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Lines */}
							{purchase.serviceType ? (
								<div className="space-y-2">
									<p className="text-xs font-semibold text-muted-foreground">
										Services ({purchase.services.length})
									</p>
									{purchase.services.length === 0 ? (
										<p className="text-sm text-muted-foreground">No services</p>
									) : (
										<ul className="space-y-1.5">
											{purchase.services.map((service) => (
												<li
													key={service.id}
													className="flex items-baseline justify-between gap-3 rounded-md border px-2.5 py-1.5"
												>
													<span className="min-w-0 truncate text-sm font-medium">
														{service.serviceName}
													</span>
													<span className="shrink-0 whitespace-nowrap text-sm font-semibold">
														{service.servicePrice} {purchase.currency}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							) : (
								<div className="space-y-2">
									<p className="text-xs font-semibold text-muted-foreground">
										Items ({purchase.items.length})
									</p>
									{purchase.items.length === 0 ? (
										<p className="text-sm text-muted-foreground">No items</p>
									) : (
										<ul className="space-y-1.5">
											{purchase.items.map((item) => (
												<li
													key={item.id}
													className="flex items-baseline justify-between gap-3 rounded-md border px-2.5 py-1.5"
												>
													<span className="min-w-0">
														<span className="block truncate text-sm font-medium">
															{item.itemName}
														</span>
														<span className="block truncate text-xs text-muted-foreground">
															{item.itemBrand || "-"}
														</span>
													</span>
													<span className="shrink-0 whitespace-nowrap text-sm font-semibold">
														× {item.quantity}
														<span className="ml-1 text-xs font-normal text-muted-foreground">
															@ {item.price}
														</span>
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							)}

							{/* Flags */}
							{flags.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{flags.map((flag) => (
										<Badge key={flag} variant="secondary">
											{flag}
										</Badge>
									))}
								</div>
							)}

							{(purchase.forWho || purchase.notes) && <Separator />}

							{purchase.forWho && (
								<div className="space-y-1">
									<p className="text-xs font-semibold text-muted-foreground">
										For Who
									</p>
									<p className="text-sm whitespace-pre-wrap">
										{purchase.forWho}
									</p>
								</div>
							)}

							{purchase.notes && (
								<div className="space-y-1">
									<p className="text-xs font-semibold text-muted-foreground">
										Notes
									</p>
									<p className="text-sm whitespace-pre-wrap">
										{purchase.notes}
									</p>
								</div>
							)}

							{purchase.link && (
								<a
									href={purchase.link}
									target="_blank"
									rel="noreferrer noopener"
									className="inline-flex items-center gap-1.5 text-sm break-all underline underline-offset-4 hover:text-muted-foreground"
								>
									<ExternalLink className="size-3.5 shrink-0" />
									{purchase.link}
								</a>
							)}

							<div className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
								<ShoppingCart className="size-3.5" />
								<span>Purchase record #{purchase.id}</span>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => onEdit(purchase)}>
								<Pencil data-icon="inline-start" />
								Edit
							</Button>
							<Button variant="outline" onClick={() => onDuplicate(purchase)}>
								<Copy data-icon="inline-start" />
								Duplicate
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
