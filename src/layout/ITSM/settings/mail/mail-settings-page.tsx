"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { BellRing, Loader2, Mail, Save, Send, Settings2 } from "lucide-react";
import { toast } from "sonner";

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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/trpc/react";

type MailFormValues = {
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
	fromEmail: string;
	fromName: string;
	toEmails: string;
	ccEmails: string;
	enabled: boolean;
};

const emptyValues: MailFormValues = {
	host: "",
	port: 587,
	secure: false,
	username: "",
	password: "",
	fromEmail: "",
	fromName: "",
	toEmails: "",
	ccEmails: "",
	enabled: false,
};

export function MailSettingsPage() {
	const { data: settings, isPending } = trpc.mail.get.useQuery();
	const utils = trpc.useUtils();

	return (
		<div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col space-y-4 overflow-auto p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Mail Settings</h1>
				<p className="text-xs text-muted-foreground">
					Configure SMTP to receive booking notifications.
				</p>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<MailSettingsForm
					key={settings ? "loaded" : "empty"}
					initial={
						settings
							? {
									host: settings.host,
									port: settings.port,
									secure: settings.secure,
									username: settings.username,
									password: "",
									fromEmail: settings.fromEmail,
									fromName: settings.fromName,
									toEmails: settings.toEmails,
									ccEmails: settings.ccEmails,
									enabled: settings.enabled,
								}
							: emptyValues
					}
					hasPassword={settings?.hasPassword ?? false}
					onSaved={() => utils.mail.get.invalidate()}
				/>
			)}

			<ContractRemindersSection />
		</div>
	);
}

function MailSettingsForm({
	initial,
	hasPassword,
	onSaved,
}: {
	initial: MailFormValues;
	hasPassword: boolean;
	onSaved: () => void;
}) {
	const saveMutation = trpc.mail.save.useMutation();
	const testMutation = trpc.mail.test.useMutation();
	const [passwordChanged, setPasswordChanged] = useState(false);

	const form = useForm({
		defaultValues: initial,
		onSubmit: async ({ value }) => {
			try {
				await saveMutation.mutateAsync({
					host: value.host.trim(),
					port: value.port,
					secure: value.secure,
					username: value.username.trim(),
					password: passwordChanged ? value.password : undefined,
					fromEmail: value.fromEmail.trim(),
					fromName: value.fromName.trim(),
					toEmails: value.toEmails.trim(),
					ccEmails: value.ccEmails.trim() || undefined,
					enabled: value.enabled,
				});
				setPasswordChanged(false);
				onSaved();
				toast.success("Mail settings saved");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save settings",
				);
			}
		},
	});

	const handleTest = async () => {
		const value = form.state.values;
		try {
			await testMutation.mutateAsync({
				host: value.host.trim(),
				port: value.port,
				secure: value.secure,
				username: value.username.trim(),
				password: passwordChanged ? value.password : undefined,
				fromEmail: value.fromEmail.trim(),
				fromName: value.fromName.trim(),
				toEmails: value.toEmails.trim(),
				ccEmails: value.ccEmails.trim() || undefined,
				enabled: true,
			});
			toast.success("Test email sent successfully");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Test email failed");
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-5"
		>
			{/* SMTP */}
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Settings2 className="size-4" />
						SMTP Server
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2 sm:col-span-2">
						<Label htmlFor="mail-host">Host</Label>
						<form.Field
							name="host"
							validators={{
								onChange: ({ value }) =>
									!value.trim() ? "Host is required" : undefined,
							}}
						>
							{(field) => (
								<Input
									id="mail-host"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="smtp.office365.com"
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mail-port">Port</Label>
						<form.Field
							name="port"
							validators={{
								onChange: ({ value }) =>
									!value || value < 1 || value > 65535
										? "Enter a valid port"
										: undefined,
							}}
						>
							{(field) => (
								<Input
									id="mail-port"
									type="number"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(Number(e.target.value))}
								/>
							)}
						</form.Field>
					</div>
					<div className="flex items-end space-y-2">
						<form.Field name="secure">
							{(field) => (
								<Label className="flex w-full cursor-pointer items-center justify-between gap-3 border px-2 py-1">
									<span className="text-xs font-medium">Use TLS (SSL)</span>
									<Switch
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
								</Label>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mail-username">Username</Label>
						<form.Field name="username">
							{(field) => (
								<Input
									id="mail-username"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="SMTP username"
									autoComplete="off"
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mail-password">Password</Label>
						<form.Field name="password">
							{(field) => (
								<Input
									id="mail-password"
									type="password"
									value={field.state.value}
									onChange={(e) => {
										field.handleChange(e.target.value);
										setPasswordChanged(true);
									}}
									placeholder={
										hasPassword && !passwordChanged
											? "•••••••• (leave blank to keep)"
											: "SMTP password"
									}
									autoComplete="new-password"
								/>
							)}
						</form.Field>
						{hasPassword && !passwordChanged && (
							<p className="text-xs text-muted-foreground">
								An SMTP password is already stored. Leave blank to keep it.
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Sender */}
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Mail className="size-4" />
						Sender
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="mail-from-email">From email</Label>
						<form.Field
							name="fromEmail"
							validators={{
								onChange: ({ value }) =>
									value.trim() &&
									!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
										? "Enter a valid email"
										: undefined,
							}}
						>
							{(field) => (
								<Input
									id="mail-from-email"
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="systems@bfginternational.com"
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mail-from-name">From name</Label>
						<form.Field name="fromName">
							{(field) => (
								<Input
									id="mail-from-name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="IT Service Management System"
								/>
							)}
						</form.Field>
					</div>
				</CardContent>
			</Card>

			{/* Recipients */}
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Send className="size-4" />
						Recipients
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4">
					<div className="space-y-2">
						<Label htmlFor="mail-to">To (comma separated)</Label>
						<form.Field
							name="toEmails"
							validators={{
								onChange: ({ value }) =>
									value.trim() && !/^[^\s@,;]+@[^\s@]+\.[^\s@,;]+/.test(value)
										? "Enter valid emails separated by commas"
										: undefined,
							}}
						>
							{(field) => (
								<Input
									id="mail-to"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="it@bfginternational.com, support@bfginternational.com"
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mail-cc">CC (comma separated)</Label>
						<form.Field name="ccEmails">
							{(field) => (
								<Input
									id="mail-cc"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Optional CC recipients"
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-2">
						<form.Field name="enabled">
							{(field) => (
								<Label className="flex cursor-pointer items-center justify-between gap-3 border p-3">
									<span className="text-xs font-medium">
										Send email notifications
									</span>
									<Switch
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
								</Label>
							)}
						</form.Field>
					</div>
				</CardContent>
			</Card>

			<Separator />

			<div className="flex flex-wrap items-center gap-2">
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<>
							<Button
								type="button"
								variant="outline"
								disabled={testMutation.isPending || saveMutation.isPending}
								onClick={handleTest}
							>
								{testMutation.isPending ? (
									<Loader2 className="animate-spin" />
								) : (
									<Send />
								)}
								Send test email
							</Button>
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting || saveMutation.isPending}
							>
								{saveMutation.isPending ? (
									<Loader2 className="animate-spin" />
								) : (
									<Save />
								)}
								Save settings
							</Button>
						</>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}

function ContractRemindersSection() {
	const { data: reminders } = trpc.contracts.reminders.get.useQuery();
	const saveMutation = trpc.contracts.reminders.save.useMutation();
	const runMutation = trpc.contracts.reminders.run.useMutation();

	const [enabled, setEnabled] = useState(false);
	const [remindDays, setRemindDays] = useState("30,60,90");
	const [loaded, setLoaded] = useState(false);

	if (reminders && !loaded) {
		setEnabled(reminders.enabled);
		setRemindDays(reminders.remindDays);
		setLoaded(true);
	}

	const dirty =
		!reminders ||
		reminders.enabled !== enabled ||
		reminders.remindDays !== remindDays;

	const handleSave = async () => {
		try {
			await saveMutation.mutateAsync({ enabled, remindDays });
			toast.success(
				enabled
					? "Contract reminders saved and enabled"
					: "Contract reminders saved",
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save reminders",
			);
		}
	};

	const handleSendNow = async () => {
		try {
			const result = await runMutation.mutateAsync();
			if (result.sent) {
				toast.success(`Reminder email sent for ${result.matched} contract(s)`);
			} else if (result.error) {
				toast.error(result.error);
			} else {
				toast.warning(result.reason ?? "Nothing to send");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to run reminders",
			);
		}
	};

	return (
		<Card className="rounded-none">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<BellRing className="size-4" />
					Contract Reminders
				</CardTitle>
				<CardDescription>
					Daily digest of active contracts reaching their reminder dates.
					Recipients come from the mail settings above. Schedule a daily call to{" "}
					<code className="text-[10px]">/api/cron/contract-reminders</code> to
					automate it.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Label className="flex cursor-pointer items-center justify-between gap-3 border p-3">
					<span className="text-xs font-medium">
						Send contract renewal reminders
					</span>
					<Switch checked={enabled} onCheckedChange={setEnabled} />
				</Label>
				<div className="space-y-2">
					<Label htmlFor="contract-remind-days">Reminder days before end</Label>
					<Input
						id="contract-remind-days"
						value={remindDays}
						onChange={(e) => setRemindDays(e.target.value)}
						maxLength={100}
						placeholder="30,60,90"
					/>
					<p className="text-xs text-muted-foreground">
						Comma-separated days before the contract end date, e.g. 30,60,90.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={runMutation.isPending || saveMutation.isPending}
						onClick={handleSendNow}
					>
						{runMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Send />
						)}
						Send now
					</Button>
					<Button
						type="button"
						disabled={!dirty || saveMutation.isPending || runMutation.isPending}
						onClick={handleSave}
					>
						{saveMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Save />
						)}
						Save
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
