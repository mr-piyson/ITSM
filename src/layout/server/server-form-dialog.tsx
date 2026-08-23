"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { provideToday } from "@/lib/provide-constants";
import {
	periodLabel,
	MAINTENANCE_PERIODS,
	SERVER_STATUSES,
	SERVER_TYPES,
	serverImageUrl,
	type MaintenancePeriod,
} from "@/lib/server-constants";
import type { ServerItem } from "@/server/routers/servers";
import { trpc } from "@/trpc/react";

const serverFormSchema = z.object({
	name: z.string().trim().min(1, "Server name is required").max(100),
});

const fieldValidator =
	(shape: z.ZodString) =>
	({ value }: { value: string }) => {
		const res = shape.safeParse(value);
		return res.success ? undefined : res.error.issues[0]?.message;
	};

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

// Best-effort recovery of the maintenance period from stored dates (legacy does not store it).
function derivePeriod(
	last: string | null,
	due: string | null,
): MaintenancePeriod {
	if (!last || !due || !/^\d{4}-\d{2}-\d{2}$/.test(last)) {
		return "30days";
	}
	const lastMs = Date.parse(`${last}T00:00:00Z`);
	const dueMs = Date.parse(`${due}T00:00:00Z`);
	if (Number.isNaN(lastMs) || Number.isNaN(dueMs)) {
		return "30days";
	}
	const diff = Math.round((dueMs - lastMs) / 86_400_000);
	if (diff > 75) {
		return "90days";
	}
	if (diff > 45) {
		return "60days";
	}
	return "30days";
}

type ServerFormValues = {
	name: string;
	type: (typeof SERVER_TYPES)[number];
	serverStatus: (typeof SERVER_STATUSES)[number];
	host: "VMHost 1" | "VMHost 2";
	hostIP: string;
	serverIP: string;
	os: string;
	cpu: string;
	ram: string;
	maintenanceLast: string;
	nextPeriod: MaintenancePeriod;
	diskAmount: number;
	disk: string;
	disk2: string;
	diskType: string;
	diskType2: string;
	location: string;
	location2: string;
	backupStatus: "yes" | "no";
	backupSoftware: string;
	applications: string;
	descrip: string;
	notes: string;
	image: string;
};

type ServerFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	server: ServerItem | null;
	onSuccess: () => void;
};

export function ServerFormDialog({
	open,
	onOpenChange,
	server,
	onSuccess,
}: ServerFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>
						{server ? `Edit Server — ${server.name}` : "Add New Server"}
					</DialogTitle>
					<DialogDescription>
						{server
							? "Update the details of this server."
							: "Register a new server in the inventory."}
					</DialogDescription>
				</DialogHeader>
				<ServerFormContent
					key={server?.id ?? "new"}
					server={server}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function ServerFormContent({
	server,
	onSuccess,
}: {
	server: ServerItem | null;
	onSuccess: () => void;
}) {
	const uploadImageMutation = trpc.servers.uploadImage.useMutation();
	const createMutation = trpc.servers.create.useMutation();
	const updateMutation = trpc.servers.update.useMutation();

	const [imageBusy, setImageBusy] = useState(false);

	const defaults: ServerFormValues = server
		? {
				name: server.name,
				type: server.type === "physical" ? "physical" : "virtual",
				serverStatus:
					server.serverStatus === "discontinued" ? "discontinued" : "active",
				host: server.host === "VMHost 2" ? "VMHost 2" : "VMHost 1",
				hostIP: server.hostIP ?? "",
				serverIP: server.serverIP ?? "",
				os: server.os ?? "",
				cpu: server.cpu ?? "",
				ram: server.ram ?? "",
				maintenanceLast: server.maintenanceLast ?? provideToday(),
				nextPeriod: derivePeriod(server.maintenanceLast, server.maintenanceDue),
				diskAmount: server.diskAmount === 2 ? 2 : 1,
				disk: server.disk ?? "",
				disk2: server.disk2 ?? "",
				diskType: server.diskType ?? "",
				diskType2: server.diskType2 ?? "",
				location: server.location ?? "",
				location2: server.location2 ?? "",
				backupStatus: server.backupStatus === "no" ? "no" : "yes",
				backupSoftware: server.backupSoftware ?? "",
				applications: server.applications ?? "",
				descrip: server.descrip ?? "",
				notes: server.notes ?? "",
				image: server.image ?? "",
			}
		: {
				name: "",
				type: "virtual",
				serverStatus: "active",
				host: "VMHost 1",
				hostIP: "",
				serverIP: "",
				os: "",
				cpu: "",
				ram: "",
				maintenanceLast: provideToday(),
				nextPeriod: "30days",
				diskAmount: 1,
				disk: "",
				disk2: "",
				diskType: "",
				diskType2: "",
				location: "",
				location2: "",
				backupStatus: "yes",
				backupSoftware: "",
				applications: "",
				descrip: "",
				notes: "",
				image: "",
			};

	const form = useForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			try {
				if (server) {
					await updateMutation.mutateAsync({
						id: server.id,
						data: value,
					});
					toast.success("Server updated successfully");
				} else {
					await createMutation.mutateAsync(value);
					toast.success("Server added successfully");
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save server",
				);
			}
		},
	});

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

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{/* General */}
				<section className="space-y-3">
					<h4 className="text-sm font-semibold">General</h4>

					<div className="space-y-2">
						<Label>Type</Label>
						<form.Field name="type">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(
											value === "physical" ? "physical" : "virtual",
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SERVER_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type === "virtual" ? "Virtual" : "Physical"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Server Status</Label>
						<form.Field name="serverStatus">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(
											value === "discontinued" ? "discontinued" : "active",
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SERVER_STATUSES.map((status) => (
											<SelectItem key={status} value={status}>
												{status === "active" ? "Active" : "Discontinued"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Host</Label>
						<form.Field name="host">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(
											value === "VMHost 2" ? "VMHost 2" : "VMHost 1",
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{["VMHost 1", "VMHost 2"].map((host) => (
											<SelectItem key={host} value={host}>
												{host}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="hostIP">Host IP</Label>
						<form.Field name="hostIP">
							{(field) => (
								<Input
									id="hostIP"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={50}
									placeholder="192.168.0.10"
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="maintenanceLast">Last Maintenance</Label>
						<form.Field name="maintenanceLast">
							{(field) => (
								<Input
									id="maintenanceLast"
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Next Maintenance Period</Label>
						<form.Field name="nextPeriod">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange((value ?? "30days") as MaintenancePeriod)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{MAINTENANCE_PERIODS.map((period) => (
											<SelectItem key={period} value={period}>
												{periodLabel(period)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>
				</section>

				{/* Specs */}
				<section className="space-y-3">
					<h4 className="text-sm font-semibold">Specs</h4>

					<div className="space-y-2">
						<Label htmlFor="name">VMware Server Name *</Label>
						<form.Field
							name="name"
							validators={{
								onChange: fieldValidator(serverFormSchema.shape.name),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="name"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										maxLength={100}
										placeholder="Server name"
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
						<Label htmlFor="serverIP">VMware Server IP Address</Label>
						<form.Field name="serverIP">
							{(field) => (
								<Input
									id="serverIP"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={50}
									placeholder="192.168.0.20"
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="os">OS</Label>
						<form.Field name="os">
							{(field) => (
								<Input
									id="os"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
									placeholder="Windows Server 2022"
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cpu">CPU</Label>
						<form.Field name="cpu">
							{(field) => (
								<Input
									id="cpu"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={50}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="ram">RAM</Label>
						<form.Field name="ram">
							{(field) => (
								<Input
									id="ram"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={50}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="applications">Applications</Label>
						<form.Field name="applications">
							{(field) => (
								<Input
									id="applications"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="descrip">Description</Label>
						<form.Field name="descrip">
							{(field) => (
								<Textarea
									id="descrip"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={200}
									className="resize-none"
									rows={3}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<form.Field name="notes">
							{(field) => (
								<Textarea
									id="notes"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={200}
									className="resize-none"
									rows={3}
								/>
							)}
						</form.Field>
					</div>
				</section>

				{/* Storage */}
				<section className="space-y-3">
					<h4 className="text-sm font-semibold">Storage & Backup</h4>

					<div className="space-y-2">
						<Label>Number of Disks</Label>
						<form.Field name="diskAmount">
							{(field) => (
								<Select
									value={String(field.state.value)}
									onValueChange={(value) =>
										field.handleChange(value === "2" ? 2 : 1)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">1</SelectItem>
										<SelectItem value="2">2</SelectItem>
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<form.Subscribe selector={(state) => state.values.diskAmount}>
						{(diskAmount) =>
							diskAmount === 1 ? (
								<>
									<div className="space-y-2">
										<Label htmlFor="disk">Disk Size</Label>
										<form.Field name="disk">
											{(field) => (
												<Input
													id="disk"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													maxLength={50}
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label htmlFor="diskType">Disk Type</Label>
										<form.Field name="diskType">
											{(field) => (
												<Input
													id="diskType"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													maxLength={50}
												/>
											)}
										</form.Field>
									</div>
									<div className="space-y-2">
										<Label htmlFor="location">Storage Location</Label>
										<form.Field name="location">
											{(field) => (
												<Input
													id="location"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													maxLength={50}
												/>
											)}
										</form.Field>
									</div>
								</>
							) : (
								<>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label htmlFor="disk">Disk 1 Size</Label>
											<form.Field name="disk">
												{(field) => (
													<Input
														id="disk"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
										<div className="space-y-2">
											<Label htmlFor="disk2">Disk 2 Size</Label>
											<form.Field name="disk2">
												{(field) => (
													<Input
														id="disk2"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
										<div className="space-y-2">
											<Label htmlFor="diskType">Disk 1 Type</Label>
											<form.Field name="diskType">
												{(field) => (
													<Input
														id="diskType"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
										<div className="space-y-2">
											<Label htmlFor="diskType2">Disk 2 Type</Label>
											<form.Field name="diskType2">
												{(field) => (
													<Input
														id="diskType2"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label htmlFor="location">Storage 1 Location</Label>
											<form.Field name="location">
												{(field) => (
													<Input
														id="location"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
										<div className="space-y-2">
											<Label htmlFor="location2">Storage 2 Location</Label>
											<form.Field name="location2">
												{(field) => (
													<Input
														id="location2"
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														maxLength={50}
													/>
												)}
											</form.Field>
										</div>
									</div>
								</>
							)
						}
					</form.Subscribe>

					<div className="space-y-2">
						<Label>Backup</Label>
						<form.Field name="backupStatus">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value === "no" ? "no" : "yes")
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="yes">Yes</SelectItem>
										<SelectItem value="no">No</SelectItem>
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label htmlFor="backupSoftware">Backup Software</Label>
						<form.Field name="backupSoftware">
							{(field) => (
								<Input
									id="backupSoftware"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={50}
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Image</Label>
						<div className="flex items-start gap-3">
							<ImagePreview image={form.state.values.image} />
							<div className="flex-1 space-y-1.5">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="w-full"
									disabled={imageBusy}
									onClick={() =>
										document.getElementById("serverImageInput")?.click()
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
									id="serverImageInput"
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
				</section>
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
							) : server ? (
								"Save Changes"
							) : (
								"Add Server"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}

function ImagePreview({ image }: { image: string }) {
	const imageUrl = serverImageUrl(image);
	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt="Server preview"
				className="h-24 w-32 shrink-0 object-contain"
			/>
		);
	}
	return (
		<div className="flex h-24 w-32 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
			No image
		</div>
	);
}
