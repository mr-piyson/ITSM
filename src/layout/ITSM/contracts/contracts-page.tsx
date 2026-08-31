"use client";

import { FileSignature, Loader2, Plus, Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
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
} from "@/components/ui/alert-dialog";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Contract } from "@/server/routers/ITSM/contracts";
import { trpc } from "@/trpc/react";

import { ContractDetails } from "./contract-details";
import { ContractFormDialog } from "./contract-form-dialog";
import { ContractsCardList } from "./contract-card-list";
import { ContractsTable } from "./contracts-table";

function TableSkeleton() {
	return (
		<div className="flex-1 min-h-0 rounded-none border">
			<div className="flex h-10 items-center gap-3 border-b bg-muted px-3">
				<Skeleton className="h-3 w-48" />
				<Skeleton className="h-3 w-32" />
				<Skeleton className="h-3 w-40" />
			</div>
			{Array.from({ length: 8 }).map((_, i) => (
				<div key={i} className="flex h-[57px] items-center gap-3 border-b px-3">
					<Skeleton className="h-3 flex-1" />
					<Skeleton className="h-3 w-28" />
					<Skeleton className="h-5 w-36" />
					<Skeleton className="h-3 w-20" />
				</div>
			))}
		</div>
	);
}

function CardsSkeleton() {
	return (
		<div className="flex-1 min-h-0 divide-y rounded-none border">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className="flex items-center gap-3 p-3">
					<div className="min-w-0 flex-1 space-y-1.5">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/3" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="h-5 w-20 shrink-0" />
				</div>
			))}
		</div>
	);
}

export function ContractsPage() {
	const utils = trpc.useUtils();
	const isMobile = useIsMobile();
	const { data: contracts = [], isPending } = trpc.contracts.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [contractID, setContractID] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingContract, setEditingContract] = useState<Contract | null>(null);
	const [validOnly, setValidOnly] = useState(false);
	const [deletingContract, setDeletingContract] = useState<Contract | null>(
		null,
	);
	const deleteMutation = trpc.contracts.deactivate.useMutation();

	const detailsContract = useMemo(
		() =>
			contracts.find((contract) => String(contract.id) === contractID) ?? null,
		[contracts, contractID],
	);

	const filtered = useMemo(() => {
		let result = contracts;
		if (validOnly) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			result = result.filter(
				(contract) => new Date(`${contract.endDate}T00:00:00`) >= today,
			);
		}
		const q = query.trim().toLowerCase();
		if (!q) {
			return result;
		}
		return result.filter((contract) =>
			[
				contract.productName,
				contract.vendorName ?? "",
				contract.account,
				contract.notes,
				contract.support,
			].some((part) => part.toLowerCase().includes(q)),
		);
	}, [contracts, query, validOnly]);

	const isFiltering = validOnly || query.trim().length > 0;

	const openAdd = () => {
		setEditingContract(null);
		setFormOpen(true);
	};

	const openEdit = (contract: Contract) => {
		setEditingContract(contract);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingContract(null);
		utils.contracts.list.invalidate();
	};

	const closeDetails = () => setContractID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		setDeletingContract(null);
		utils.contracts.list.invalidate();
	};

	const handleTableDelete = async () => {
		if (!deletingContract) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: deletingContract.id });
			toast.success("Contract deleted");
			handleDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete contract",
			);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="min-w-0">
						<h1 className="text-xl font-semibold tracking-tight">Contracts</h1>
						<p className="text-xs text-muted-foreground">
							{isPending
								? "Loading contracts…"
								: isFiltering
									? `Showing ${filtered.length} of ${contracts.length} contracts`
									: `${contracts.length} contract${contracts.length === 1 ? "" : "s"}`}
						</p>
					</div>
					<Button onClick={openAdd} className="w-full sm:w-auto">
						<Plus data-icon="inline-start" />
						Add Contract
					</Button>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
					<div className="relative w-full sm:max-w-sm">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search product, vendor, account…"
							className="pl-8"
						/>
					</div>
					<Label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-medium sm:justify-start">
						Valid only
						<Switch
							checked={validOnly}
							onCheckedChange={(checked) => setValidOnly(checked === true)}
						/>
					</Label>
				</div>
			</div>

			{isPending ? (
				isMobile ? (
					<CardsSkeleton />
				) : (
					<TableSkeleton />
				)
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FileSignature />
						</EmptyMedia>
						<EmptyTitle>
							{contracts.length === 0 ? "No contracts yet" : "No matches"}
						</EmptyTitle>
						<EmptyDescription>
							{contracts.length === 0
								? "Add your first contract to start tracking renewals."
								: isFiltering && validOnly
									? "No valid contracts match your filters."
									: "Try adjusting your search or filters."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{contracts.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first contract
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : isMobile ? (
				<ContractsCardList
					contracts={filtered}
					onDetails={(contract) => setContractID(String(contract.id))}
				/>
			) : (
				<ContractsTable
					contracts={filtered}
					onDetails={(contract) => setContractID(String(contract.id))}
					onEdit={openEdit}
					onDelete={setDeletingContract}
				/>
			)}

			<ContractFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				contract={editingContract}
				onSuccess={handleFormSuccess}
			/>

			<ContractDetails
				contract={detailsContract}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
				onEdit={(contract) => {
					closeDetails();
					openEdit(contract);
				}}
				onDeleted={handleDeleted}
			/>

			<AlertDialog
				open={deletingContract !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeletingContract(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this contract?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove <strong>{deletingContract?.productName}</strong>{" "}
							from the active contracts list. The action is written to the
							change logs.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleteMutation.isPending}
							onClick={handleTableDelete}
						>
							{deleteMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : null}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
