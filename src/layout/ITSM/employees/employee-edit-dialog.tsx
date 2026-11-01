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
import type {
	EmployeeItem,
	EmployeeTargetResult,
} from "@/server/routers/ITSM/employees";
import { trpc } from "@/trpc/react";

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

function describeTarget(name: string, result: EmployeeTargetResult): string {
	switch (result.status) {
		case "updated":
			return `${name}: updated`;
		case "skipped":
			return `${name}: skipped (${result.message ?? "no record"})`;
		case "failed":
			return `${name}: failed${result.message ? ` - ${result.message}` : ""}`;
	}
}

type EmployeeEditValues = {
	email: string;
};

function toValues(employee: EmployeeItem): EmployeeEditValues {
	return {
		email: employee.email ?? "",
	};
}

export function EmployeeEditDialog({
	employee,
	onOpenChange,
}: {
	employee: EmployeeItem;
	onOpenChange: (open: boolean) => void;
}) {
	const updateMutation = trpc.employees.update.useMutation();
	const utils = trpc.useUtils();

	const form = useForm({
		defaultValues: toValues(employee),
		onSubmit: async ({ value }) => {
			try {
				const results = await updateMutation.mutateAsync({
					code: employee.emplCode,
					email: value.email.trim(),
				});

				const description = [
					describeTarget("Oracle", results.oracle),
					describeTarget("ISS", results.iss),
				].join(" · ");

				const hasFailure =
					results.oracle.status === "failed" || results.iss.status === "failed";

				if (hasFailure) {
					toast.warning("Employee partially updated", { description });
				} else {
					toast.success("Employee updated", { description });
				}

				utils.employees.byCode.invalidate();
				utils.employees.list.invalidate();
				onOpenChange(false);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update employee",
				);
			}
		},
	});

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Employee</DialogTitle>
					<DialogDescription>
						Update the email for {employee.name ?? employee.emplCode}. The
						matching ISS user account is updated where it exists; each database
						result is reported after saving.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="edit-employee-email">Email</Label>
						<form.Field
							name="email"
							validators={{
								onChange: ({ value }) =>
									value.trim() === "" ||
									/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
										? undefined
										: "Enter a valid email address",
							}}
						>
							{(field) => (
								<div>
									<Input
										id="edit-employee-email"
										type="email"
										placeholder="name@company.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{fieldError(field.state.meta) && (
										<p className="mt-1 text-xs text-destructive">
											{fieldError(field.state.meta)}
										</p>
									)}
								</div>
							)}
						</form.Field>
						<p className="text-[11px] text-muted-foreground">
							Saved to: Oracle · ISS
						</p>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							type="button"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										!canSubmit || isSubmitting || updateMutation.isPending
									}
								>
									{isSubmitting ? <Loader2 className="animate-spin" /> : null}
									Save Changes
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
