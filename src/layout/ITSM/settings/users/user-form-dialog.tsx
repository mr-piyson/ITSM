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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UserItem } from "@/server/routers/ITSM/users";
import { trpc } from "@/trpc/react";

const USER_TYPES = ["admin", "user", "guest"] as const;

const formSchema = z.object({
	username: z.string().trim().min(1, "Username is required").max(50),
	name: z.string().trim().min(1, "Name is required").max(50),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email")
		.max(100),
	password: z.string().min(6, "Password must be at least 6 characters").max(255),
	type: z.string().min(1, "Type is required").max(50),
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

type UserFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserItem | null;
	onSuccess: () => void;
};

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: UserFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{user ? `Edit User — ${user.username}` : "Add New User"}
					</DialogTitle>
					<DialogDescription>
						{user
							? "Update the details of this system user."
							: "Create a new system user account."}
					</DialogDescription>
				</DialogHeader>
				<UserFormContent
					key={user?.id ?? "new"}
					user={user}
					onSuccess={onSuccess}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function UserFormContent({
	user,
	onSuccess,
	onClose,
}: {
	user: UserItem | null;
	onSuccess: () => void;
	onClose: () => void;
}) {
	const isEdit = !!user;
	const createMutation = trpc.users.create.useMutation();
	const updateMutation = trpc.users.update.useMutation();

	const form = useForm({
		defaultValues: user
			? {
					username: user.username,
					name: user.name,
					email: user.email,
					password: "",
					type: USER_TYPES.includes(user.type as (typeof USER_TYPES)[number])
						? user.type
						: "user",
				}
			: {
					username: "",
					name: "",
					email: "",
					password: "",
					type: "user",
				},
		onSubmit: async ({ value }) => {
			try {
				if (user) {
					await updateMutation.mutateAsync({
						id: user.id,
						username: value.username,
						name: value.name,
						email: value.email,
						type: value.type,
					});
					toast.success("User updated successfully");
				} else {
					await createMutation.mutateAsync({
						username: value.username,
						name: value.name,
						email: value.email,
						password: value.password,
						type: value.type,
					});
					toast.success("User added successfully");
				}
				onSuccess();
				onClose();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save user",
				);
			}
		},
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
			<div className="space-y-2">
				<Label htmlFor="user-username">Username *</Label>
				<form.Field
					name="username"
					validators={{
						onChange: fieldValidator(formSchema.shape.username as z.ZodType),
					}}
				>
					{(field) => (
						<div className="space-y-1.5">
							<Input
								id="user-username"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="jdoe"
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
				<Label htmlFor="user-name">Name *</Label>
				<form.Field
					name="name"
					validators={{
						onChange: fieldValidator(formSchema.shape.name as z.ZodType),
					}}
				>
					{(field) => (
						<div className="space-y-1.5">
							<Input
								id="user-name"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="John Doe"
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
				<Label htmlFor="user-email">Email *</Label>
				<form.Field
					name="email"
					validators={{
						onChange: fieldValidator(formSchema.shape.email as z.ZodType),
					}}
				>
					{(field) => (
						<div className="space-y-1.5">
							<Input
								id="user-email"
								name={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="john@bfginternational.com"
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

			{!isEdit && (
				<div className="space-y-2">
					<Label htmlFor="user-password">Password *</Label>
					<form.Field
						name="password"
						validators={{
							onChange: fieldValidator(formSchema.shape.password as z.ZodType),
						}}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="user-password"
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
			)}

			<div className="space-y-2">
				<Label>Type *</Label>
				<form.Field name="type">
					{(field) => (
						<Select
							value={field.state.value}
							onValueChange={(value) =>
								field.handleChange(value ?? "user")
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{USER_TYPES.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
							disabled={
								!canSubmit ||
								isSubmitting ||
								createMutation.isPending ||
								updateMutation.isPending
							}
						>
							{isSubmitting ||
							createMutation.isPending ||
							updateMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : user ? (
								"Save Changes"
							) : (
								"Add User"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
