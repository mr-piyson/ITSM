"use client";

import { useRef, useState } from "react";

import { Loader2, Plus, Trash2, Upload } from "lucide-react";
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
	CONTACT_TYPES,
	vendorImageUrl,
	type ContactType,
} from "@/lib/vendor-constants";
import { ResponsiveOverlay } from "@/layout/ITSM/contracts/responsive-overlay";
import type { Vendor } from "@/server/routers/ITSM/vendors";
import { trpc } from "@/trpc/react";

export type CreatedVendor = {
	id: number;
	name: string;
	notes: string;
};

type VendorFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	vendor: Vendor | null;
	onSuccess?: () => void;
	onCreated?: (vendor: CreatedVendor) => void;
};

const VALUE_LABELS: Record<ContactType, string> = {
	mobile: "Phone",
	email: "Email",
	other: "Contact",
};

export function VendorFormDialog(props: VendorFormDialogProps) {
	return (
		<VendorFormContent
			key={`${props.vendor?.id ?? "new"}-${props.open}`}
			{...props}
		/>
	);
}

type FormContactRow = {
	rowId: number;
	type: ContactType;
	position: string;
	name: string;
	value: string;
};

function VendorFormContent({
	open,
	onOpenChange,
	vendor,
	onSuccess,
	onCreated,
}: VendorFormDialogProps) {
	const utils = trpc.useUtils();
	const uploadImageMutation = trpc.vendors.uploadImage.useMutation();
	const createMutation = trpc.vendors.create.useMutation();
	const updateMutation = trpc.vendors.update.useMutation();

	const nextRowIdRef = useRef(1);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const createContactRow = (): FormContactRow => ({
		rowId: nextRowIdRef.current++,
		type: "mobile",
		position: "",
		name: "",
		value: "",
	});

	const [name, setName] = useState(vendor?.name ?? "");
	const [notes, setNotes] = useState(vendor?.notes ?? "");
	const [image, setImage] = useState(vendor?.image ?? "");
	const [imageBusy, setImageBusy] = useState(false);
	const [contacts, setContacts] = useState<FormContactRow[]>(
		vendor && vendor.contacts.length > 0
			? vendor.contacts.map((contact) => ({
					rowId: nextRowIdRef.current++,
					type: (CONTACT_TYPES as readonly string[]).includes(
						contact.contactType,
					)
						? (contact.contactType as ContactType)
						: "other",
					position: contact.personPosition ?? "",
					name: contact.contactName,
					value: contact.contact,
				}))
			: [createContactRow()],
	);

	const isSaving =
		createMutation.isPending || updateMutation.isPending || imageBusy;

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

		const contactPayload = contacts.map((contact) => ({
			type: contact.type,
			position: contact.position.trim() || undefined,
			name: contact.name.trim(),
			value: contact.value.trim(),
		}));

		try {
			if (vendor) {
				await updateMutation.mutateAsync({
					id: vendor.id,
					data: {
						name: name.trim(),
						notes: notes.trim() || undefined,
						image: image || undefined,
						contacts: contactPayload,
					},
				});
				toast.success("Vendor updated successfully");
				utils.vendors.list.invalidate();
				utils.purchases.vendors.invalidate();
				onSuccess?.();
				onOpenChange(false);
			} else {
				const result = await createMutation.mutateAsync({
					name: name.trim(),
					notes: notes.trim() || undefined,
					contacts: contactPayload,
				});
				toast.success("Vendor added successfully");
				utils.vendors.list.invalidate();
				utils.purchases.vendors.invalidate();
				onCreated?.({
					id: result.vendor.id,
					name: result.vendor.name,
					notes: result.vendor.notes ?? "",
				});
				onOpenChange(false);
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save vendor",
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
			const { image: uploaded } = await uploadImageMutation.mutateAsync({
				dataUrl,
			});
			setImage(uploaded);
			toast.success("Logo uploaded");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Image upload failed",
			);
		} finally {
			setImageBusy(false);
		}
	};

	const previewImage = vendorImageUrl(image || null);

	return (
		<ResponsiveOverlay
			open={open}
			onOpenChange={onOpenChange}
			title={vendor ? `Edit Vendor — ${vendor.name}` : "Add New Vendor"}
			description={
				vendor
					? "Update the details and contacts of this vendor."
					: "Register a new vendor record."
			}
			footer={
				<>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" form="vendor-form" disabled={isSaving}>
						{isSaving ? <Loader2 className="animate-spin" /> : <Plus />}
						{vendor ? "Save Changes" : "Add Vendor"}
					</Button>
				</>
			}
		>
			<form
				id="vendor-form"
				onSubmit={(e) => {
					e.preventDefault();
					void handleSubmit();
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<Label htmlFor="vendor-name">Name *</Label>
					<Input
						id="vendor-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						maxLength={150}
						placeholder="Vendor name"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="vendor-notes">Notes</Label>
					<Textarea
						id="vendor-notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={3}
						placeholder="Optional notes…"
					/>
				</div>

				<div className="space-y-2">
					<Label>Logo</Label>
					<div className="flex items-start gap-3">
						{previewImage ? (
							<img
								src={previewImage}
								alt="Vendor logo preview"
								className="size-16 shrink-0 border bg-background object-contain"
							/>
						) : (
							<div className="flex size-16 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
								No logo
							</div>
						)}
						<div className="flex-1 space-y-1.5">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-full sm:w-auto"
								disabled={imageBusy}
								onClick={() => fileInputRef.current?.click()}
							>
								{imageBusy ? <Loader2 className="animate-spin" /> : <Upload />}
								{imageBusy ? "Uploading…" : "Upload logo"}
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									void handleFile(e.target.files?.[0]);
									e.target.value = "";
								}}
							/>
							<p className="text-xs text-muted-foreground">
								PNG, JPG or WebP up to 5 MB.
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label>Contacts</Label>
					<div className="space-y-2">
						{contacts.map((contact) => (
							<div key={contact.rowId} className="space-y-2 border p-2.5">
								<div className="flex items-center gap-2">
									<Select
										value={contact.type}
										onValueChange={(value) =>
											updateContact(contact.rowId, {
												type: (value ?? "other") as ContactType,
											})
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{CONTACT_TYPES.map((option) => (
												<SelectItem key={option} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										title="Remove contact"
										className="ml-auto"
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
								<div className="grid gap-2 sm:grid-cols-3">
									<div className="space-y-1">
										<Label
											htmlFor={`vendor-contact-position-${contact.rowId}`}
											className="text-xs text-muted-foreground"
										>
											Position
										</Label>
										<Input
											id={`vendor-contact-position-${contact.rowId}`}
											value={contact.position}
											onChange={(e) =>
												updateContact(contact.rowId, {
													position: e.target.value,
												})
											}
											maxLength={100}
											placeholder="Position"
										/>
									</div>
									<div className="space-y-1">
										<Label
											htmlFor={`vendor-contact-name-${contact.rowId}`}
											className="text-xs text-muted-foreground"
										>
											Name
										</Label>
										<Input
											id={`vendor-contact-name-${contact.rowId}`}
											value={contact.name}
											onChange={(e) =>
												updateContact(contact.rowId, { name: e.target.value })
											}
											maxLength={100}
											placeholder="Name"
										/>
									</div>
									<div className="space-y-1">
										<Label
											htmlFor={`vendor-contact-value-${contact.rowId}`}
											className="text-xs text-muted-foreground"
										>
											{VALUE_LABELS[contact.type]}
										</Label>
										<Input
											id={`vendor-contact-value-${contact.rowId}`}
											value={contact.value}
											onChange={(e) =>
												updateContact(contact.rowId, { value: e.target.value })
											}
											maxLength={100}
											placeholder={VALUE_LABELS[contact.type]}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setContacts((prev) => [...prev, createContactRow()])}
					>
						<Plus data-icon="inline-start" />
						Add more
					</Button>
				</div>
			</form>
		</ResponsiveOverlay>
	);
}
