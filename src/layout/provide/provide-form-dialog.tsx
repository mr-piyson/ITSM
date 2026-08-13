"use client";

import { useEffect, useRef, useState } from "react";

import { useForm } from "@tanstack/react-form";
import {
	ChevronsUpDown,
	Loader2,
	PackageCheck,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { employeeImageUrl } from "@/lib/employees-constants";
import { provideToday } from "@/lib/provide-constants";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/assets";
import type { StockItemOption } from "@/server/routers/provide";
import { trpc } from "@/trpc/react";

type FormItem = {
	rowId: number;
	itemID: number;
	itemName: string;
	itemBrand: string;
	stock: number;
	quantity: string;
};

const formSchema = z.object({
	empID: z.number().int().positive("Select the employee receiving the items"),
	requestBy: z.number().int().positive("Select who requested the items"),
	recievedBy: z.number().int().positive("Select who received the items"),
	providedBy: z.number().int().positive("Select who provided the items"),
	providedDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Provide date is required"),
	notes: z.string().trim().max(2000).optional(),
});

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

export function ProvideFormDialog({
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
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>New Provide</DialogTitle>
					<DialogDescription>
						Provide stock items to an employee and record it.
					</DialogDescription>
				</DialogHeader>
				<ProvideFormContent
					key={open ? "open" : "closed"}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function EmployeePicker({
	label,
	employees,
	empID,
	onSelect,
}: {
	label: string;
	employees: EmployeeItem[];
	empID: number;
	onSelect: (empID: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const selected = employees.find((e) => e.empID === empID);
	const list = employees.filter((employee) => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return (
			employee.name.toLowerCase().includes(q) ||
			String(employee.empID).includes(q)
		);
	});

	return (
		<div className="space-y-2">
			<Label>{label} *</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button variant="outline" className="w-full justify-between" />
					}
				>
					{selected ? (
						<span className="flex min-w-0 items-center gap-2">
							<Avatar className="size-5 shrink-0">
								{employeeImageUrl(selected.image) && (
									<AvatarImage
										src={employeeImageUrl(selected.image) ?? undefined}
										alt={selected.name}
									/>
								)}
								<AvatarFallback className="text-[9px]">
									{selected.name[0]?.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="truncate">
								{selected.name}{" "}
								<span className="text-muted-foreground">
									({selected.empID})
								</span>
							</span>
						</span>
					) : (
						<span className="text-muted-foreground">Search employee…</span>
					)}
					<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
				</PopoverTrigger>
				<PopoverContent className="w-80 p-0">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Search name / ID…"
							value={search}
							onValueChange={setSearch}
						/>
						<CommandList>
							<CommandEmpty>No employee found</CommandEmpty>
							<CommandGroup>
								{list.map((employee) => (
									<CommandItem
										key={employee.empID}
										value={employee.name}
										data-checked={empID === employee.empID}
										onSelect={() => {
											onSelect(employee.empID);
											setOpen(false);
										}}
									>
										<Avatar className="size-5 shrink-0">
											{employeeImageUrl(employee.image) && (
												<AvatarImage
													src={employeeImageUrl(employee.image) ?? undefined}
													alt={employee.name}
												/>
											)}
											<AvatarFallback className="text-[9px]">
												{employee.name[0]?.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="truncate">{employee.name}</span>
										<span className="ml-auto shrink-0 text-muted-foreground">
											{employee.empID}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function ItemPicker({
	stockItems,
	selected,
	onSelect,
}: {
	stockItems: StockItemOption[];
	selected: FormItem;
	onSelect: (item: StockItemOption) => void;
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
			item.brand.toLowerCase().includes(q) ||
			item.category.toLowerCase().includes(q)
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
												"shrink-0 text-xs font-medium",
												item.stock === 0
													? "text-destructive"
													: "text-muted-foreground",
											)}
										>
											{item.stock}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<span
				className={cn(
					"inline-flex px-1.5 py-px text-[10px]",
					selected.itemID === 0
						? "text-muted-foreground"
						: selected.stock === 0
							? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
							: "bg-muted text-muted-foreground",
				)}
			>
				{selected.itemID === 0
					? "No item selected"
					: selected.stock === 0
						? "Out of stock"
						: `${selected.stock} available`}
			</span>
		</div>
	);
}

function ProvideFormContent({ onSuccess }: { onSuccess: () => void }) {
	const { data: employees = [] } = trpc.assets.employees.useQuery();
	const { data: stockItems = [] } = trpc.provides.stockItems.useQuery();
	const { data: users = [] } = trpc.provides.users.useQuery();
	const { data: currentUser } = trpc.auth.me.useQuery();
	const createMutation = trpc.provides.create.useMutation();

	const nextRowIdRef = useRef(1);
	const createRow = (): FormItem => {
		const rowId = nextRowIdRef.current++;
		return {
			rowId,
			itemID: 0,
			itemName: "",
			itemBrand: "",
			stock: 0,
			quantity: "1",
		};
	};

	const [rows, setRows] = useState<FormItem[]>([createRow()]);
	const [providedByDefaulted, setProvidedByDefaulted] = useState(false);

	const form = useForm({
		defaultValues: {
			empID: 0,
			requestBy: 0,
			recievedBy: 0,
			providedBy: 0,
			providedDate: provideToday(),
			notes: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = formSchema.safeParse({
				...value,
				notes: value.notes.trim() || undefined,
			});
			if (!parsed.success) {
				const first = parsed.error.issues[0];
				toast.error(first?.message ?? "Please check the form fields");
				return;
			}

			if (rows.length === 0) {
				toast.error("Add at least one item");
				return;
			}
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
				if (quantity > row.stock) {
					toast.error(`"${row.itemName}" has only ${row.stock} in stock`);
					return;
				}
			}

			try {
				await createMutation.mutateAsync({
					empID: value.empID,
					requestBy: value.requestBy,
					recievedBy: value.recievedBy,
					providedBy: value.providedBy,
					providedDate: value.providedDate,
					notes: value.notes.trim() || undefined,
					items: rows.map((row) => ({
						itemID: row.itemID,
						quantity: Number(row.quantity),
					})),
				});
				toast.success("Provide recorded successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create provide",
				);
			}
		},
	});

	useEffect(() => {
		if (providedByDefaulted) {
			return;
		}
		if (!currentUser?.id || users.length === 0) {
			return;
		}
		const currentUserID = Number(currentUser.id);
		if (!users.some((user) => user.id === currentUserID)) {
			return;
		}
		form.setFieldValue("providedBy", currentUserID);
		setProvidedByDefaulted(true);
	}, [currentUser, users, providedByDefaulted, form]);

	const updateRow = (rowId: number, patch: Partial<FormItem>) => {
		setRows((prev) =>
			prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
		);
	};

	const removeRow = (rowId: number) => {
		setRows((prev) =>
			prev.length === 1 ? prev : prev.filter((r) => r.rowId !== rowId),
		);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Items */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Items *</Label>
					<span className="text-xs text-muted-foreground">
						Stock items to provide
					</span>
				</div>
				{rows.map((row) => (
					<div key={row.rowId} className="rounded-md border p-3">
						<div className="flex items-start gap-3">
							<div className="min-w-0 flex-1 space-y-1">
								<ItemPicker
									stockItems={stockItems}
									selected={row}
									onSelect={(item) =>
										updateRow(row.rowId, {
											itemID: item.id,
											itemName: item.name,
											itemBrand: item.brand,
											stock: item.stock,
											quantity: "1",
										})
									}
								/>
							</div>
							<div className="w-24 shrink-0 space-y-1.5">
								<Label className="text-xs">Quantity</Label>
								<Input
									type="number"
									min={1}
									max={row.stock > 0 ? row.stock : undefined}
									value={row.quantity}
									onChange={(e) =>
										updateRow(row.rowId, { quantity: e.target.value })
									}
								/>
								{row.itemID > 0 && Number(row.quantity) > row.stock && (
									<p className="text-xs font-medium text-destructive">
										Exceeds stock
									</p>
								)}
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
					onClick={() => setRows((prev) => [...prev, createRow()])}
				>
					<Plus data-icon="inline-start" />
					Add item
				</Button>
			</div>

			{/* Parties */}
			<div className="space-y-4">
				<Label className="text-sm font-semibold">Request details</Label>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<EmployeePicker
						label="Employee"
						employees={employees}
						empID={form.state.values.empID}
						onSelect={(empID) => form.setFieldValue("empID", empID)}
					/>
					<EmployeePicker
						label="Requested by"
						employees={employees}
						empID={form.state.values.requestBy}
						onSelect={(empID) => form.setFieldValue("requestBy", empID)}
					/>
					<EmployeePicker
						label="Received by"
						employees={employees}
						empID={form.state.values.recievedBy}
						onSelect={(empID) => form.setFieldValue("recievedBy", empID)}
					/>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="provide-date">Provided date *</Label>
						<form.Field
							name="providedDate"
							validators={{
								onChange: ({ value }) =>
									value ? undefined : "Provide date is required",
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="provide-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{fieldError(field.state.meta) && (
										<p className="text-xs font-medium text-destructive">
											{fieldError(field.state.meta)}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label>Provided by *</Label>
						<form.Field name="providedBy">
							{(field) => (
								<Select
									value={
										field.state.value > 0
											? String(field.state.value)
											: undefined
									}
									onValueChange={(value) =>
										field.handleChange(value ? Number(value) : 0)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select provider" />
									</SelectTrigger>
									<SelectContent>
										{users.map((user) => (
											<SelectItem key={user.id} value={String(user.id)}>
												{user.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>
				</div>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<Label htmlFor="provide-notes">Notes</Label>
				<form.Field name="notes">
					{(field) => (
						<Textarea
							id="provide-notes"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Optional notes…"
							rows={3}
						/>
					)}
				</form.Field>
			</div>

			<DialogFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting || createMutation.isPending}
						>
							{isSubmitting || createMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<PackageCheck />
							)}
							Save provide
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
