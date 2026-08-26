"use client";

import { Loader2, Pencil, Store, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResponsiveOverlay } from "@/layout/contracts/responsive-overlay";
import { vendorImageUrl } from "@/lib/vendor-constants";
import type { Vendor } from "@/server/routers/vendors";
import { trpc } from "@/trpc/react";

type VendorDetailsDialogProps = {
	vendor: Vendor | null;
	onOpenChange: (open: boolean) => void;
	onEdit: () => void;
	onDeleted: () => void;
};

export function VendorDetailsDialog({
	vendor,
	onOpenChange,
	onEdit,
	onDeleted,
}: VendorDetailsDialogProps) {
	const deleteMutation = trpc.vendors.deactivate.useMutation();

	const handleDelete = async () => {
		if (!vendor) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: vendor.id });
			toast.success("Vendor deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete vendor",
			);
		}
	};

	const imageUrl = vendor ? vendorImageUrl(vendor.image) : null;

	return (
		<ResponsiveOverlay
			open={vendor !== null}
			onOpenChange={onOpenChange}
			title="Vendor Details"
			description={vendor?.name}
			footer={
				<>
					<Button variant="outline" onClick={onEdit} disabled={!vendor}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button
									variant="destructive"
									disabled={!vendor || deleteMutation.isPending}
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
								<AlertDialogTitle>Delete this vendor?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove <strong>{vendor?.name}</strong> from the
									active vendors list. Existing purchase records are kept, and
									the action is written to the change logs.
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
				</>
			}
		>
			{vendor && (
				<div className="space-y-4">
					<div className="flex items-start gap-4">
						{imageUrl ? (
							<img
								src={imageUrl}
								alt={vendor.name}
								className="size-20 shrink-0 border bg-background object-contain"
							/>
						) : (
							<div className="flex size-20 shrink-0 items-center justify-center border bg-muted text-muted-foreground">
								<Store className="size-6" />
							</div>
						)}
						<div className="min-w-0 flex-1 space-y-1">
							<p className="text-sm font-medium break-words">{vendor.name}</p>
							{vendor.notes && (
								<p className="whitespace-pre-wrap text-xs break-words text-muted-foreground">
									{vendor.notes}
								</p>
							)}
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<p className="text-xs font-semibold text-muted-foreground">
							Contacts ({vendor.contacts.length})
						</p>
						{vendor.contacts.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								No contacts recorded.
							</p>
						) : (
							<ul className="space-y-1.5">
								{vendor.contacts.map((contact) => (
									<li
										key={contact.id}
										className="flex items-baseline justify-between gap-3 border px-2.5 py-2"
									>
										<span className="min-w-0">
											<span className="block truncate text-xs font-medium">
												{contact.contactName || "-"}
												{contact.personPosition
													? ` (${contact.personPosition})`
													: ""}
											</span>
											<span className="block truncate text-[10px] text-muted-foreground">
												{contact.contact || "-"}
											</span>
										</span>
										<Badge
											variant="outline"
											className="shrink-0 text-[10px] uppercase"
										>
											{contact.contactType}
										</Badge>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			)}
		</ResponsiveOverlay>
	);
}
