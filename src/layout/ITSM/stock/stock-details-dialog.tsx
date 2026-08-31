"use client";

import {
	Boxes,
	Loader2,
	Pencil,
	ShoppingCart,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
	formatStockDate,
	itemImageUrl,
	stockBadgeClass,
	stockStatusLabel,
} from "@/lib/stock-constants";
import { cn } from "@/lib/utils";
import type { StockItem } from "@/server/routers/ITSM/stock";
import { trpc } from "@/trpc/react";

type StockDetailsDialogProps = {
	item: StockItem | null;
	onOpenChange: (open: boolean) => void;
	onEdit: () => void;
	onDeleted: () => void;
};

function InfoRow({ label, value }: { label: string; value?: string | number }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-xs font-medium break-words">{value || "-"}</span>
		</div>
	);
}

export function StockDetailsDialog({
	item,
	onOpenChange,
	onEdit,
	onDeleted,
}: StockDetailsDialogProps) {
	const { data: history, isPending: historyPending } =
		trpc.stock.history.useQuery({ id: item?.id ?? 0 }, { enabled: !!item });
	const deleteMutation = trpc.stock.deactivate.useMutation();

	const handleDelete = async () => {
		if (!item) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: item.id });
			toast.success("Item deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete item",
			);
		}
	};

	const imageUrl = item ? itemImageUrl(item.img) : null;

	return (
		<Dialog open={item !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Item Details</DialogTitle>
					<DialogDescription className="truncate">
						{item?.name}
					</DialogDescription>
				</DialogHeader>

				{item && (
					<div className="space-y-4">
						{/* General */}
						<div className="flex items-start gap-4">
							{imageUrl ? (
								<img
									src={imageUrl}
									alt={item.name}
									className="size-24 shrink-0 border bg-background object-contain"
								/>
							) : (
								<div className="flex size-24 shrink-0 items-center justify-center border bg-muted text-muted-foreground">
									<Boxes className="size-6" />
								</div>
							)}
							<div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
								<InfoRow label="Name" value={item.name} />
								<InfoRow label="Brand" value={item.brand} />
								<InfoRow label="Category" value={item.category} />
								<div className="flex flex-col gap-0.5">
									<span className="text-xs text-muted-foreground">Stock</span>
									<span
										className={cn(
											"inline-flex w-fit px-1.5 py-px text-xs font-medium",
											stockBadgeClass(item.stock),
										)}
									>
										{item.stock} · {stockStatusLabel(item.stock)}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						{/* Totals */}
						<div className="grid grid-cols-2 gap-3 text-center">
							<div className="border px-3 py-2">
								<p className="text-lg font-semibold tabular-nums">
									{item.purchased}
								</p>
								<p className="text-[10px] text-muted-foreground uppercase tracking-wide">
									Purchased (qty)
								</p>
							</div>
							<div className="border px-3 py-2">
								<p className="text-lg font-semibold tabular-nums">
									{item.provided}
								</p>
								<p className="text-[10px] text-muted-foreground uppercase tracking-wide">
									Provided (qty)
								</p>
							</div>
						</div>

						<Separator />

						{/* History */}
						{historyPending ? (
							<div className="flex h-16 items-center justify-center">
								<Loader2 className="size-5 animate-spin text-muted-foreground" />
							</div>
						) : history ? (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center gap-1.5">
										<ShoppingCart className="size-3.5 text-muted-foreground" />
										<p className="text-xs font-semibold text-muted-foreground">
											Purchases ({history.purchases.length})
										</p>
									</div>
									{history.purchases.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											No purchases recorded.
										</p>
									) : (
										<ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
											{history.purchases.map((purchase) => (
												<li
													key={purchase.id}
													className="flex items-baseline justify-between gap-3 border px-2.5 py-1.5"
												>
													<span className="min-w-0">
														<span className="block truncate text-xs font-medium">
															PO #{purchase.poNumber} · {purchase.vendorName}
														</span>
														<span className="block truncate text-[10px] text-muted-foreground">
															{formatStockDate(purchase.date)}
															{purchase.price ? ` · ${purchase.price}` : ""}
														</span>
													</span>
													<span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums">
														+{purchase.quantity}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-1.5">
										<User className="size-3.5 text-muted-foreground" />
										<p className="text-xs font-semibold text-muted-foreground">
											Provides ({history.provides.length})
										</p>
									</div>
									{history.provides.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											No provides recorded.
										</p>
									) : (
										<ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
											{history.provides.map((provide) => (
												<li
													key={provide.id}
													className="flex items-baseline justify-between gap-3 border px-2.5 py-1.5"
												>
													<span className="min-w-0">
														<span className="block truncate text-xs font-medium">
															{provide.employeeName || "-"}
														</span>
														<span className="block truncate text-[10px] text-muted-foreground">
															EmpID {provide.empID} ·{" "}
															{formatStockDate(provide.date)}
														</span>
													</span>
													<span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums">
														-{provide.quantity}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						) : null}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onEdit} disabled={!item}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button
									variant="destructive"
									disabled={!item || deleteMutation.isPending}
								/>
							}
						>
							{deleteMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Trash2 data-icon="inline-start" />
							)}
							Delete
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete this item?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove <strong>{item?.name}</strong> from the active
									stock list. Existing purchase and provide records are kept,
									and the action is written to the change logs.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction variant="destructive" onClick={handleDelete}>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
