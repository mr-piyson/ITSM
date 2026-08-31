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
import {
	MONTHS,
	TAPE_LOCATIONS,
	currentYear,
	locationLabel,
	type TapeLocation,
} from "@/lib/tape-constants";
import type { TapeItem } from "@/server/routers/ITSM/tapes";
import { trpc } from "@/trpc/react";

type UsageValues = {
	status: "Online" | "Offline";
	sequenceNum: number;
	lastWritten: string;
	expire: string;
	capacity: string;
	free: string;
};

type TapeFormValues = {
	location: TapeLocation;
	month: string;
	year: string;
} & UsageValues;

function nowLocalDateTime(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Converts a stored MySQL datetime to a datetime-local value.
function toLocalInput(value?: string | null): string | null {
	if (!value) {
		return null;
	}
	const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value);
	return match ? `${match[1]}T${match[2]}` : null;
}

const yearValidator = ({ value }: { value: string }) => {
	if (!/^\d+$/.test(value)) {
		return "Enter a valid year";
	}
	const num = Number(value);
	if (num < 2000 || num > 2100) {
		return "Year must be between 2000 and 2100";
	}
	return undefined;
};

const dateTimeValidator = ({ value }: { value: string }) => {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
		return "Enter a valid date and time";
	}
	return undefined;
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

type TapeFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tape: TapeItem | null;
	onSuccess: () => void;
};

export function TapeFormDialog({
	open,
	onOpenChange,
	tape,
	onSuccess,
}: TapeFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{tape ? `Edit Tape — ${tape.tapeID}` : "Add New Tape"}
					</DialogTitle>
					<DialogDescription>
						{tape
							? "Update this tape's assignment and usage details."
							: "Register a new backup tape in the inventory."}
					</DialogDescription>
				</DialogHeader>
				<TapeFormContent
					key={tape?.id ?? "new"}
					tape={tape}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function TapeFormContent({
	tape,
	onSuccess,
}: {
	tape: TapeItem | null;
	onSuccess: () => void;
}) {
	const nextIdQuery = trpc.tapes.nextId.useQuery(undefined, {
		enabled: !tape,
	});
	const nextTapeID = nextIdQuery.data ?? "";
	const createMutation = trpc.tapes.create.useMutation();
	const updateMutation = trpc.tapes.update.useMutation();

	const defaults: TapeFormValues = tape
		? {
				location: (tape.location === "Production"
					? "Production"
					: "IT") as TapeLocation,
				month: tape.month ?? MONTHS[0],
				year: tape.year ?? String(currentYear()),
				status: tape.status === "Offline" ? "Offline" : "Online",
				sequenceNum: tape.sequenceNum ?? 1,
				lastWritten: toLocalInput(tape.lastWritten) ?? nowLocalDateTime(),
				expire: toLocalInput(tape.expire) ?? nowLocalDateTime(),
				capacity: tape.capacity ?? "2.3 TB",
				free: tape.free ?? "",
			}
		: {
				location: "IT",
				month: MONTHS[new Date().getMonth()],
				year: String(currentYear()),
				status: "Online",
				sequenceNum: 1,
				lastWritten: nowLocalDateTime(),
				expire: nowLocalDateTime(),
				capacity: "2.3 TB",
				free: "",
			};

	const form = useForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			try {
				if (tape) {
					await updateMutation.mutateAsync({
						id: tape.id,
						data: {
							location: value.location,
							month: value.month as (typeof MONTHS)[number],
							year: Number(value.year),
							status: value.status,
							sequenceNum: value.sequenceNum,
							lastWritten: value.lastWritten,
							expire: value.expire,
							capacity: value.capacity,
							free: value.free,
						},
					});
					toast.success("Tape updated successfully");
				} else {
					await createMutation.mutateAsync({
						tapeID: nextTapeID,
						data: {
							location: value.location,
							month: value.month as (typeof MONTHS)[number],
							year: Number(value.year),
						},
					});
					toast.success(`Tape ${nextTapeID} added successfully`);
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save tape",
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
			className="space-y-5"
		>
			<div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
				<section className="space-y-3">
					<h4 className="text-sm font-semibold">Assignment</h4>

					<div className="space-y-2">
						<Label htmlFor="tapeID">Tape ID</Label>
						<Input
							id="tapeID"
							value={tape ? tape.tapeID : nextTapeID}
							readOnly
							disabled={!!tape || nextIdQuery.isPending}
							className="font-mono text-sm"
							placeholder={nextIdQuery.isPending ? "Generating…" : ""}
						/>
						<p className="text-xs text-muted-foreground">
							{tape
								? "Tape IDs are permanent."
								: "Automatically generated from the existing inventory."}
						</p>
					</div>

					<div className="space-y-2">
						<Label>Location</Label>
						<form.Field name="location">
							{(field) => (
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(
											value === "Production" ? "Production" : "IT",
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{TAPE_LOCATIONS.map((location) => (
											<SelectItem key={location} value={location}>
												{locationLabel(location)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label>Month</Label>
							<form.Field name="month">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? MONTHS[0])
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{MONTHS.map((month) => (
												<SelectItem key={month} value={month}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
						<div className="space-y-2">
							<Label htmlFor="year">Year</Label>
							<form.Field name="year" validators={{ onChange: yearValidator }}>
								{(field) => (
									<div>
										<Input
											id="year"
											type="number"
											inputMode="numeric"
											min={2000}
											max={2100}
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
						</div>
					</div>
				</section>

				<section className="space-y-3">
					<h4 className="text-sm font-semibold">Usage Details</h4>
					{!tape && (
						<p className="text-xs text-muted-foreground">
							Filled in after the first backup is written to the tape.
						</p>
					)}

					<fieldset
						disabled={!tape}
						className={
							tape ? "space-y-3" : "space-y-3 opacity-50 pointer-events-none"
						}
					>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>Status</Label>
								<form.Field name="status">
									{(field) => (
										<Select
											value={field.state.value}
											onValueChange={(value) =>
												field.handleChange(
													value === "Offline" ? "Offline" : "Online",
												)
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Online">Online</SelectItem>
												<SelectItem value="Offline">Offline</SelectItem>
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>
							<div className="space-y-2">
								<Label>Sequence #</Label>
								<form.Field name="sequenceNum">
									{(field) => (
										<Select
											value={String(field.state.value)}
											onValueChange={(value) =>
												field.handleChange(Number(value))
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Array.from({ length: 10 }, (_, i) => i + 1).map(
													(seq) => (
														<SelectItem key={seq} value={String(seq)}>
															{seq}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									)}
								</form.Field>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastWritten">Last Written</Label>
							<form.Field
								name="lastWritten"
								validators={{ onChange: dateTimeValidator }}
							>
								{(field) => (
									<div>
										<Input
											id="lastWritten"
											type="datetime-local"
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
						</div>

						<div className="space-y-2">
							<Label htmlFor="expire">Expires On</Label>
							<form.Field
								name="expire"
								validators={{ onChange: dateTimeValidator }}
							>
								{(field) => (
									<div>
										<Input
											id="expire"
											type="datetime-local"
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
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label htmlFor="capacity">Capacity</Label>
								<form.Field name="capacity">
									{(field) => (
										<Input
											id="capacity"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="2.3 TB"
											maxLength={50}
										/>
									)}
								</form.Field>
							</div>
							<div className="space-y-2">
								<Label htmlFor="free">Free Space</Label>
								<form.Field name="free">
									{(field) => (
										<Input
											id="free"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="1.4 TB"
											maxLength={50}
										/>
									)}
								</form.Field>
							</div>
						</div>
					</fieldset>
				</section>
			</div>

			<DialogFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting || (!tape && !nextTapeID)}
						>
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : tape ? (
								"Save Changes"
							) : (
								"Add Tape"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
