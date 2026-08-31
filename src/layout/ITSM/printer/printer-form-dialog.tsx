"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { printerImageUrl } from "@/lib/printer-constants";
import type { PrinterItem } from "@/server/routers/ITSM/printers";
import { trpc } from "@/trpc/react";

const printerFormSchema = z.object({
	name: z.string().trim().min(1, "Printer name is required").max(100),
	location: z.string().trim().min(1, "Location is required").max(100),
	usedBy: z.string().trim().min(1, "Used By is required").max(100),
	department: z.string().trim().max(100),
	printerLink: z.string().trim().max(50),
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

type PrinterFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	printer: PrinterItem | null;
	onSuccess: () => void;
};

export function PrinterFormDialog({
	open,
	onOpenChange,
	printer,
	onSuccess,
}: PrinterFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{printer ? `Edit Printer — ${printer.name}` : "Add New Printer"}
					</DialogTitle>
					<DialogDescription>
						{printer
							? "Update the details of this printer."
							: "Register a new printer in the inventory."}
					</DialogDescription>
				</DialogHeader>
				<PrinterFormContent
					key={printer?.id ?? "new"}
					printer={printer}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function PrinterFormContent({
	printer,
	onSuccess,
}: {
	printer: PrinterItem | null;
	onSuccess: () => void;
}) {
	const uploadImageMutation = trpc.printers.uploadImage.useMutation();
	const createMutation = trpc.printers.create.useMutation();
	const updateMutation = trpc.printers.update.useMutation();

	const [imageBusy, setImageBusy] = useState(false);

	const form = useForm({
		defaultValues: printer
			? {
					name: printer.name,
					location: printer.location,
					usedBy: printer.usedBy,
					department: printer.department ?? "",
					printerLink: printer.printerLink ?? "",
					rollPrinter: false,
					img: printer.img ?? "",
				}
			: {
					name: "",
					location: "",
					usedBy: "",
					department: "",
					printerLink: "",
					rollPrinter: false,
					img: "",
				},
		onSubmit: async ({ value }) => {
			try {
				if (printer) {
					await updateMutation.mutateAsync({
						id: printer.id,
						data: {
							name: value.name,
							location: value.location,
							usedBy: value.usedBy,
							department: clean(value.department),
							printerLink: clean(value.printerLink),
							img: clean(value.img),
						},
					});
					toast.success("Printer updated successfully");
				} else {
					await createMutation.mutateAsync({
						name: value.name,
						location: value.location,
						usedBy: value.usedBy,
						department: clean(value.department),
						printerLink: clean(value.printerLink),
						rollPrinter: value.rollPrinter,
						img: clean(value.img),
					});
					toast.success("Printer added successfully");
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save printer",
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
			form.setFieldValue("img", image);
			toast.success("Image uploaded");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Image upload failed",
			);
		} finally {
			setImageBusy(false);
		}
	};

	const previewImage = printerImageUrl(
		form.state.values.img || printer?.img || null,
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			<div className="space-y-2">
				<Label htmlFor="name">Name *</Label>
				<form.Field
					name="name"
					validators={{
						onChange: fieldValidator(printerFormSchema.shape.name),
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
								placeholder="Printer name"
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

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="location">Location *</Label>
					<form.Field
						name="location"
						validators={{
							onChange: fieldValidator(printerFormSchema.shape.location),
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="location"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
									placeholder="e.g. Head Office"
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
					<Label htmlFor="usedBy">Used By *</Label>
					<form.Field
						name="usedBy"
						validators={{
							onChange: fieldValidator(printerFormSchema.shape.usedBy),
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="usedBy"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
									placeholder="Department / person"
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
					<Label htmlFor="department">Department</Label>
					<form.Field name="department">
						{(field) => (
							<Input
								id="department"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={100}
								placeholder="Department"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="printerLink">Printer Link</Label>
					<form.Field name="printerLink">
						{(field) => (
							<Input
								id="printerLink"
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
			</div>

			{!printer && (
				<form.Field name="rollPrinter">
					{(field) => (
						<div className="flex items-center gap-2">
							<Checkbox
								id="rollPrinter"
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(!!checked)}
							/>
							<Label htmlFor="rollPrinter" className="font-normal">
								Roll Printer
							</Label>
						</div>
					)}
				</form.Field>
			)}

			<div className="space-y-2">
				<Label>Image</Label>
				<div className="flex items-start gap-3">
					{previewImage ? (
						<img
							src={previewImage}
							alt="Printer preview"
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
								document.getElementById("printerImageInput")?.click()
							}
						>
							{imageBusy ? <Loader2 className="animate-spin" /> : <Upload />}
							{imageBusy ? "Uploading…" : "Upload image"}
						</Button>
						<input
							id="printerImageInput"
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
							) : printer ? (
								"Save Changes"
							) : (
								"Add Printer"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}

function clean(value: string): string | null {
	return value.trim() === "" ? null : value;
}
