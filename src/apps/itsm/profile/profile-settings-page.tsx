"use client";

import { useForm } from "@tanstack/react-form";
import { CreditCard, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/react";

type MeUser = {
	id: number;
	username: string;
	name: string;
	email: string;
	empCode: number;
	type: string;
};

const formSchema = z.object({
	username: z.string().trim().min(1, "Username is required").max(50),
	name: z.string().trim().min(1, "Name is required").max(50),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email")
		.max(100),
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

export function ProfileSettingsPage() {
	const { data: user, isPending } = trpc.auth.me.useQuery();

	return (
		<div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Profile</h1>
				<p className="text-sm text-muted-foreground">
					Manage your personal details and preferences.
				</p>
			</div>

			{isPending || !user ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<ProfileForm key={user.id} user={user} />
					<AccountDetails user={user} />
				</>
			)}
		</div>
	);
}

function ProfileForm({ user }: { user: MeUser }) {
	const mutation = trpc.users.updateProfile.useMutation();
	const utils = trpc.useUtils();

	const form = useForm({
		defaultValues: {
			username: user.username,
			name: user.name,
			email: user.email,
		},
		onSubmit: async ({ value }) => {
			try {
				await mutation.mutateAsync({
					username: value.username,
					name: value.name,
					email: value.email,
				});
				await utils.auth.me.invalidate();
				toast.success("Profile updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update profile",
				);
			}
		},
	});

	return (
		<Card className="rounded-none">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<User className="size-4" />
					Personal Details
				</CardTitle>
				<CardDescription>Update your profile information.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-5"
				>
					<div className="space-y-2">
						<Label htmlFor="profile-username">Username *</Label>
						<form.Field
							name="username"
							validators={{
								onChange: fieldValidator(
									formSchema.shape.username as z.ZodType,
								),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="profile-username"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="jdoe"
										autoComplete="username"
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
						<Label htmlFor="profile-name">Name *</Label>
						<form.Field
							name="name"
							validators={{
								onChange: fieldValidator(formSchema.shape.name as z.ZodType),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="profile-name"
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
						<Label htmlFor="profile-email">Email *</Label>
						<form.Field
							name="email"
							validators={{
								onChange: fieldValidator(formSchema.shape.email as z.ZodType),
							}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Input
										id="profile-email"
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="john@bfginternational.com"
										autoComplete="email"
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

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting || mutation.isPending}
							>
								{isSubmitting || mutation.isPending ? (
									<Loader2 className="animate-spin" />
								) : (
									"Save Changes"
								)}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}

function AccountDetails({ user }: { user: MeUser }) {
	return (
		<Card className="rounded-none">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<CreditCard className="size-4" />
					Account
				</CardTitle>
				<CardDescription>
					Read-only details about your system account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="space-y-1">
						<dt className="text-xs font-medium text-muted-foreground">
							User ID
						</dt>
						<dd className="text-sm font-medium">{user.id}</dd>
					</div>
					<div className="space-y-1">
						<dt className="text-xs font-medium text-muted-foreground">
							Employee Code
						</dt>
						<dd className="text-sm font-medium">{user.empCode}</dd>
					</div>
					<div className="space-y-1">
						<dt className="text-xs font-medium text-muted-foreground">
							Account Type
						</dt>
						<dd className="text-sm font-medium">{user.type}</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	);
}
