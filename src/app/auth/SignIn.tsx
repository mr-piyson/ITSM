"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signIn } from "./auth.actions";

export const SignInSchema = z.object({
	email: z.string().min(1, "Email or username is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInValues = z.infer<typeof SignInSchema>;

export default function SignInTab() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<SignInValues>({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setLoading(true);
			try {
				const res = await signIn(value);
				if (res.status === 200) {
					toast.success("Signed in successfully!");
					router.push("/app");
				} else if (res.error) {
					toast.error(res.error);
					setLoading(false);
				}
			} catch (e) {
				toast.error("Error", { description: String(e) });
				setLoading(false);
			}
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl font-bold">Sign In</CardTitle>
				<CardDescription>
					Sign in or create an account to begin managing your finances.
				</CardDescription>
			</CardHeader>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardContent className="space-y-4">
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								const res = SignInSchema.shape.email.safeParse(value);
								return res.success ? undefined : res.error.errors[0]?.message;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="user@example.com or username"
									className="border border-muted-foreground/50"
								/>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<p className="text-sm font-medium text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="password"
						validators={{
							onChange: ({ value }) => {
								const res = SignInSchema.shape.password.safeParse(value);
								return res.success ? undefined : res.error.errors[0]?.message;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="border border-muted-foreground/50"
								/>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<p className="text-sm font-medium text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</CardContent>

				<CardFooter className="mt-5">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								disabled={loading || isSubmitting || !canSubmit}
								type="submit"
								className="w-full font-bold"
							>
								{loading || isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									"Sign In"
								)}
							</Button>
						)}
					</form.Subscribe>
				</CardFooter>
			</form>
		</Card>
	);
}
