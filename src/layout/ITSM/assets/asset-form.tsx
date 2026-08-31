"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { ChevronsUpDown, Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	ASSET_DEPARTMENTS,
	ASSET_LOCATIONS,
	ASSET_TYPES,
	assetImageUrl,
} from "@/lib/assets-constants";
import type { AssetItem } from "@/server/routers/ITSM/assets";
import { trpc } from "@/trpc/react";

const assetFormSchema = z.object({
	code: z.string().min(1, "Code is required").max(10, "Max 10 characters"),
	serialNumber: z.string().min(1, "Serial number is required").max(50),
	type: z.string().min(1, "Type is required"),
});

type AssetFormValues = {
	code: string;
	type: string;
	location: string;
	department: string;
	empID: number;
	ownerName: string;
	deviceName: string;
	serialNumber: string;
	manufacturer: string;
	model: string;
	ip: string;
	firmwareVer: string;
	processor: string;
	os: string;
	memory: string;
	hdd: string;
	specification: string;
	image: string;
};

const emptyValues: AssetFormValues = {
	code: "",
	type: "",
	location: "",
	department: "",
	empID: 0,
	ownerName: "",
	deviceName: "",
	serialNumber: "",
	manufacturer: "",
	model: "",
	ip: "",
	firmwareVer: "",
	processor: "",
	os: "",
	memory: "",
	hdd: "",
	specification: "",
	image: "",
};

function clean(value: string): string | null {
	return value.trim() === "" ? null : value;
}

function fieldValidator(shape: z.ZodString) {
	return ({ value }: { value: string }) => {
		const res = shape.safeParse(value);
		return res.success ? undefined : res.error.issues[0]?.message;
	};
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

type AssetFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset: AssetItem | null;
	onSuccess: () => void;
};

export function AssetFormDialog({
	open,
	onOpenChange,
	asset,
	onSuccess,
}: AssetFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{asset ? `Edit Asset — ${asset.code}` : "Add New Asset"}
					</DialogTitle>
					<DialogDescription>
						{asset
							? "Update the details of this asset."
							: "Register a new asset in the inventory."}
					</DialogDescription>
				</DialogHeader>
				<AssetFormContent
					key={asset?.id ?? "new"}
					asset={asset}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function AssetFormContent({
	asset,
	onSuccess,
}: {
	asset: AssetItem | null;
	onSuccess: () => void;
}) {
	const { data: employees = [] } = trpc.assets.employees.useQuery();
	const generateCodeMutation = trpc.assets.generateCode.useMutation();
	const uploadImageMutation = trpc.assets.uploadImage.useMutation();
	const createMutation = trpc.assets.create.useMutation();
	const updateMutation = trpc.assets.update.useMutation();

	const [imageBusy, setImageBusy] = useState(false);
	const [ownerOpen, setOwnerOpen] = useState(false);
	const [ownerSearch, setOwnerSearch] = useState("");

	const form = useForm({
		defaultValues: asset
			? {
					code: asset.code,
					type: asset.type ?? "",
					location: asset.location ?? "",
					department: asset.department ?? "",
					empID: asset.empID ?? 0,
					ownerName: asset.owner ?? "",
					deviceName: asset.deviceName ?? "",
					serialNumber: asset.serialNumber,
					manufacturer: asset.manufacturer ?? "",
					model: asset.model ?? "",
					ip: asset.ip ?? "",
					firmwareVer: asset.firmwareVer ?? "",
					processor: asset.processor ?? "",
					os: asset.os ?? "",
					memory: asset.memory ?? "",
					hdd: asset.hdd ?? "",
					specification: asset.specification ?? "",
					image: asset.image ?? "",
				}
			: emptyValues,
		onSubmit: async ({ value }) => {
			try {
				if (asset) {
					await updateMutation.mutateAsync({
						id: asset.id,
						data: {
							code: value.code,
							type: value.type,
							location: clean(value.location),
							department: clean(value.department),
							deviceName: clean(value.deviceName),
							serialNumber: value.serialNumber,
							manufacturer: clean(value.manufacturer),
							model: clean(value.model),
							ip: clean(value.ip),
							firmwareVer: clean(value.firmwareVer),
							processor: clean(value.processor),
							os: clean(value.os),
							memory: clean(value.memory),
							hdd: clean(value.hdd),
							specification: clean(value.specification),
							image: clean(value.image),
							empID: value.empID || 0,
						},
					});
					toast.success("Asset updated successfully");
				} else {
					await createMutation.mutateAsync({
						code: value.code,
						type: value.type,
						location: clean(value.location),
						department: clean(value.department),
						deviceName: clean(value.deviceName),
						serialNumber: value.serialNumber,
						manufacturer: clean(value.manufacturer),
						model: clean(value.model),
						ip: clean(value.ip),
						firmwareVer: clean(value.firmwareVer),
						processor: clean(value.processor),
						os: clean(value.os),
						memory: clean(value.memory),
						hdd: clean(value.hdd),
						specification: clean(value.specification),
						image: clean(value.image),
						empID: value.empID || 0,
					});
					toast.success("Asset added successfully");
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save asset",
				);
			}
		},
	});

	const handleGenerateCode = async () => {
		try {
			const { code } = await generateCodeMutation.mutateAsync();
			form.setFieldValue("code", code);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to generate code",
			);
		}
	};

	const handleFile = async (file?: File) => {
		if (!file) {
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file");
			return;
		}
		setImageBusy(true);
		try {
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = () => reject(new Error("Could not read the file"));
				reader.readAsDataURL(file);
			});
			const { image } = await uploadImageMutation.mutateAsync({ dataUrl });
			form.setFieldValue("image", image);
			toast.success("Image uploaded");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Image upload failed",
			);
		} finally {
			setImageBusy(false);
		}
	};

	const previewImage = assetImageUrl(
		form.state.values.image || asset?.image || null,
	);
	const selectedOwner = employees.find(
		(e) => e.empID === form.state.values.empID,
	);
	const ownerList = employees.filter((employee) => {
		const q = ownerSearch.trim().toLowerCase();
		if (!q) {
			return true;
		}
		return (
			employee.name.toLowerCase().includes(q) ||
			String(employee.empID).includes(q)
		);
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Code */}
			<div className="space-y-2">
				<Label htmlFor="code">Code *</Label>
				<form.Field
					name="code"
					validators={{ onChange: fieldValidator(assetFormSchema.shape.code) }}
				>
					{(field) => (
						<div className="space-y-1.5">
							<div className="flex gap-2">
								<Input
									id="code"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(e.target.value.toUpperCase())
									}
									maxLength={10}
									placeholder="Auto-generated or manual"
									className="font-mono uppercase"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleGenerateCode}
									disabled={generateCodeMutation.isPending}
									title="Generate unique code"
								>
									{generateCodeMutation.isPending ? (
										<Loader2 className="animate-spin" />
									) : (
										<RefreshCw />
									)}
									Generate
								</Button>
							</div>
							{fieldError(field.state.meta) && (
								<p className="text-xs font-medium text-destructive">
									{fieldError(field.state.meta)}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</div>

			{/* General Information */}
			<div className="space-y-3">
				<h4 className="border-b pb-1 text-sm font-semibold">
					General Information
				</h4>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Device Type *</Label>
						<form.Field
							name="type"
							validators={{
								onChange: fieldValidator(assetFormSchema.shape.type),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value ?? "")}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{ASSET_TYPES.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
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
					</div>

					<div className="space-y-2">
						<Label>Location</Label>
						<form.Field name="location">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value ?? "")}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select location" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">—</SelectItem>
										{ASSET_LOCATIONS.map((location) => (
											<SelectItem key={location} value={location}>
												{location}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Department</Label>
						<form.Field name="department">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value ?? "")}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">—</SelectItem>
										{ASSET_DEPARTMENTS.map((department) => (
											<SelectItem key={department} value={department}>
												{department}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Owner</Label>
						<Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
							<PopoverTrigger
								render={
									<Button
										variant="outline"
										className="w-full justify-between"
									/>
								}
							>
								{selectedOwner ? (
									<span className="truncate">
										{selectedOwner.name}{" "}
										<span className="text-muted-foreground">
											({selectedOwner.empID})
										</span>
									</span>
								) : (
									<span className="text-muted-foreground">
										Search employee…
									</span>
								)}
								<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
							</PopoverTrigger>
							<PopoverContent className="w-72 p-0">
								<Command shouldFilter={false}>
									<CommandInput
										placeholder="Search name / ID…"
										value={ownerSearch}
										onValueChange={setOwnerSearch}
									/>
									<CommandList>
										<CommandEmpty>No employee found</CommandEmpty>
										<CommandGroup>
											{ownerList.map((employee) => (
												<CommandItem
													key={employee.empID}
													value={employee.name}
													data-checked={
														form.state.values.empID === employee.empID
													}
													onSelect={() => {
														form.setFieldValue("empID", employee.empID);
														form.setFieldValue("ownerName", employee.name);
														setOwnerOpen(false);
													}}
												>
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
				</div>
			</div>

			{/* Device Information */}
			<div className="space-y-3">
				<h4 className="border-b pb-1 text-sm font-semibold">
					Device Information
				</h4>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field
						name="deviceName"
						validators={{ onChange: fieldValidator(z.string().max(50)) }}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="deviceName">Device Name</Label>
								<Input
									id="deviceName"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. DELL-001"
								/>
							</div>
						)}
					</form.Field>

					<div className="space-y-2">
						<Label htmlFor="serialNumber">Serial Number *</Label>
						<form.Field
							name="serialNumber"
							validators={{
								onChange: fieldValidator(assetFormSchema.shape.serialNumber),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="serialNumber"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Serial number"
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

					<form.Field name="manufacturer">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="manufacturer">Manufacturer</Label>
								<Input
									id="manufacturer"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. Dell, HP, Cisco"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="model">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="model">Model</Label>
								<Input
									id="model"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Model"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="ip">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="ip">IP Address</Label>
								<Input
									id="ip"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="192.168.0.1"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="firmwareVer">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="firmwareVer">Firmware Version</Label>
								<Input
									id="firmwareVer"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Firmware version"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Computer Information */}
			<div className="space-y-3">
				<h4 className="border-b pb-1 text-sm font-semibold">
					Computer Information
				</h4>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field name="processor">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="processor">Processor</Label>
								<Input
									id="processor"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Processor"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="os">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="os">Operating System</Label>
								<Input
									id="os"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Windows 11, Ubuntu…"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="memory">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="memory">Memory</Label>
								<Input
									id="memory"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. 16 GB"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="hdd">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="hdd">Hard Disk</Label>
								<Input
									id="hdd"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. 512 GB SSD"
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Other Information */}
			<div className="space-y-3">
				<h4 className="border-b pb-1 text-sm font-semibold">
					Other Information
				</h4>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="specification">Other Specifications</Label>
						<form.Field name="specification">
							{(field) => (
								<Textarea
									id="specification"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Additional specifications…"
									className="min-h-24"
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Image</Label>
						<div className="flex items-start gap-3">
							{previewImage ? (
								<img
									src={previewImage}
									alt="Asset preview"
									className="h-24 w-32 shrink-0 object-cover"
								/>
							) : (
								<div className="flex h-24 w-32 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
									No image
								</div>
							)}
							<div className="flex-1 space-y-1.5">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="w-full"
									disabled={imageBusy}
									onClick={() =>
										document.getElementById("assetImageInput")?.click()
									}
								>
									{imageBusy ? (
										<Loader2 className="animate-spin" />
									) : (
										<Upload />
									)}
									{imageBusy ? "Uploading…" : "Upload image"}
								</Button>
								<input
									id="assetImageInput"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => handleFile(e.target.files?.[0])}
								/>
								<p className="text-xs text-muted-foreground">
									PNG, JPG or WebP up to 5 MB.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<DialogFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting || imageBusy}
						>
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : asset ? (
								"Save Changes"
							) : (
								"Add Asset"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
