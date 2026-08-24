"use client";

import {
	ExternalLink,
	FileSignature,
	Loader2,
	Pencil,
	Trash2,
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
import { Separator } from "@/components/ui/separator";
import { formatDateLabel } from "@/lib/contract-constants";
import type { Contract } from "@/server/routers/contracts";
import { trpc } from "@/trpc/react";

import { ResponsiveOverlay } from "./responsive-overlay";
import { StatusBadge } from "./status-badge";

type ContractDetailsProps = {
	contract: Contract | null;
	onOpenChange: (open: boolean) => void;
	onEdit: (contract: Contract) => void;
	onDeleted: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3">
			<span className="shrink-0 text-xs text-muted-foreground">{label}</span>
			<span className="min-w-0 truncate text-right text-xs font-medium">
				{value || "-"}
			</span>
		</div>
	);
}

function TextBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-semibold text-muted-foreground">{label}</p>
			<p className="whitespace-pre-wrap text-xs break-words">{value}</p>
		</div>
	);
}

export function ContractDetails({
	contract,
	onOpenChange,
	onEdit,
	onDeleted,
}: ContractDetailsProps) {
	const deleteMutation = trpc.contracts.deactivate.useMutation();

	const handleDelete = async () => {
		if (!contract) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: contract.id });
			toast.success("Contract deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete contract",
			);
		}
	};

	const footer = contract ? (
		<>
			<Button
				variant="outline"
				className="flex-1 sm:flex-none"
				onClick={() => onEdit(contract)}
			>
				<Pencil data-icon="inline-start" />
				Edit
			</Button>
			<AlertDialog>
				<AlertDialogTrigger
					render={
						<Button
							variant="destructive"
							className="flex-1 sm:flex-none"
							disabled={deleteMutation.isPending}
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
						<AlertDialogTitle>Delete this contract?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove <strong>{contract.productName}</strong> from the
							active contracts list. The action is written to the change logs.
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
	) : null;

	return (
		<ResponsiveOverlay
			open={contract !== null}
			onOpenChange={onOpenChange}
			title="Contract Details"
			description={contract?.productName}
			footer={footer}
		>
			{contract && (
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center border bg-muted text-muted-foreground">
							<FileSignature className="size-5" />
						</div>
						<div className="min-w-0 flex-1 space-y-1.5">
							<p className="text-sm font-medium break-words">
								{contract.productName}
							</p>
							<div className="flex flex-wrap items-center gap-2">
								<StatusBadge endDate={contract.endDate} />
								{contract.docslink && (
									<a
										href={contract.docslink}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
									>
										<ExternalLink className="size-3" />
										Documents
									</a>
								)}
							</div>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
						<DetailRow
							label="Start date"
							value={formatDateLabel(contract.startDate)}
						/>
						<DetailRow
							label="End date"
							value={formatDateLabel(contract.endDate)}
						/>
						<DetailRow label="Vendor" value={contract.vendorName ?? "-"} />
						<DetailRow
							label="Cost"
							value={`${contract.currency} ${contract.cost}`}
						/>
						<DetailRow
							label="Billing cycle"
							value={
								contract.bilingCycle.charAt(0).toUpperCase() +
								contract.bilingCycle.slice(1)
							}
						/>
						<DetailRow label="Account" value={contract.account} />
					</div>

					{(contract.notes || contract.support) && <Separator />}

					{contract.notes && <TextBlock label="Notes" value={contract.notes} />}
					{contract.support && (
						<TextBlock label="Support" value={contract.support} />
					)}
				</div>
			)}
		</ResponsiveOverlay>
	);
}
