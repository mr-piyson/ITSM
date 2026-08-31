"use client";

import { useEffect, useState } from "react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { employeeImageUrl } from "@/lib/employees-constants";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";
import { trpc } from "@/trpc/react";

const formSchema = z.object({
	empID: z.coerce.number().int().positive("ID is required"),
	name: z.string().trim().min(1, "Name is required").max(100),
	email: z.string().max(100).nullable().optional(),
	image: z.string().max(200).nullable().optional(),
});

function fieldValidator(shape: z.ZodType) {
	return ({ value }: { value: string }) => {
		const res = shape.safeParse(value);
		return res.success
			? undefined
			: (res.error.issues[0]?.message ?? undefined);
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

type EmployeeFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee: EmployeeItem | null;
	onSuccess: () => void;
};

export function EmployeeFormDialog({
	open,
	onOpenChange,
	employee,
	onSuccess,
}: EmployeeFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{employee
							? `Edit Employee — ${employee.empID}`
							: "Add New Employee"}
					</DialogTitle>
					<DialogDescription>
						{employee
							? "Update the details of this employee."
							: "Register a new staff or non-staff employee."}
					</DialogDescription>
				</DialogHeader>
				<EmployeeFormContent
					key={employee?.empID ?? "new"}
					employee={employee}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function EmployeeFormContent({
	employee,
	onSuccess,
}: {
	employee: EmployeeItem | null;
	onSuccess: () => void;
}) {
	const isEdit = !!employee;
	const [staffType, setStaffType] = useState<"Staff" | "nonStaff">(
		employee ? (employee.empID > 100000 ? "nonStaff" : "Staff") : "nonStaff",
	);

	const { data: nextNonStaffId } = trpc.employees.nextNonStaffId.useQuery(
		undefined,
		{ enabled: !isEdit },
	);
	const createMutation = trpc.employees.create.useMutation();
	const updateMutation = trpc.employees.update.useMutation();
	const uploadImageMutation = trpc.employees.uploadImage.useMutation();

	const [imageBusy, setImageBusy] = useState(false);

	const form = useForm({
		defaultValues: employee
			? {
					empID: String(employee.empID),
					name: employee.name,
					email: employee.email ?? "",
					image: employee.image ?? "",
				}
			: {
					empID: "",
					name: "",
					email: "",
					image: "",
				},
		onSubmit: async ({ value }) => {
			try {
				if (employee) {
					await updateMutation.mutateAsync({
						empID: employee.empID,
						name: value.name,
						email: value.email.trim() === "" ? null : value.email.trim(),
						image: value.image.trim() === "" ? null : value.image.trim(),
					});
					toast.success("Employee updated successfully");
				} else {
					await createMutation.mutateAsync({
						empID: Number(value.empID),
						name: value.name,
					});
					toast.success("Employee added successfully");
				}
				onSuccess();
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to save employee";
				if (message === "alreadyAdded") {
					toast.error("Failed, already added");
				} else {
					toast.error(message);
				}
			}
		},
	});

	useEffect(() => {
		if (isEdit) {
			return;
		}
		if (staffType === "nonStaff" && nextNonStaffId) {
			form.setFieldValue("empID", String(nextNonStaffId));
		} else if (staffType === "Staff") {
			form.setFieldValue("empID", "");
		}
	}, [staffType, nextNonStaffId, isEdit, form]);

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

	const previewImage = employeeImageUrl(
		form.state.values.image || employee?.image || null,
	);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{!isEdit && (
				<div className="space-y-2">
					<Label>Employee Type</Label>
					<RadioGroup
						value={staffType}
						onValueChange={(value) =>
							setStaffType(value as "Staff" | "nonStaff")
						}
						className="grid grid-cols-2"
					>
						<div className="flex items-center gap-2 rounded-none border px-3 py-2">
							<RadioGroupItem
								id="emp-staff"
								value="Staff"
								onClick={() => setStaffType("Staff")}
							/>
							<Label htmlFor="emp-staff" className="font-normal">
								Staff
							</Label>
						</div>
						<div className="flex items-center gap-2 rounded-none border px-3 py-2">
							<RadioGroupItem
								id="emp-nonstaff"
								value="nonStaff"
								onClick={() => setStaffType("nonStaff")}
							/>
							<Label htmlFor="emp-nonstaff" className="font-normal">
								nonStaff
							</Label>
						</div>
					</RadioGroup>
				</div>
			)}

			{/* ID */}
			<div className="space-y-2">
				<Label htmlFor="empID">
					{!isEdit && staffType === "nonStaff" ? "ID (auto)" : "ID"} *
				</Label>
				<form.Field
					name="empID"
					validators={{
						onChange: fieldValidator(formSchema.shape.empID as z.ZodType),
					}}
				>
					{(field) => (
						<div className="space-y-1.5">
							<Input
								id="empID"
								name={field.name}
								type="number"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isEdit || staffType === "nonStaff"}
								placeholder={
									isEdit || staffType === "nonStaff"
										? "Auto-generated"
										: "Enter employee ID"
								}
								className="font-mono"
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

			{/* Name */}
			<div className="space-y-2">
				<Label htmlFor="name">Name *</Label>
				<form.Field
					name="name"
					validators={{
						onChange: fieldValidator(formSchema.shape.name as z.ZodType),
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
								placeholder="Employee name"
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

			{isEdit && (
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<form.Field name="email">
						{(field) => (
							<Input
								id="email"
								name={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="name@bfginternational.com"
							/>
						)}
					</form.Field>
				</div>
			)}

			{isEdit && (
				<div className="space-y-2">
					<Label>Image</Label>
					<div className="flex items-start gap-3">
						{previewImage ? (
							<img
								src={previewImage}
								alt="Employee preview"
								className="size-20 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-20 shrink-0 items-center justify-center rounded-full border bg-muted text-xs text-muted-foreground">
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
									document.getElementById("empImageInput")?.click()
								}
							>
								{imageBusy ? <Loader2 className="animate-spin" /> : <Upload />}
								{imageBusy ? "Uploading…" : "Upload image"}
							</Button>
							<input
								id="empImageInput"
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
			)}

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
							) : employee ? (
								"Save Changes"
							) : (
								"Add Employee"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
