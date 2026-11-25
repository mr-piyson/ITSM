"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	PROBLEM_CATEGORIES,
	REQUEST_PRIORITIES,
	type ProblemCategory,
	type RequestPriority,
} from "@/lib/request-constants";
import { trpc } from "@/trpc/react";

type RequestKind = "problem" | "asset";

type RequestFormValues = {
	requestPrio: RequestPriority;
	descrip: string;
	category: ProblemCategory;
	affected: string;
	impact: string;
	steps: string;
	expected: string;
	item: string;
	quantity: number;
	neededBy: string;
	justification: string;
};

const PRIORITY_LABELS: Record<RequestPriority, string> = {
	high: "High Priority",
	medium: "Medium Priority",
	low: "Low Priority",
};

function fieldError(state: {
	isTouched: boolean;
	errors: unknown;
}): string | null {
	if (!state.isTouched || !Array.isArray(state.errors)) {
		return null;
	}
	return state.errors.filter(Boolean).join(", ") || null;
}

export function RequestFormPage({ kind }: { kind: RequestKind }) {
	const router = useRouter();
	const createMutation = trpc.requests.create.useMutation();

	const form = useForm({
		defaultValues: {
			requestPrio: "low",
			descrip: "",
			category: "software",
			affected: "",
			impact: "",
			steps: "",
			expected: "",
			item: "",
			quantity: 1,
			neededBy: "",
			justification: "",
		} as RequestFormValues,
		onSubmit: async ({ value }) => {
			try {
				if (kind === "problem") {
					await createMutation.mutateAsync({
						kind: "problem",
						descrip: value.descrip,
						requestPrio: value.requestPrio,
						payload: {
							category: value.category,
							affected: value.affected,
							impact: value.impact,
							steps: value.steps,
							expected: value.expected,
						},
					});
				} else {
					await createMutation.mutateAsync({
						kind: "asset",
						descrip: value.descrip,
						requestPrio: value.requestPrio,
						payload: {
							item: value.item,
							quantity: value.quantity,
							neededBy: value.neededBy,
							justification: value.justification,
						},
					});
				}
				toast.success("Request submitted successfully");
				router.push("/itsm/requests" as Route);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to submit request",
				);
			}
		},
	});

	const isProblem = kind === "problem";

	return (
		<div className="min-h-screen bg-background px-4 py-8">
			<div className="mx-auto max-w-2xl space-y-4">
				<Button
					variant="ghost"
					size="sm"
					render={<Link href="/documents/requests" />}
					nativeButton={false}
				>
					← All requests
				</Button>

				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-primary">
							{isProblem ? "PROBLEM REQUEST" : "ASSETS REQUEST"}
						</CardTitle>
						<CardDescription>
							{isProblem
								? "Report a software or hardware problem."
								: "Request an item or asset for your work."}
						</CardDescription>
					</CardHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<CardContent className="space-y-5">
							<div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
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

								{isProblem ? (
									<>
										<div className="space-y-2">
											<Label>Issue Type</Label>
											<form.Field name="category">
												{(field) => (
													<Select
														value={field.state.value}
														onValueChange={(value) =>
															field.handleChange(value as ProblemCategory)
														}
													>
														<SelectTrigger className="w-full">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{PROBLEM_CATEGORIES.map((category) => (
																<SelectItem key={category} value={category}>
																	{category === "software"
																		? "Software"
																		: "Hardware"}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											</form.Field>
										</div>

										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="affected">Affected System / Asset</Label>
											<form.Field name="affected">
												{(field) => (
													<Input
														id="affected"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="e.g. Outlook, laptop asset #A-12"
														maxLength={200}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="impact">Impact</Label>
											<form.Field name="impact">
												{(field) => (
													<Textarea
														id="impact"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Who is affected and how?"
														rows={2}
														maxLength={500}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="steps">Steps to Reproduce</Label>
											<form.Field name="steps">
												{(field) => (
													<Textarea
														id="steps"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="1. Open… 2. Click…"
														rows={3}
														maxLength={2000}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="expected">Expected Result</Label>
											<form.Field name="expected">
												{(field) => (
													<Input
														id="expected"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="What should happen instead?"
														maxLength={1000}
													/>
												)}
											</form.Field>
										</div>
									</>
								) : (
									<>
										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="item">Item / Asset</Label>
											<form.Field name="item">
												{(field) => (
													<Input
														id="item"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="e.g. Laptop, docking station, toner"
														maxLength={200}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2">
											<Label htmlFor="quantity">Quantity</Label>
											<form.Field name="quantity">
												{(field) => (
													<Input
														id="quantity"
														type="number"
														min={1}
														max={999}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) =>
															field.handleChange(Number(e.target.value))
														}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2">
											<Label htmlFor="neededBy">Needed By</Label>
											<form.Field name="neededBy">
												{(field) => (
													<Input
														id="neededBy"
														type="date"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
												)}
											</form.Field>
										</div>

										<div className="space-y-2 sm:col-span-2">
											<Label htmlFor="justification">Justification</Label>
											<form.Field name="justification">
												{(field) => (
													<Textarea
														id="justification"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Why is this needed?"
														rows={3}
														maxLength={2000}
													/>
												)}
											</form.Field>
										</div>
									</>
								)}
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
												placeholder="Add any extra details…"
												rows={3}
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
						</CardContent>

						<CardFooter>
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
							>
								{([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										disabled={!canSubmit || isSubmitting}
										className="w-full font-bold"
									>
										{isSubmitting ? (
											<Loader2 className="animate-spin" />
										) : (
											"Submit Request"
										)}
									</Button>
								)}
							</form.Subscribe>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
