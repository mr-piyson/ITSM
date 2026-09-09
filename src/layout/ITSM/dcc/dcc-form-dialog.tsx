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
import { Switch } from "@/components/ui/switch";
import type { DccItem } from "@/server/routers/ITSM/dccs";
import { trpc } from "@/trpc/react";

const INTERVAL_OPTIONS = [60, 120, 300, 600, 900, 1800, 3600] as const;

const dccFormSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(100),
	ipAddress: z.string().trim().max(50).optional(),
	cardReaderId: z.string().trim().max(20).optional(),
	dccCode: z.string().trim().max(20).optional(),
	cardReaderIp: z.string().trim().max(50).optional(),
	screenInch: z.string().trim().max(20).optional(),
	toggles: z.boolean(),
	scanner: z.boolean(),
	cardReader: z.boolean(),
	paperPrinter: z.boolean(),
	rfidLabelPrinter: z.boolean(),
	lightTower: z.boolean(),
	checkIntervalSeconds: z.number(),
});

const fieldValidator =
	(shape: z.ZodString) =>
	({ value }: { value: string }) => {
		const res = shape.safeParse(value);
		return res.success ? undefined : res.error.issues[0]?.message;
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

type DccFormValues = {
	name: string;
	ipAddress: string;
	cardReaderId: string;
	dccCode: string;
	cardReaderIp: string;
	screenInch: string;
	toggles: boolean;
	scanner: boolean;
	cardReader: boolean;
	paperPrinter: boolean;
	rfidLabelPrinter: boolean;
	lightTower: boolean;
	checkIntervalSeconds: number;
};

type DccFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dcc: DccItem | null;
	onSuccess: () => void;
};

export function DccFormDialog({
	open,
	onOpenChange,
	dcc,
	onSuccess,
}: DccFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{dcc ? `Edit DCC — ${dcc.dccCode || dcc.name}` : "Add New DCC"}
					</DialogTitle>
					<DialogDescription>
						{dcc
							? "Update the details of this DCC station."
							: "Register a new Raspberry Pi DCC station."}
					</DialogDescription>
				</DialogHeader>
				<DccFormContent
					key={dcc?.id ?? "new"}
					dcc={dcc}
					onSuccess={onSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}

function DccFormContent({
	dcc,
	onSuccess,
}: {
	dcc: DccItem | null;
	onSuccess: () => void;
}) {
	const createMutation = trpc.dccs.create.useMutation();
	const updateMutation = trpc.dccs.update.useMutation();

	const defaults: DccFormValues = dcc
		? {
				name: dcc.name,
				ipAddress: dcc.ipAddress ?? "",
				cardReaderId: dcc.cardReaderId ? String(dcc.cardReaderId) : "",
				dccCode: dcc.dccCode ?? "",
				cardReaderIp: dcc.cardReaderIp ?? "",
				screenInch: dcc.screenInch ?? "",
				toggles: dcc.toggles,
				scanner: dcc.scanner,
				cardReader: dcc.cardReader,
				paperPrinter: dcc.paperPrinter,
				rfidLabelPrinter: dcc.rfidLabelPrinter,
				lightTower: dcc.lightTower,
				checkIntervalSeconds: dcc.checkIntervalSeconds || 300,
			}
		: {
				name: "",
				ipAddress: "",
				cardReaderId: "",
				dccCode: "",
				cardReaderIp: "",
				screenInch: "",
				toggles: false,
				scanner: true,
				cardReader: true,
				paperPrinter: false,
				rfidLabelPrinter: false,
				lightTower: false,
				checkIntervalSeconds: 300,
			};

	const form = useForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			const payload = {
				name: value.name,
				ipAddress: value.ipAddress || null,
				cardReaderId: value.cardReaderId ? Number(value.cardReaderId) : null,
				dccCode: value.dccCode || null,
				cardReaderIp: value.cardReaderIp || null,
				screenInch: value.screenInch || null,
				toggles: value.toggles,
				scanner: value.scanner,
				cardReader: value.cardReader,
				paperPrinter: value.paperPrinter,
				rfidLabelPrinter: value.rfidLabelPrinter,
				lightTower: value.lightTower,
				checkIntervalSeconds: value.checkIntervalSeconds,
			};
			try {
				if (dcc) {
					await updateMutation.mutateAsync({ id: dcc.id, data: payload });
					toast.success("DCC updated successfully");
				} else {
					await createMutation.mutateAsync(payload);
					toast.success("DCC added successfully");
				}
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save DCC",
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
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">Name *</Label>
					<form.Field
						name="name"
						validators={{ onChange: fieldValidator(dccFormSchema.shape.name) }}
					>
						{(field) => (
							<div className="space-y-1.5">
								<Input
									id="name"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={100}
									placeholder="Mold Staging"
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
					<Label htmlFor="dccCode">DCC Code</Label>
					<form.Field name="dccCode">
						{(field) => (
							<Input
								id="dccCode"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={20}
								placeholder="DCC001"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="ipAddress">Raspberry Pi IP</Label>
					<form.Field name="ipAddress">
						{(field) => (
							<Input
								id="ipAddress"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={50}
								placeholder="172.18.6.33"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cardReaderIp">Card Reader IP</Label>
					<form.Field name="cardReaderIp">
						{(field) => (
							<Input
								id="cardReaderIp"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={50}
								placeholder="172.18.6.1"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cardReaderId">Card Reader ID</Label>
					<form.Field name="cardReaderId">
						{(field) => (
							<Input
								id="cardReaderId"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={20}
								inputMode="numeric"
								placeholder="1"
							/>
						)}
					</form.Field>
				</div>

				<div className="space-y-2">
					<Label htmlFor="screenInch">Screen Size</Label>
					<form.Field name="screenInch">
						{(field) => (
							<Input
								id="screenInch"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={20}
								placeholder="15 inch"
							/>
						)}
					</form.Field>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Features</Label>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<form.Field name="toggles">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">Toggles</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
					<form.Field name="scanner">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">Scanner</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
					<form.Field name="cardReader">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">Card Reader</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
					<form.Field name="paperPrinter">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">Paper Printer</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
					<form.Field name="rfidLabelPrinter">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">RFID Label Printer</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
					<form.Field name="lightTower">
						{(field) => (
							<label className="flex items-center justify-between gap-2 rounded-none border px-3 py-2">
								<span className="text-xs">Light Tower</span>
								<Switch
									size="sm"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</label>
						)}
					</form.Field>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Connectivity Check Interval</Label>
				<form.Field name="checkIntervalSeconds">
					{(field) => (
						<Select
							value={String(field.state.value)}
							onValueChange={(value) => field.handleChange(Number(value))}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{INTERVAL_OPTIONS.map((seconds) => (
									<SelectItem key={seconds} value={String(seconds)}>
										{seconds < 60
											? `${seconds}s`
											: seconds < 3600
												? `${seconds / 60} min`
												: `${seconds / 3600} hour${seconds / 3600 > 1 ? "s" : ""}`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</form.Field>
				<p className="text-xs text-muted-foreground">
					How often the cron job checks this DCC&apos;s connectivity.
				</p>
			</div>

			<DialogFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : dcc ? (
								"Save Changes"
							) : (
								"Add DCC"
							)}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
