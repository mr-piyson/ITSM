"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Purchase } from "@/server/routers/ITSM/purchases";
import { trpc } from "@/trpc/react";

function fieldError(state: {
	isTouched: boolean;
	errors: unknown;
}): string | null {
	if (!state.isTouched) {
		return null;
	}
	if (Array.isArray(state.errors) && state.errors.length > 0) {
		return state.errors.filter(Boolean).join(", ");
	}
	return null;
}

type PurchaseEditValues = {
	poNumber: string;
	mrnNumber: string;
	quotationDate: string;
	paidDate: string;
	forWho: string;
	notes: string;
	link: string;
};

export function PurchaseEditDialog({
	purchase,
	onOpenChange,
	onSuccess,
}: {
	purchase: Purchase | null;
	onOpenChange: (purchase: Purchase | null) => void;
	onSuccess: () => void;
}) {
	const updateMutation = trpc.purchases.update.useMutation();

	const defaults: PurchaseEditValues = purchase
		? {
				poNumber: String(purchase.poNumber),
				mrnNumber: purchase.mrnNumber ?? "",
				quotationDate: purchase.quotationDate?.slice(0, 10) || "",
				paidDate: purchase.paidDate?.slice(0, 10) || "",
				forWho: purchase.forWho ?? "",
				notes: purchase.notes ?? "",
				link: purchase.link ?? "",
			}
		: {
				poNumber: "",
				mrnNumber: "",
				quotationDate: "",
				paidDate: "",
				forWho: "",
				notes: "",
				link: "",
			};

	const form = useForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			if (!purchase) {
				return;
			}
			try {
				await updateMutation.mutateAsync({
					id: purchase.id,
					data: {
						poNumber: Number(value.poNumber),
						mrnNumber: value.mrnNumber.trim() || undefined,
						quotationDate: value.quotationDate,
						paidDate: value.paidDate || undefined,
						forWho: value.forWho.trim() || undefined,
						notes: value.notes.trim() || undefined,
						link: value.link.trim() || undefined,
					},
				});
				toast.success("Purchase updated successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update purchase",
				);
			}
		},
	});

	return (
		<Dialog
			open={!!purchase}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit Purchase</DialogTitle>
					<DialogDescription>
						Update PO details. Items, totals and vendor are kept as recorded.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="edit-po-number">PO Number *</Label>
							<form.Field
								name="poNumber"
								validators={{
									onChange: ({ value }) =>
										/^\d+$/.test(value) && Number(value) > 0
											? undefined
											: "Enter a valid PO number",
								}}
							>
								{(field) => (
									<div>
										<Input
											id="edit-po-number"
											type="number"
											min={1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{fieldError(field.state.meta) && (
											<p className="mt-1 text-xs text-destructive">
												{fieldError(field.state.meta)}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-mrn-number">MRN Number</Label>
							<form.Field name="mrnNumber">
								{(field) => (
									<Input
										id="edit-mrn-number"
										type="text"
										maxLength={50}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-quotation-date">Quotation Date</Label>
							<form.Field name="quotationDate">
								{(field) => (
									<Input
										id="edit-quotation-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-paid-date">Paid Date</Label>
							<form.Field name="paidDate">
								{(field) => (
									<Input
										id="edit-paid-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-for-who">For Who</Label>
						<form.Field name="forWho">
							{(field) => (
								<Textarea
									id="edit-for-who"
									rows={3}
									maxLength={2000}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-notes">Notes</Label>
						<form.Field name="notes">
							{(field) => (
								<Textarea
									id="edit-notes"
									rows={3}
									maxLength={2000}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-link">Link</Label>
						<form.Field name="link">
							{(field) => (
								<Input
									id="edit-link"
									type="text"
									maxLength={2000}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="https://…"
								/>
							)}
						</form.Field>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							type="button"
							onClick={() => onOpenChange(null)}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit || isSubmitting || updateMutation.isPending
									}
								>
									{isSubmitting ? <Loader2 className="animate-spin" /> : null}
									Save Changes
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
