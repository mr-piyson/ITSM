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
import { ITEM_CATEGORIES, itemImageUrl } from "@/lib/stock-constants";
import type { StockItem } from "@/server/routers/ITSM/stock";
import { trpc } from "@/trpc/react";

const stockFormSchema = z.object({
	name: z.string().trim().min(1, "Item name is required").max(100),
	brand: z.string().trim().max(100),
	category: z.string().trim().min(1, "Category is required").max(100),
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

type StockFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: StockItem | null;
	onSuccess: () => void;
};

export function StockFormDialog({
	open,
	onOpenChange,
	item,
	onSuccess,
}: StockFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{item ? `Edit Item — ${item.name}` : "Add New Item"}
					</DialogTitle>
					<DialogDescription>
						{item
							? "Update the details of this stock item."
							: "Register a new item in the stock inventory."}
					</DialogDescription>
				</DialogHeader>
				<StockFormContent
					key={item?.id ?? "new"}
					item={item}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function StockFormContent({
	item,
	onSuccess,
}: {
	item: StockItem | null;
	onSuccess: () => void;
}) {
	const uploadImageMutation = trpc.stock.uploadImage.useMutation();
	const createMutation = trpc.stock.create.useMutation();
	const updateMutation = trpc.stock.update.useMutation();

	const [imageBusy, setImageBusy] = useState(false);

	const form = useForm({
		defaultValues: item
			? {
					name: item.name,
					brand: item.brand,
					stock: String(item.stock),
					category: item.category || ITEM_CATEGORIES[0],
					img: item.img,
				}
			: {
					name: "",
					brand: "",
					stock: "0",
					category: ITEM_CATEGORIES[0],
					img: "",
				},
		onSubmit: async ({ value }) => {
			const parsed = stockFormSchema.safeParse({
				name: value.name,
				brand: value.brand,
				category: value.category,
			});
			if (!parsed.success) {
				toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
				return;
			}

			const stock = Number(value.stock);
			if (!Number.isInteger(stock) || stock < 0) {
				toast.error("Stock must be a whole number of 0 or more");
				return;
			}

			try {
				if (item) {
					await updateMutation.mutateAsync({
						id: item.id,
						data: {
							name: value.name.trim(),
							brand: value.brand.trim() || undefined,
							stock,
							category: value.category,
							img: value.img || undefined,
						},
					});
					toast.success("Item updated successfully");
				} else {
					await createMutation.mutateAsync({
						name: value.name.trim(),
						brand: value.brand.trim() || undefined,
						stock,
						category: value.category,
						img: value.img || undefined,
					});
					toast.success("Item added successfully");
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save item",
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

	const previewImage = itemImageUrl(form.state.values.img || item?.img || null);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="item-name">Name *</Label>
					<form.Field
						name="name"
						validators={{
							onChange: fieldValidator(stockFormSchema.shape.name),
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="item-name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
									placeholder="Item name"
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
					<Label htmlFor="item-brand">Brand</Label>
					<form.Field name="brand">
						{(field) => (
							<Input
								id="item-brand"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={100}
								placeholder="e.g. HP"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="item-stock">Stock *</Label>
					<form.Field name="stock">
						{(field) => (
							<Input
								id="item-stock"
								type="number"
								min={0}
								step={1}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label>Category *</Label>
					<form.Subscribe selector={(state) => state.values.category}>
						{(category) => (
							<Select
								value={category}
								onValueChange={(value) =>
									form.setFieldValue("category", value ?? ITEM_CATEGORIES[0])
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{ITEM_CATEGORIES.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</form.Subscribe>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Image</Label>
				<div className="flex items-start gap-3">
					{previewImage ? (
						<img
							src={previewImage}
							alt="Item preview"
							className="size-24 shrink-0 border bg-background object-contain"
						/>
					) : (
						<div className="flex size-24 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
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
								document.getElementById("stockItemImageInput")?.click()
							}
						>
							{imageBusy ? <Loader2 className="animate-spin" /> : <Upload />}
							{imageBusy ? "Uploading…" : "Upload image"}
						</Button>
						<input
							id="stockItemImageInput"
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
							{isSubmitting || imageBusy ? (
								<Loader2 className="animate-spin" />
							) : null}
							{item ? "Save Changes" : "Add Item"}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
