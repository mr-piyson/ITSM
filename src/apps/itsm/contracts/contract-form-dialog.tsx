"use client";

import { useState } from "react";

import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	BILLING_CYCLES,
	CURRENCIES,
	type BillingCycle,
	type Currency,
} from "@/lib/contract-constants";
import type { Contract } from "@/server/routers/ITSM/contracts";
import { trpc } from "@/trpc/react";

import { ResponsiveOverlay } from "./responsive-overlay";

type ContractFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contract: Contract | null;
	onSuccess?: () => void;
};

export function ContractFormDialog({
	open,
	onOpenChange,
	contract,
	onSuccess,
}: ContractFormDialogProps) {
	return (
		<ResponsiveOverlay
			open={open}
			onOpenChange={onOpenChange}
			title={contract ? "Edit Contract" : "Add New Contract"}
			description={
				contract?.productName ?? "Register a new product or service contract."
			}
		>
			<ContractForm
				key={`${contract?.id ?? "new"}-${open}`}
				contract={contract}
				onOpenChange={onOpenChange}
				onSuccess={onSuccess}
			/>
		</ResponsiveOverlay>
	);
}

function ContractForm({
	contract,
	onOpenChange,
	onSuccess,
}: Omit<ContractFormDialogProps, "open">) {
	const utils = trpc.useUtils();
	const createMutation = trpc.contracts.create.useMutation();
	const updateMutation = trpc.contracts.update.useMutation();
	const { data: vendorOptions = [] } = trpc.purchases.vendors.useQuery();

	const [productName, setProductName] = useState(contract?.productName ?? "");
	const [vendorID, setVendorID] = useState<number>(contract?.vendorID ?? 0);
	const [startDate, setStartDate] = useState(contract?.startDate ?? "");
	const [endDate, setEndDate] = useState(contract?.endDate ?? "");
	const [currency, setCurrency] = useState<Currency>(
		(contract?.currency as Currency) ?? "BHD",
	);
	const [cost, setCost] = useState(contract?.cost ?? "");
	const [bilingCycle, setBilingCycle] = useState<BillingCycle>(
		(contract?.bilingCycle as BillingCycle) ?? "annual",
	);
	const [account, setAccount] = useState(contract?.account ?? "");
	const [notes, setNotes] = useState(contract?.notes ?? "");
	const [support, setSupport] = useState(contract?.support ?? "");
	const [docslink, setDocslink] = useState(contract?.docslink ?? "");

	const pending = createMutation.isPending || updateMutation.isPending;

	const handleSubmit = async () => {
		if (productName.trim().length < 1) {
			toast.error("Please fill the product / service name");
			return;
		}
		if (!vendorID) {
			toast.error("Please select a vendor");
			return;
		}
		if (!startDate || !endDate) {
			toast.error("Please fill start and end dates");
			return;
		}
		if (endDate < startDate) {
			toast.error("End date must be after start date");
			return;
		}
		if (cost.trim().length < 1) {
			toast.error("Please fill the contract's cost");
			return;
		}

		const payload = {
			productName: productName.trim(),
			vendorID,
			startDate,
			endDate,
			currency,
			cost: cost.trim(),
			bilingCycle,
			account: account.trim() || undefined,
			notes: notes.trim() || undefined,
			support: support.trim() || undefined,
			docslink: docslink.trim() || undefined,
		};

		try {
			if (contract) {
				await updateMutation.mutateAsync({ id: contract.id, data: payload });
				toast.success("Contract updated successfully");
			} else {
				await createMutation.mutateAsync(payload);
				toast.success("Contract added successfully");
			}
			utils.contracts.list.invalidate();
			onSuccess?.();
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save contract",
			);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="contract-product">Product / Service *</Label>
				<Input
					id="contract-product"
					value={productName}
					onChange={(e) => setProductName(e.target.value)}
					maxLength={100}
					placeholder="e.g. Microsoft 365 Licensing"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contract-vendor">Vendor *</Label>
				<Select
					value={vendorID ? String(vendorID) : undefined}
					onValueChange={(value) => setVendorID(Number(value))}
				>
					<SelectTrigger id="contract-vendor" className="w-full">
						<SelectValue placeholder="Select vendor" />
					</SelectTrigger>
					<SelectContent>
						{vendorOptions.map((vendor) => (
							<SelectItem key={vendor.id} value={String(vendor.id)}>
								{vendor.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="contract-start">Start Date *</Label>
					<Input
						id="contract-start"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="contract-end">End Date *</Label>
					<Input
						id="contract-end"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="space-y-2">
					<Label>Currency</Label>
					<Select
						value={currency}
						onValueChange={(value) => setCurrency((value ?? "BHD") as Currency)}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CURRENCIES.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="contract-cost">Cost *</Label>
					<Input
						id="contract-cost"
						type="text"
						inputMode="decimal"
						value={cost}
						onChange={(e) => setCost(e.target.value)}
						maxLength={50}
						placeholder="0.000"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Billing Cycle</Label>
					<Select
						value={bilingCycle}
						onValueChange={(value) =>
							setBilingCycle((value ?? "annual") as BillingCycle)
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BILLING_CYCLES.map((option) => (
								<SelectItem key={option} value={option}>
									{option.charAt(0).toUpperCase() + option.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="contract-account">Account</Label>
					<Input
						id="contract-account"
						value={account}
						onChange={(e) => setAccount(e.target.value)}
						maxLength={100}
						placeholder="Optional account reference"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="contract-notes">Notes</Label>
					<Textarea
						id="contract-notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={4}
						placeholder="Optional notes…"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="contract-support">Support</Label>
					<Textarea
						id="contract-support"
						value={support}
						onChange={(e) => setSupport(e.target.value)}
						rows={4}
						placeholder="Support details…"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contract-docslink">Documents Link</Label>
				<Input
					id="contract-docslink"
					type="url"
					value={docslink}
					onChange={(e) => setDocslink(e.target.value)}
					maxLength={2000}
					placeholder="https://…"
				/>
			</div>

			<Button
				type="button"
				onClick={handleSubmit}
				disabled={pending}
				className="w-full sm:w-auto"
			>
				{pending ? <Loader2 className="animate-spin" /> : <Plus />}
				{contract ? "Save Changes" : "Add Contract"}
			</Button>
		</div>
	);
}
