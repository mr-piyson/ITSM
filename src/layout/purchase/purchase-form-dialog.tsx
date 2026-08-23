"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { useForm } from "@tanstack/react-form";
import {
	ChevronsUpDown,
	Loader2,
	Plus,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ITEM_CATEGORIES } from "@/lib/provide-constants";
import {
	PURCHASE_BUYERS,
	PURCHASE_CURRENCIES,
	purchaseToday,
} from "@/lib/purchase-constants";
import { cn } from "@/lib/utils";
import type {
	PurchaseItemOption,
	VendorOption,
} from "@/server/routers/purchases";
import { trpc } from "@/trpc/react";

type FormItemRow = {
	rowId: number;
	itemID: number;
	itemName: string;
	itemBrand: string;
	stock: number;
	quantity: string;
	price: string;
};

type FormServiceRow = {
	rowId: number;
	name: string;
	price: string;
};

type FormContactRow = {
	rowId: number;
	type: "mobile" | "email" | "other";
	position: string;
	name: string;
	value: string;
};

function round3(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function isValidAmount(value: string): boolean {
	if (value.trim() === "") {
		return false;
	}
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0;
}

function priceKeyDown(e: KeyboardEvent<HTMLInputElement>) {
	const allowed = [
		".",
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"Delete",
		"Backspace",
		"ArrowLeft",
		"ArrowRight",
		"Tab",
		"Enter",
	];
	if (!allowed.includes(e.key)) {
		e.preventDefault();
	}
}

export function PurchaseFormDialog({
	open,
	onOpenChange,
	onSuccess,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>New Purchase / Service</DialogTitle>
					<DialogDescription>
						Register a purchase order or service PO.
					</DialogDescription>
				</DialogHeader>
				<PurchaseFormContent
					key={open ? "open" : "closed"}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function VendorPicker({
	vendors,
	vendorID,
	onSelect,
	onAddNew,
}: {
	vendors: VendorOption[];
	vendorID: number;
	onSelect: (vendorID: number) => void;
	onAddNew: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const selected = vendors.find((vendor) => vendor.id === vendorID);
	const list = vendors.filter((vendor) => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return (
			vendor.name.toLowerCase().includes(q) ||
			vendor.notes.toLowerCase().includes(q)
		);
	});

	return (
		<div className="space-y-2">
			<Label>Vendor *</Label>
			<div className="flex gap-2">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger
						render={
							<Button
								variant="outline"
								className="w-full justify-between text-left"
							/>
						}
					>
						{selected ? (
							<span className="flex min-w-0 flex-col">
								<span className="truncate">{selected.name}</span>
								{selected.notes && (
									<span className="truncate text-xs text-muted-foreground">
										{selected.notes.split("\n")[0]}
									</span>
								)}
							</span>
						) : (
							<span className="text-muted-foreground">Search vendor…</span>
						)}
						<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0" align="start">
						<Command shouldFilter={false}>
							<CommandInput
								placeholder="Search name / notes…"
								value={search}
								onValueChange={setSearch}
							/>
							<CommandList>
								<CommandEmpty>No vendor found</CommandEmpty>
								<CommandGroup>
									{list.map((vendor) => (
										<CommandItem
											key={vendor.id}
											value={vendor.name}
											data-checked={vendorID === vendor.id}
											onSelect={() => {
												onSelect(vendor.id);
												setOpen(false);
											}}
										>
											<div className="min-w-0 flex-1">
												<p className="truncate">{vendor.name}</p>
												<p className="truncate text-xs text-muted-foreground">
													{vendor.notes ? vendor.notes.split("\n")[0] : "-"}
												</p>
											</div>
											{vendor.contacts.length > 0 && (
												<span className="shrink-0 text-xs text-muted-foreground">
													{vendor.contacts.length} contact
													{vendor.contacts.length === 1 ? "" : "s"}
												</span>
											)}
										</CommandItem>
									))}
								</CommandGroup>
								<CommandGroup>
									<CommandItem
										value="__add_new_vendor"
										onSelect={() => {
											setOpen(false);
											onAddNew();
										}}
									>
										<Plus data-icon="inline-start" />
										Add new vendor…
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

function AddVendorDialog({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: (vendor: VendorOption) => void;
}) {
	const nextRowIdRef = useRef(1);
	const createContactRow = (): FormContactRow => {
		const rowId = nextRowIdRef.current++;
		return { rowId, type: "mobile", position: "", name: "", value: "" };
	};

	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [contacts, setContacts] = useState<FormContactRow[]>([
		createContactRow(),
	]);
	const createVendorMutation = trpc.purchases.createVendor.useMutation();

	const updateContact = (rowId: number, patch: Partial<FormContactRow>) => {
		setContacts((prev) =>
			prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
		);
	};

	const handleSubmit = async () => {
		if (name.trim().length < 1) {
			toast.error("Please fill vendor's name");
			return;
		}
		try {
			const result = await createVendorMutation.mutateAsync({
				name: name.trim(),
				notes: notes.trim() || undefined,
				contacts: contacts.map((contact) => ({
					type: contact.type,
					position: contact.position.trim() || undefined,
					name: contact.name.trim(),
					value: contact.value.trim(),
				})),
			});
			toast.success("Vendor added successfully");
			onCreated({
				id: result.vendor.id,
				name: result.vendor.name,
				notes: result.vendor.notes ?? "",
				contacts: [],
			});
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add vendor",
			);
		}
	};

	const resetAndClose = (nextOpen: boolean) => {
		if (!nextOpen) {
			setName("");
			setNotes("");
			setContacts([createContactRow()]);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={resetAndClose}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Add New Vendor</DialogTitle>
					<DialogDescription>
						Create a vendor record and select it for this purchase.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="new-vendor-name">Name *</Label>
						<Input
							id="new-vendor-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={150}
							placeholder="Vendor name"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-vendor-notes">Notes</Label>
						<Textarea
							id="new-vendor-notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							placeholder="Optional notes…"
						/>
					</div>

					<div className="space-y-2">
						<Label>Contacts</Label>
						{contacts.map((contact) => (
							<div key={contact.rowId} className="flex items-center gap-2">
								<Select
									value={contact.type}
									onValueChange={(value) =>
										updateContact(contact.rowId, {
											type: value as FormContactRow["type"],
										})
									}
								>
									<SelectTrigger className="w-28 shrink-0">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="mobile">mobile</SelectItem>
										<SelectItem value="email">email</SelectItem>
										<SelectItem value="other">other</SelectItem>
									</SelectContent>
								</Select>
								<Input
									className="w-28 shrink-0"
									value={contact.position}
									onChange={(e) =>
										updateContact(contact.rowId, { position: e.target.value })
									}
									maxLength={100}
									placeholder="position"
								/>
								<Input
									className="min-w-0 flex-1"
									value={contact.name}
									onChange={(e) =>
										updateContact(contact.rowId, { name: e.target.value })
									}
									maxLength={100}
									placeholder="name"
								/>
								<Input
									className="min-w-0 flex-1"
									value={contact.value}
									onChange={(e) =>
										updateContact(contact.rowId, { value: e.target.value })
									}
									maxLength={100}
									placeholder="value"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									title="Remove contact"
									onClick={() =>
										setContacts((prev) =>
											prev.length === 1
												? prev
												: prev.filter((row) => row.rowId !== contact.rowId),
										)
									}
									disabled={contacts.length === 1}
								>
									<Trash2 />
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								setContacts((prev) => [...prev, createContactRow()])
							}
						>
							<Plus data-icon="inline-start" />
							Add more
						</Button>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={createVendorMutation.isPending}
					>
						{createVendorMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Plus />
						)}
						Add vendor
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ItemPicker({
	stockItems,
	selected,
	onSelect,
	onAddNew,
}: {
	stockItems: PurchaseItemOption[];
	selected: FormItemRow;
	onSelect: (item: PurchaseItemOption) => void;
	onAddNew: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const list = stockItems.filter((item) => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return (
			item.name.toLowerCase().includes(q) ||
			item.brand.toLowerCase().includes(q)
		);
	});

	return (
		<div className="space-y-1.5">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button
							variant="outline"
							className="w-full justify-between text-left"
						/>
					}
				>
					{selected.itemID ? (
						<span className="flex min-w-0 items-center gap-2">
							<span className="truncate">{selected.itemName}</span>
							{selected.itemBrand && (
								<span className="truncate text-xs text-muted-foreground">
									{selected.itemBrand}
								</span>
							)}
						</span>
					) : (
						<span className="text-muted-foreground">Search item…</span>
					)}
					<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
				</PopoverTrigger>
				<PopoverContent className="w-72 p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Search name / brand…"
							value={search}
							onValueChange={setSearch}
						/>
						<CommandList>
							<CommandEmpty>No item found</CommandEmpty>
							<CommandGroup>
								{list.map((item) => (
									<CommandItem
										key={item.id}
										value={item.name}
										data-checked={selected.itemID === item.id}
										onSelect={() => {
											onSelect(item);
											setOpen(false);
										}}
									>
										<div className="min-w-0 flex-1">
											<p className="truncate">{item.name}</p>
											<p className="truncate text-xs text-muted-foreground">
												{item.brand || "-"}
											</p>
										</div>
										<span
											className={cn(
												"shrink-0 rounded-none px-1.5 py-px text-xs font-medium",
												item.stock > 0
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
											)}
										>
											{item.stock}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
							<CommandGroup>
								<CommandItem
									value="__add_new_item"
									onSelect={() => {
										setOpen(false);
										onAddNew();
									}}
								>
									<Plus data-icon="inline-start" />
									Add new item…
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{selected.itemID > 0 && (
				<span
					className={cn(
						"inline-flex px-1.5 py-px text-[10px]",
						selected.stock === 0
							? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
							: "bg-muted text-muted-foreground",
					)}
				>
					{selected.stock === 0
						? "Out of stock"
						: `${selected.stock} available`}
				</span>
			)}
		</div>
	);
}

function AddItemDialog({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: (item: PurchaseItemOption) => void;
}) {
	const [name, setName] = useState("");
	const [brand, setBrand] = useState("");
	const [stock, setStock] = useState("0");
	const [category, setCategory] = useState<string>(ITEM_CATEGORIES[0]);
	const createItemMutation = trpc.purchases.createItem.useMutation();

	const handleSubmit = async () => {
		if (name.trim().length < 1) {
			toast.error("Please fill item's name");
			return;
		}
		try {
			const result = await createItemMutation.mutateAsync({
				name: name.trim(),
				brand: brand.trim() || undefined,
				stock: Number(stock) || 0,
				category,
			});
			toast.success("Item added successfully");
			onCreated(result.item);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add item",
			);
		}
	};

	const resetAndClose = (nextOpen: boolean) => {
		if (!nextOpen) {
			setName("");
			setBrand("");
			setStock("0");
			setCategory(ITEM_CATEGORIES[0]);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={resetAndClose}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<DialogDescription>
						Create a stock item and select it for this purchase.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="new-item-name">Name *</Label>
						<Input
							id="new-item-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={100}
							placeholder="Item name"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="new-item-brand">Brand</Label>
							<Input
								id="new-item-brand"
								value={brand}
								onChange={(e) => setBrand(e.target.value)}
								maxLength={100}
								placeholder="Brand"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-item-stock">Stock</Label>
							<Input
								id="new-item-stock"
								type="number"
								min={0}
								value={stock}
								onChange={(e) => setStock(e.target.value)}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>Category</Label>
						<Select
							value={category}
							onValueChange={(value) =>
								setCategory(value ?? ITEM_CATEGORIES[0])
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ITEM_CATEGORIES.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={createItemMutation.isPending}
					>
						{createItemMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Plus />
						)}
						Add item
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PurchaseFormContent({ onSuccess }: { onSuccess: () => void }) {
	const utils = trpc.useUtils();
	const { data: vendors = [] } = trpc.purchases.vendors.useQuery();
	const { data: stockItems = [] } = trpc.purchases.items.useQuery();
	const createMutation = trpc.purchases.create.useMutation();

	const nextItemIdRef = useRef(1);
	const nextServiceIdRef = useRef(1);
	const addItemTargetRef = useRef<number | null>(null);

	const createItemRow = (): FormItemRow => {
		const rowId = nextItemIdRef.current++;
		return {
			rowId,
			itemID: 0,
			itemName: "",
			itemBrand: "",
			stock: 0,
			quantity: "1",
			price: "",
		};
	};
	const createServiceRow = (): FormServiceRow => {
		const rowId = nextServiceIdRef.current++;
		return { rowId, name: "", price: "" };
	};

	const [rows, setRows] = useState<FormItemRow[]>([createItemRow()]);
	const [serviceRows, setServiceRows] = useState<FormServiceRow[]>([
		createServiceRow(),
	]);
	const [currentTotal, setCurrentTotal] = useState("");
	const [vat, setVat] = useState("");
	const [grandTotal, setGrandTotal] = useState("");
	const [addVendorOpen, setAddVendorOpen] = useState(false);
	const [addItemOpen, setAddItemOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			poType: "Purchase" as "Purchase" | "Service",
			poNumber: "",
			mrnNumber: "",
			vendorID: 0,
			currency: "BHD" as (typeof PURCHASE_CURRENCIES)[number],
			quotationDate: purchaseToday(),
			paidDate: "",
			buyer: PURCHASE_BUYERS[0],
			advanceRequest: false,
			LPO: false,
			invoice: false,
			deliveryNote: false,
			mrn: false,
			forWho: "",
			notes: "",
			link: "",
		},
		onSubmit: async ({ value }) => {
			const poNumber = Number(value.poNumber);
			if (!Number.isInteger(poNumber) || poNumber <= 0) {
				toast.error("Enter a valid PO number");
				return;
			}
			if (value.vendorID === 0) {
				toast.error("Select a vendor");
				return;
			}

			if (value.poType === "Purchase") {
				for (const row of rows) {
					if (row.itemID === 0) {
						toast.error("Select an item for every row");
						return;
					}
					const quantity = Number(row.quantity);
					if (!Number.isInteger(quantity) || quantity < 1) {
						toast.error(`Enter a valid quantity for "${row.itemName}"`);
						return;
					}
					if (!isValidAmount(row.price)) {
						toast.error(`Enter a valid price for "${row.itemName}"`);
						return;
					}
				}
			} else {
				for (const row of serviceRows) {
					if (row.name.trim().length < 1) {
						toast.error("Enter a name for every service");
						return;
					}
					if (!isValidAmount(row.price)) {
						toast.error(`Enter a valid price for "${row.name}"`);
						return;
					}
				}
			}

			try {
				await createMutation.mutateAsync({
					poType: value.poType,
					poNumber,
					mrnNumber: value.mrnNumber.trim() || undefined,
					vendorID: value.vendorID,
					currency: value.currency,
					currentTotal: currentTotal === "" ? "0" : currentTotal,
					vat: vat === "" ? "0" : vat,
					grandTotal: grandTotal === "" ? "0" : grandTotal,
					quotationDate: value.quotationDate,
					paidDate: value.paidDate || undefined,
					buyer: value.buyer,
					advanceRequest: value.advanceRequest,
					LPO: value.LPO,
					invoice: value.invoice,
					deliveryNote: value.deliveryNote,
					mrn: value.mrn,
					forWho: value.forWho.trim() || undefined,
					notes: value.notes.trim() || undefined,
					link: value.link.trim() || undefined,
					items:
						value.poType === "Purchase"
							? rows.map((row) => ({
									itemID: row.itemID,
									quantity: Number(row.quantity),
									price: row.price,
								}))
							: undefined,
					services:
						value.poType === "Service"
							? serviceRows.map((row) => ({
									name: row.name.trim(),
									price: row.price,
								}))
							: undefined,
				});
				toast.success("Purchase added successfully");
				utils.purchases.vendors.invalidate();
				utils.purchases.items.invalidate();
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to add purchase",
				);
			}
		},
	});

	const poType = form.state.values.poType;

	useEffect(() => {
		let total = 0;
		if (poType === "Service") {
			for (const row of serviceRows) {
				const price = Number.parseFloat(row.price);
				if (!Number.isNaN(price)) {
					total += Math.round(price * 1000) / 1000;
				}
			}
		} else {
			for (const row of rows) {
				const qty = Number.parseInt(row.quantity, 10);
				const price = Number.parseFloat(row.price);
				if (!Number.isNaN(qty * price)) {
					total += Math.round(qty * price * 1000) / 1000;
				}
			}
		}
		total = round3(total);
		let nextVat = 0;
		if (form.state.values.currency === "BHD" && vat !== "0") {
			nextVat = Math.round(total * 0.1 * 1000) / 1000;
		}
		setCurrentTotal(String(total));
		setVat(String(nextVat));
		setGrandTotal(String(round3(nextVat + total)));
	}, [poType, rows, serviceRows, vat, form.state.values.currency]);

	const updateRow = (rowId: number, patch: Partial<FormItemRow>) => {
		setRows((prev) =>
			prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
		);
	};

	const removeRow = (rowId: number) => {
		setRows((prev) =>
			prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId),
		);
	};

	const updateServiceRow = (rowId: number, patch: Partial<FormServiceRow>) => {
		setServiceRows((prev) =>
			prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
		);
	};

	const removeServiceRow = (rowId: number) => {
		setServiceRows((prev) =>
			prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId),
		);
	};

	const handleItemCreated = (item: PurchaseItemOption) => {
		const targetRowId = addItemTargetRef.current;
		addItemTargetRef.current = null;
		if (targetRowId !== null && rows.some((row) => row.rowId === targetRowId)) {
			updateRow(targetRowId, {
				itemID: item.id,
				itemName: item.name,
				itemBrand: item.brand,
				stock: item.stock,
			});
		}
		utils.purchases.items.invalidate();
	};

	const flags: {
		label: string;
		key: "advanceRequest" | "LPO" | "invoice" | "deliveryNote" | "mrn";
	}[] = [
		{ label: "Advance Request", key: "advanceRequest" },
		{ label: "LPO", key: "LPO" },
		{ label: "Invoice", key: "invoice" },
		{ label: "Delivery Note", key: "deliveryNote" },
		{ label: "MRN", key: "mrn" },
	];

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* PO Details */}
				<div className="space-y-4">
					<Label className="text-sm font-semibold">PO details</Label>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label>PO Type *</Label>
							<form.Field name="poType">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "Purchase" | "Service")
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Purchase">Purchase</SelectItem>
											<SelectItem value="Service">Service</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="po-number">PO Number *</Label>
							<form.Field name="poNumber">
								{(field) => (
									<Input
										id="po-number"
										type="number"
										min={1}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="mrn-number">MRN Number</Label>
							<form.Field name="mrnNumber">
								{(field) => (
									<Input
										id="mrn-number"
										type="text"
										maxLength={50}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
					</div>
					<VendorPicker
						vendors={vendors}
						vendorID={form.state.values.vendorID}
						onSelect={(vendorID) => form.setFieldValue("vendorID", vendorID)}
						onAddNew={() => setAddVendorOpen(true)}
					/>
				</div>

				{/* Items or Services */}
				{poType === "Purchase" ? (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-semibold">Items *</Label>
							<span className="text-xs text-muted-foreground">
								Received quantities are added to stock
							</span>
						</div>
						{rows.map((row, index) => (
							<div key={row.rowId} className="rounded-md border p-3">
								<div className="flex items-start gap-3">
									<div className="min-w-0 flex-1 space-y-1">
										<Label className="text-xs">Item #{index + 1}</Label>
										<ItemPicker
											stockItems={stockItems}
											selected={row}
											onSelect={(item) =>
												updateRow(row.rowId, {
													itemID: item.id,
													itemName: item.name,
													itemBrand: item.brand,
													stock: item.stock,
												})
											}
											onAddNew={() => {
												addItemTargetRef.current = row.rowId;
												setAddItemOpen(true);
											}}
										/>
									</div>
									<div className="w-24 shrink-0 space-y-1">
										<Label className="text-xs">Qty</Label>
										<Input
											type="number"
											min={1}
											value={row.quantity}
											onChange={(e) =>
												updateRow(row.rowId, { quantity: e.target.value })
											}
										/>
									</div>
									<div className="w-28 shrink-0 space-y-1">
										<Label className="text-xs">Price</Label>
										<Input
											inputMode="decimal"
											value={row.price}
											onKeyDown={priceKeyDown}
											onChange={(e) =>
												updateRow(row.rowId, { price: e.target.value })
											}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										title="Remove item"
										onClick={() => removeRow(row.rowId)}
										disabled={rows.length === 1}
										className="mt-5 shrink-0"
									>
										<Trash2 />
									</Button>
								</div>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setRows((prev) => [...prev, createItemRow()])}
						>
							<Plus data-icon="inline-start" />
							Add more items
						</Button>
					</div>
				) : (
					<div className="space-y-2">
						<Label className="text-sm font-semibold">Services *</Label>
						{serviceRows.map((row, index) => (
							<div key={row.rowId} className="rounded-md border p-3">
								<div className="flex items-start gap-3">
									<div className="min-w-0 flex-1 space-y-1">
										<Label className="text-xs">Service #{index + 1}</Label>
										<Input
											value={row.name}
											maxLength={100}
											placeholder="Service description"
											onChange={(e) =>
												updateServiceRow(row.rowId, { name: e.target.value })
											}
										/>
									</div>
									<div className="w-28 shrink-0 space-y-1">
										<Label className="text-xs">Price</Label>
										<Input
											inputMode="decimal"
											value={row.price}
											onKeyDown={priceKeyDown}
											onChange={(e) =>
												updateServiceRow(row.rowId, { price: e.target.value })
											}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										title="Remove service"
										onClick={() => removeServiceRow(row.rowId)}
										disabled={serviceRows.length === 1}
										className="mt-5 shrink-0"
									>
										<Trash2 />
									</Button>
								</div>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								setServiceRows((prev) => [...prev, createServiceRow()])
							}
						>
							<Plus data-icon="inline-start" />
							Add more services
						</Button>
					</div>
				)}

				{/* Totals */}
				<div className="space-y-4">
					<Label className="text-sm font-semibold">Totals</Label>
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<div className="space-y-2">
							<Label>Currency</Label>
							<form.Field name="currency">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(
												value as (typeof PURCHASE_CURRENCIES)[number],
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PURCHASE_CURRENCIES.map((currency) => (
												<SelectItem key={currency} value={currency}>
													{currency}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="current-total">Current Total</Label>
							<Input id="current-total" value={currentTotal} readOnly />
						</div>
						<div className="space-y-2">
							<Label htmlFor="vat-input">VAT (10% BHD)</Label>
							<Input
								id="vat-input"
								inputMode="decimal"
								value={vat}
								onKeyDown={priceKeyDown}
								onChange={(e) => setVat(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="grand-total">Grand Total</Label>
							<Input
								id="grand-total"
								value={grandTotal}
								readOnly
								className="font-semibold"
							/>
						</div>
					</div>
				</div>

				{/* Dates & Options */}
				<div className="space-y-4">
					<Label className="text-sm font-semibold">Dates &amp; options</Label>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="quotation-date">Quotation Date</Label>
							<form.Field name="quotationDate">
								{(field) => (
									<Input
										id="quotation-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="paid-date">Paid Date</Label>
							<form.Field name="paidDate">
								{(field) => (
									<Input
										id="paid-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label>Buyer</Label>
							<form.Field name="buyer">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? PURCHASE_BUYERS[0])
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PURCHASE_BUYERS.map((buyer) => (
												<SelectItem key={buyer} value={buyer}>
													{buyer}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
					</div>
					<div className="flex flex-wrap gap-x-6 gap-y-3">
						{flags.map((flag) => (
							<label
								key={flag.key}
								className="flex cursor-pointer items-center gap-2 text-sm"
							>
								<Switch
									size="sm"
									checked={form.state.values[flag.key]}
									onCheckedChange={(checked) =>
										form.setFieldValue(flag.key, checked === true)
									}
								/>
								{flag.label}
							</label>
						))}
					</div>
				</div>

				{/* Notes */}
				<div className="space-y-4">
					<Label className="text-sm font-semibold">Notes</Label>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="for-who">For Who</Label>
							<form.Field name="forWho">
								{(field) => (
									<Textarea
										id="for-who"
										rows={4}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Who is this purchase for…"
									/>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="purchase-notes">Notes</Label>
							<form.Field name="notes">
								{(field) => (
									<Textarea
										id="purchase-notes"
										rows={4}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Optional notes…"
									/>
								)}
							</form.Field>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="purchase-link">Link</Label>
						<form.Field name="link">
							{(field) => (
								<Input
									id="purchase-link"
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="https://…"
								/>
							)}
						</form.Field>
					</div>
				</div>

				<DialogFooter>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={
									!canSubmit || isSubmitting || createMutation.isPending
								}
							>
								{isSubmitting || createMutation.isPending ? (
									<Loader2 className="animate-spin" />
								) : (
									<ShoppingCart />
								)}
								Save purchase
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</form>

			<AddVendorDialog
				open={addVendorOpen}
				onOpenChange={setAddVendorOpen}
				onCreated={(vendor) => {
					form.setFieldValue("vendorID", vendor.id);
					utils.purchases.vendors.invalidate();
				}}
			/>

			<AddItemDialog
				open={addItemOpen}
				onOpenChange={setAddItemOpen}
				onCreated={handleItemCreated}
			/>
		</>
	);
}
