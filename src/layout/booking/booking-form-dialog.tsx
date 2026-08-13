"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { CalendarDays, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { BOOKING_PURPOSES, bookingToday } from "@/lib/booking-constants";
import { assetImageUrl } from "@/lib/assets-constants";
import { employeeImageUrl } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

const formSchema = z
	.object({
		empID: z.number().int().positive(),
		assetID: z.number().int().positive(),
		startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
		purpose: z.string().trim().min(1).max(100),
		otherInfo: z.string().trim().max(100),
	})
	.refine((data) => data.endDate >= data.startDate, {
		message: "End date must be on or after the start date",
		path: ["endDate"],
	});

type FormValues = {
	empID: number;
	empName: string;
	assetID: number;
	assetLabel: string;
	startDate: string;
	endDate: string;
	purpose: string;
	purposeCustom: string;
	otherInfo: string;
};

const emptyValues: FormValues = {
	empID: 0,
	empName: "",
	assetID: 0,
	assetLabel: "",
	startDate: bookingToday(),
	endDate: bookingToday(),
	purpose: "",
	purposeCustom: "",
	otherInfo: "",
};

export function BookingFormDialog({
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
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>New Asset Booking</DialogTitle>
					<DialogDescription>
						Reserve an available asset for an employee.
					</DialogDescription>
				</DialogHeader>
				<BookingFormContent
					key={open ? "open" : "closed"}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

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

function BookingFormContent({ onSuccess }: { onSuccess: () => void }) {
	const { data: employees = [] } = trpc.assets.employees.useQuery();
	const { data: assets = [] } = trpc.bookings.availableAssets.useQuery();
	const createMutation = trpc.bookings.create.useMutation();

	const [empOpen, setEmpOpen] = useState(false);
	const [empSearch, setEmpSearch] = useState("");
	const [assetOpen, setAssetOpen] = useState(false);
	const [assetSearch, setAssetSearch] = useState("");

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			const purpose =
				value.purpose === "Other" ? value.purposeCustom : value.purpose;
			const parsed = formSchema.safeParse({
				empID: value.empID,
				assetID: value.assetID,
				startDate: value.startDate,
				endDate: value.endDate,
				purpose,
				otherInfo: value.otherInfo,
			});
			if (!parsed.success) {
				const first = parsed.error.issues[0];
				toast.error(first?.message ?? "Please check the form fields");
				return;
			}
			try {
				await createMutation.mutateAsync({
					empID: value.empID,
					assetID: value.assetID,
					startDate: value.startDate,
					endDate: value.endDate,
					purpose,
					otherInfo: value.otherInfo.trim() || undefined,
				});
				toast.success("Asset booked successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create booking",
				);
			}
		},
	});

	const selectedEmployee = employees.find(
		(e) => e.empID === form.state.values.empID,
	);
	const employeeList = employees.filter((employee) => {
		const q = empSearch.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return (
			employee.name.toLowerCase().includes(q) ||
			String(employee.empID).includes(q)
		);
	});

	const selectedAsset = assets.find((a) => a.id === form.state.values.assetID);
	const assetList = assets.filter((asset) => {
		const q = assetSearch.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return [
			asset.code,
			asset.deviceName,
			asset.type,
			asset.manufacturer,
			asset.model,
			asset.location,
		]
			.filter(Boolean)
			.some((part) => String(part).toLowerCase().includes(q));
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			{/* Employee */}
			<div className="space-y-2">
				<Label>Employee *</Label>
				<Popover open={empOpen} onOpenChange={setEmpOpen}>
					<PopoverTrigger
						render={
							<Button variant="outline" className="w-full justify-between" />
						}
					>
						{selectedEmployee ? (
							<span className="flex min-w-0 items-center gap-2">
								<Avatar className="size-5 shrink-0">
									{employeeImageUrl(selectedEmployee.image) && (
										<AvatarImage
											src={
												employeeImageUrl(selectedEmployee.image) ?? undefined
											}
											alt={selectedEmployee.name}
										/>
									)}
									<AvatarFallback className="text-[9px]">
										{selectedEmployee.name[0]?.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="truncate">
									{selectedEmployee.name}{" "}
									<span className="text-muted-foreground">
										({selectedEmployee.empID})
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
								value={empSearch}
								onValueChange={setEmpSearch}
							/>
							<CommandList>
								<CommandEmpty>No employee found</CommandEmpty>
								<CommandGroup>
									{employeeList.map((employee) => (
										<CommandItem
											key={employee.empID}
											value={employee.name}
											data-checked={form.state.values.empID === employee.empID}
											onSelect={() => {
												form.setFieldValue("empID", employee.empID);
												form.setFieldValue("empName", employee.name);
												setEmpOpen(false);
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

			{/* Asset */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Asset *</Label>
					{assets.length === 0 && (
						<span className="text-xs text-muted-foreground">
							No assets available
						</span>
					)}
				</div>
				<Popover open={assetOpen} onOpenChange={setAssetOpen}>
					<PopoverTrigger
						render={
							<Button variant="outline" className="w-full justify-between" />
						}
					>
						{selectedAsset ? (
							<span className="flex min-w-0 items-center gap-2">
								<Avatar className="size-5 shrink-0">
									{assetImageUrl(selectedAsset.image) && (
										<AvatarImage
											src={assetImageUrl(selectedAsset.image) ?? undefined}
											alt={selectedAsset.deviceName ?? selectedAsset.code}
										/>
									)}
									<AvatarFallback className="text-[9px]">
										{selectedAsset.code[0]?.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="truncate font-mono">{selectedAsset.code}</span>
								<span className="truncate text-muted-foreground">
									{selectedAsset.deviceName ?? ""}
								</span>
								{selectedAsset.type && (
									<span className="inline-flex shrink-0 bg-muted px-1 py-px text-[10px] text-muted-foreground">
										{selectedAsset.type}
									</span>
								)}
							</span>
						) : (
							<span className="text-muted-foreground">
								Search available asset…
							</span>
						)}
						<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0" align="start">
						<Command shouldFilter={false}>
							<CommandInput
								placeholder="Search code / name / type…"
								value={assetSearch}
								onValueChange={setAssetSearch}
							/>
							<CommandList>
								<CommandEmpty>No available asset found</CommandEmpty>
								<CommandGroup>
									{assetList.map((asset) => (
										<CommandItem
											key={asset.id}
											value={asset.code}
											data-checked={form.state.values.assetID === asset.id}
											onSelect={() => {
												form.setFieldValue("assetID", asset.id);
												form.setFieldValue(
													"assetLabel",
													[
														asset.code,
														asset.deviceName,
														asset.type,
														asset.manufacturer,
														asset.model,
													]
														.filter(Boolean)
														.join(" - "),
												);
												setAssetOpen(false);
											}}
										>
											<Avatar className="size-9 shrink-0">
												{assetImageUrl(asset.image) && (
													<AvatarImage
														src={assetImageUrl(asset.image) ?? undefined}
														alt={asset.deviceName ?? asset.code}
													/>
												)}
												<AvatarFallback className="text-[10px]">
													{asset.code[0]?.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<p className="truncate font-mono">{asset.code}</p>
												<p className="truncate text-muted-foreground">
													{asset.deviceName ?? ""}
												</p>
												<p className="truncate text-[10px] text-muted-foreground">
													{[asset.manufacturer, asset.model]
														.filter(Boolean)
														.join(" ")}{" "}
													{asset.location ? ` • ${asset.location}` : ""}
												</p>
											</div>
											{asset.type && (
												<span
													className={cn(
														"inline-flex shrink-0 whitespace-nowrap bg-muted px-1 py-px text-[10px] text-muted-foreground",
													)}
												>
													{asset.type}
												</span>
											)}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			{/* Dates */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="start-date">Start Date *</Label>
					<form.Field
						name="startDate"
						validators={{
							onChange: ({ value }) => {
								if (!value) {
									return "Start date is required";
								}
								if (value < bookingToday()) {
									return "Start date cannot be in the past";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="start-date"
									type="date"
									min={bookingToday()}
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
					<Label htmlFor="end-date">End Date *</Label>
					<form.Field
						name="endDate"
						validators={{
							onChange: ({ value }) => {
								if (!value) {
									return "End date is required";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="end-date"
									type="date"
									min={form.state.values.startDate || bookingToday()}
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
			</div>

			{/* Purpose */}
			<div className="space-y-2">
				<Label>Purpose *</Label>
				<form.Field name="purpose">
					{(field) => (
						<div className="space-y-1.5">
							<Select
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value ?? "")}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select purpose" />
								</SelectTrigger>
								<SelectContent>
									{BOOKING_PURPOSES.map((purpose) => (
										<SelectItem key={purpose} value={purpose}>
											{purpose}
										</SelectItem>
									))}
									<SelectItem value="Other">Other…</SelectItem>
								</SelectContent>
							</Select>
							{fieldError(field.state.meta) && (
								<p className="text-xs font-medium text-destructive">
									{fieldError(field.state.meta)}
								</p>
							)}
						</div>
					)}
				</form.Field>
				{form.state.values.purpose === "Other" && (
					<form.Field name="purposeCustom">
						{(field) => (
							<Input
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter purpose…"
								maxLength={100}
								autoFocus
							/>
						)}
					</form.Field>
				)}
			</div>

			{/* Other info */}
			<div className="space-y-2">
				<Label htmlFor="other-info">Other Information</Label>
				<form.Field name="otherInfo">
					{(field) => (
						<Input
							id="other-info"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="e.g. collection from reception"
							maxLength={100}
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
								<CalendarDays />
							)}
							Book asset
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
