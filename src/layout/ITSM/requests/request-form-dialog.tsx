"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import {
	REQUEST_MODIFICATIONS,
	REQUEST_PAGES,
	REQUEST_PRIORITIES,
	type RequestModification,
	type RequestPage,
	type RequestPageType,
	type RequestPriority,
} from "@/lib/request-constants";
import { trpc } from "@/trpc/react";

type RequestFormValues = {
	pgtype: RequestPageType;
	newpg: string;
	slctname: RequestPage;
	otherpg: string;
	modifi: RequestModification;
	descrip: string;
	requestPrio: RequestPriority;
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

const PAGE_LABELS: Record<RequestPage, string> = {
	assets: "Assets",
	stock: "Stock",
	printers: "Printers",
	employees: "Employees",
	vendors: "Vendors",
	other: "Other",
};

const MODIFICATION_LABELS: Record<RequestModification, string> = {
	add: "Add Elements",
	delete: "Delete Elements",
	modify: "Modify Elements",
	other: "Other",
};

const PRIORITY_LABELS: Record<RequestPriority, string> = {
	high: "High Priority",
	medium: "Medium Priority",
	low: "Low Priority",
};

type RequestFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
};

export function RequestFormDialog({
	open,
	onOpenChange,
	onSuccess,
}: RequestFormDialogProps) {
	const createMutation = trpc.requests.create.useMutation();

	const form = useForm({
		defaultValues: {
			pgtype: "existing",
			newpg: "",
			slctname: "assets",
			otherpg: "",
			modifi: "modify",
			descrip: "",
			requestPrio: "low",
		} as RequestFormValues,
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync({
					pgtype: value.pgtype,
					newpg: value.pgtype === "new" ? value.newpg : null,
					slctname: value.slctname,
					otherpg: value.slctname === "other" ? value.otherpg : null,
					modifi: value.modifi,
					descrip: value.descrip,
					requestPrio: value.requestPrio,
				});
				toast.success("Request submitted successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to submit request",
				);
			}
		},
	});

	const pgtype = form.getFieldValue("pgtype");
	const slctname = form.getFieldValue("slctname");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>New Change Request</DialogTitle>
					<DialogDescription>
						Request a change or improvement to the system.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-5"
				>
					<div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Page Type</Label>
							<form.Field name="pgtype">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as RequestPageType)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="existing">Existing Page</SelectItem>
											<SelectItem value="new">New Page</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Priority Level</Label>
							<form.Field name="requestPrio">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as RequestPriority)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{REQUEST_PRIORITIES.map((priority) => (
												<SelectItem key={priority} value={priority}>
													{PRIORITY_LABELS[priority]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						{pgtype === "new" && (
							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="newpg">New Page Name</Label>
								<form.Field name="newpg">
									{(field) => (
										<Input
											id="newpg"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter the name of the new page"
											maxLength={100}
										/>
									)}
								</form.Field>
							</div>
						)}

						<div className="space-y-2">
							<Label>Page Name</Label>
							<form.Field name="slctname">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as RequestPage)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{REQUEST_PAGES.map((page) => (
												<SelectItem key={page} value={page}>
													{PAGE_LABELS[page]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						{slctname === "other" && (
							<div className="space-y-2">
								<Label htmlFor="otherpg">Other Page Name</Label>
								<form.Field name="otherpg">
									{(field) => (
										<Input
											id="otherpg"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Specify the page"
											maxLength={100}
										/>
									)}
								</form.Field>
							</div>
						)}

						<div className="space-y-2">
							<Label>Modification Type</Label>
							<form.Field name="modifi">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as RequestModification)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{REQUEST_MODIFICATIONS.map((modifi) => (
												<SelectItem key={modifi} value={modifi}>
													{MODIFICATION_LABELS[modifi]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="descrip">Description</Label>
						<form.Field
							name="descrip"
							validators={{
								onChange: ({ value }) =>
									value.trim().length > 0
										? undefined
										: "Description is required",
							}}
						>
							{(field) => (
								<div>
									<Textarea
										id="descrip"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Describe the requested change in detail…"
										rows={4}
										maxLength={2000}
									/>
									{fieldError(field.state.meta) && (
										<p className="mt-1 text-xs text-destructive">
											{fieldError(field.state.meta)}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<DialogFooter>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<Loader2 className="animate-spin" />
									) : (
										"Submit Request"
									)}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
