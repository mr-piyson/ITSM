"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Wrench } from "lucide-react";
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
import { provideToday } from "@/lib/provide-constants";
import { isTonerAction, PRINTER_ACTION_TYPES } from "@/lib/printer-constants";
import type { PrinterItem } from "@/server/routers/ITSM/printers";
import { trpc } from "@/trpc/react";

const ACTION_BY_OPTIONS = ["Hadi Almahari", "Salman Almosawi"];

type PrinterActionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	printer: PrinterItem | null;
	onSuccess: () => void;
};

export function PrinterActionDialog({
	open,
	onOpenChange,
	printer,
	onSuccess,
}: PrinterActionDialogProps) {
	const { data: detail } = trpc.printers.byId.useQuery(
		{ id: printer?.id ?? 0 },
		{ enabled: open && !!printer },
	);
	const addActionMutation = trpc.printers.addAction.useMutation();

	const availableToners = (detail?.linkedToners ?? []).filter(
		(toner) => toner.stock > 0,
	);
	const isRollPrinter = detail?.info !== undefined && detail?.info !== null;

	const form = useForm({
		defaultValues: {
			actionType:
				PRINTER_ACTION_TYPES[0] as (typeof PRINTER_ACTION_TYPES)[number],
			actionBy: ACTION_BY_OPTIONS[0],
			actionDate: provideToday(),
			note: "",
			tonerID: "",
			requestedBy: "",
			recievedBy: "",
		},
		onSubmit: async ({ value }) => {
			if (!printer) {
				return;
			}
			try {
				const tonerID = value.tonerID ? Number(value.tonerID) : undefined;
				if (isTonerAction(value.actionType) && tonerID === undefined) {
					toast.error("Please select a toner or roll");
					return;
				}
				await addActionMutation.mutateAsync({
					printerID: printer.id,
					actionType: value.actionType,
					actionBy: value.actionBy,
					actionDate: value.actionDate,
					note: value.note,
					tonerID,
					requestedBy: value.requestedBy,
					recievedBy: value.recievedBy,
				});
				toast.success("Action added successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to add action",
				);
			}
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					form.reset();
				}
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Wrench className="size-4 text-muted-foreground" />
						Add Printer Action
					</DialogTitle>
					<DialogDescription>
						{printer ? `Record an action for ${printer.name}.` : ""}
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
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Action Type *</Label>
							<form.Field name="actionType">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(
												(value ??
													PRINTER_ACTION_TYPES[0]) as (typeof PRINTER_ACTION_TYPES)[number],
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{PRINTER_ACTION_TYPES.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Action By *</Label>
							<form.Field name="actionBy">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value ?? "")}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select name" />
										</SelectTrigger>
										<SelectContent>
											{ACTION_BY_OPTIONS.map((name) => (
												<SelectItem key={name} value={name}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label htmlFor="action-date">Action Date *</Label>
							<form.Field name="actionDate">
								{(field) => (
									<Input
										id="action-date"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label htmlFor="action-note">Note</Label>
							<form.Field name="note">
								{(field) => (
									<Input
										id="action-note"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										maxLength={100}
										placeholder="Optional note"
									/>
								)}
							</form.Field>
						</div>
					</div>

					<form.Subscribe selector={(state) => state.values.actionType}>
						{(actionType) =>
							isTonerAction(actionType) ? (
								<div className="space-y-2">
									<Label>Available Toners/Rolls</Label>
									<form.Field name="tonerID">
										{(field) => (
											<Select
												value={field.state.value || undefined}
												onValueChange={(value) =>
													field.handleChange(value ?? "")
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select toner or roll" />
												</SelectTrigger>
												<SelectContent>
													{availableToners.length === 0 ? (
														<SelectItem value="__none__" disabled>
															No toners in stock
														</SelectItem>
													) : (
														availableToners.map((toner) => (
															<SelectItem
																key={toner.id}
																value={String(toner.id)}
															>
																{toner.name} — {toner.stock} in stock
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
										)}
									</form.Field>
								</div>
							) : null
						}
					</form.Subscribe>

					{isRollPrinter && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="action-requested-by">Requested By</Label>
								<form.Field name="requestedBy">
									{(field) => (
										<Input
											id="action-requested-by"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											maxLength={50}
											placeholder="Requested by"
										/>
									)}
								</form.Field>
							</div>
							<div className="space-y-2">
								<Label htmlFor="action-received-by">Received By</Label>
								<form.Field name="recievedBy">
									{(field) => (
										<Input
											id="action-received-by"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											maxLength={50}
											placeholder="Received by"
										/>
									)}
								</form.Field>
							</div>
						</div>
					)}

					<DialogFooter>
						<form.Subscribe selector={(state) => [state.isSubmitting]}>
							{([isSubmitting]) => (
								<Button
									type="submit"
									disabled={isSubmitting || addActionMutation.isPending}
								>
									{isSubmitting ? (
										<Loader2 className="animate-spin" />
									) : (
										"Add Action"
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
