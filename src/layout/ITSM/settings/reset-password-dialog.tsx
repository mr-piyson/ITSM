"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import type { UserItem } from "@/server/routers/ITSM/users";
import { trpc } from "@/trpc/react";

const passwordSchema = z.object({
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(255),
	confirm: z.string(),
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

type ResetPasswordDialogProps = {
	user: UserItem | null;
	onClose: () => void;
};

export function ResetPasswordDialog({
	user,
	onClose,
}: ResetPasswordDialogProps) {
	const resetMutation = trpc.users.resetPassword.useMutation();
	const utils = trpc.useUtils();

	const form = useForm({
		defaultValues: { password: "", confirm: "" },
		onSubmit: async ({ value }) => {
			if (value.password !== value.confirm) {
				toast.error("Passwords do not match");
				return;
			}
			if (!user) {
				return;
			}
			try {
				await resetMutation.mutateAsync({
					id: user.id,
					password: value.password,
				});
				toast.success(`Password reset for ${user.username}`);
				utils.users.list.invalidate();
				onClose();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to reset password",
				);
			}
		},
	});

	return (
		<Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Set a new password for{" "}
						<strong>{user?.name ?? "this user"}</strong>.
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
						<Label htmlFor="reset-password">New password *</Label>
						<form.Field
							name="password"
							validators={{
								onChange: ({ value }) => {
									const res = passwordSchema.shape.password.safeParse(value);
									return res.success
										? undefined
										: (res.error.issues[0]?.message ?? undefined);
								},
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="reset-password"
										name={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="At least 6 characters"
										autoComplete="new-password"
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
						<Label htmlFor="reset-confirm">Confirm password *</Label>
						<form.Field name="confirm">
							{(field) => (
								<Input
									id="reset-confirm"
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Re-enter new password"
									autoComplete="new-password"
								/>
							)}
						</form.Field>
					</div>
					<DialogFooter>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<>
									<Button
										type="button"
										variant="outline"
										onClick={onClose}
										disabled={resetMutation.isPending}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={
											!canSubmit || isSubmitting || resetMutation.isPending
										}
									>
										{isSubmitting || resetMutation.isPending ? (
											<Loader2 className="animate-spin" />
										) : (
											"Reset password"
										)}
									</Button>
								</>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
