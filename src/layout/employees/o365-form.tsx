"use client";

import { useEffect } from "react";

import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LICENSE_LABELS } from "@/lib/employees-constants";
import type {
	EmployeeGroup,
	Office365Details,
} from "@/server/routers/employees";
import { trpc } from "@/trpc/react";

const MAX_GROUPS = 5;

type O365FormValues = {
	license: "standard" | "basic" | "e3";
	msProject: boolean;
	powerPi: boolean;
	authenticationEnabled: boolean;
	authenticationTwoFactor: boolean;
	authenticationAuthenticator: boolean;
	authenticationPhone: boolean;
	recipientLimit: string;
	oneDrive: boolean;
	mailType: string;
	mailStorageSize: string;
	onlineMailboxArchive: boolean;
	onlineArchiveStorageSize: string;
	groups: string[];
};

function emptyValues(): O365FormValues {
	return {
		license: "standard",
		msProject: false,
		powerPi: false,
		authenticationEnabled: false,
		authenticationTwoFactor: false,
		authenticationAuthenticator: false,
		authenticationPhone: false,
		recipientLimit: "30",
		oneDrive: false,
		mailType: "Default Mailbox",
		mailStorageSize: "50GB",
		onlineMailboxArchive: false,
		onlineArchiveStorageSize: "50GB",
		groups: ["BFG Bahrain List"],
	};
}

function fromOffice365(
	office365: Office365Details | null,
	groups: EmployeeGroup[],
): O365FormValues {
	if (!office365) {
		return emptyValues();
	}
	const groupNames = groups.map((group) => group.groupName);
	return {
		license: (["standard", "basic", "e3"] as const).includes(
			office365.license as "standard" | "basic" | "e3",
		)
			? (office365.license as "standard" | "basic" | "e3")
			: "standard",
		msProject: office365.msProject,
		powerPi: office365.powerPi,
		authenticationEnabled:
			office365.authenticationTwoFactor ||
			office365.authenticationAuthenticator ||
			office365.authenticationPhone,
		authenticationTwoFactor: office365.authenticationTwoFactor,
		authenticationAuthenticator: office365.authenticationAuthenticator,
		authenticationPhone: office365.authenticationPhone,
		recipientLimit: office365.recipientLimit,
		oneDrive: office365.oneDrive,
		mailType: office365.mailType,
		mailStorageSize: office365.mailStorageSize,
		onlineMailboxArchive: office365.onlineMailboxArchive,
		onlineArchiveStorageSize: office365.onlineArchiveStorageSize,
		groups: groupNames.length > 0 ? groupNames : ["BFG Bahrain List"],
	};
}

function EnabledSelect({
	value,
	onValueChange,
	disabled,
	label,
}: {
	value: boolean;
	onValueChange: (value: boolean) => void;
	disabled?: boolean;
	label: string;
}) {
	return (
		<Select
			value={value ? "Enabled" : "Disabled"}
			onValueChange={(value) => onValueChange(value === "Enabled")}
			disabled={disabled}
		>
			<SelectTrigger className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="Enabled">{label}: Enabled</SelectItem>
				<SelectItem value="Disabled">{label}: Disabled</SelectItem>
			</SelectContent>
		</Select>
	);
}

type O365FormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	empID: number;
	employeeName: string;
	office365: Office365Details | null;
	groups: EmployeeGroup[];
	onSuccess: () => void;
};

export function O365FormDialog({
	open,
	onOpenChange,
	empID,
	employeeName,
	office365,
	groups,
	onSuccess,
}: O365FormDialogProps) {
	const updateMutation = trpc.employees.updateOffice365.useMutation();

	const form = useForm({
		defaultValues: fromOffice365(office365, groups),
		onSubmit: async ({ value }) => {
			try {
				await updateMutation.mutateAsync({
					empID,
					license: value.license,
					msProject: value.msProject,
					powerPi: value.powerPi,
					authenticationTwoFactor:
						value.authenticationEnabled && value.authenticationTwoFactor,
					authenticationAuthenticator:
						value.authenticationEnabled && value.authenticationAuthenticator,
					authenticationPhone:
						value.authenticationEnabled && value.authenticationPhone,
					recipientLimit: value.recipientLimit.trim(),
					oneDrive: value.oneDrive,
					mailType: value.mailType,
					mailStorageSize: value.mailStorageSize,
					onlineMailboxArchive: value.onlineMailboxArchive,
					onlineArchiveStorageSize: value.onlineArchiveStorageSize,
					groups: value.groups
						.map((group) => group.trim())
						.filter((group) => group.length > 0),
				});
				toast.success("Office 365 details updated successfully");
				onSuccess();
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update Office 365 details",
				);
			}
		},
	});

	const license = form.state.values.license;

	useEffect(() => {
		if (license === "standard" || license === "basic") {
			form.setFieldValue("mailStorageSize", "50GB");
			form.setFieldValue("onlineArchiveStorageSize", "50GB");
		} else {
			form.setFieldValue("mailStorageSize", "100GB");
			form.setFieldValue("onlineArchiveStorageSize", "100GB");
		}
	}, [license, form]);

	const addGroup = () => {
		if (form.state.values.groups.length >= MAX_GROUPS) {
			toast.error("Too Many Groups!");
			return;
		}
		form.setFieldValue("groups", [...form.state.values.groups, ""]);
	};

	const removeGroup = (index: number) => {
		form.setFieldValue(
			"groups",
			form.state.values.groups.filter((_, i) => i !== index),
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Update License Details</DialogTitle>
					<DialogDescription>
						{employeeName} (ID: {empID})
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid grid-cols-1 gap-6 sm:grid-cols-2"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>MS License</Label>
							<form.Field name="license">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "standard" | "basic" | "e3")
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(
												Object.keys(LICENSE_LABELS) as Array<
													keyof typeof LICENSE_LABELS
												>
											).map((key) => (
												<SelectItem key={key} value={key}>
													{LICENSE_LABELS[key]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Other Licenses</Label>
							<div className="flex items-center gap-6">
								<form.Field name="msProject">
									{(field) => (
										<div className="flex items-center gap-2">
											<Checkbox
												id="o365-msproject"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(!!checked)
												}
											/>
											<Label htmlFor="o365-msproject" className="font-normal">
												Microsoft Project
											</Label>
										</div>
									)}
								</form.Field>
								<form.Field name="powerPi">
									{(field) => (
										<div className="flex items-center gap-2">
											<Checkbox
												id="o365-powerbi"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(!!checked)
												}
											/>
											<Label htmlFor="o365-powerbi" className="font-normal">
												Power Bi Pro
											</Label>
										</div>
									)}
								</form.Field>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Authentication</Label>
							<form.Field name="authenticationEnabled">
								{(field) => (
									<Select
										value={field.state.value ? "Enabled" : "Disabled"}
										onValueChange={(value) =>
											field.handleChange(value === "Enabled")
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Enabled">Enabled</SelectItem>
											<SelectItem value="Disabled">Disabled</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
							<div className="flex flex-wrap items-center gap-4">
								<form.Field name="authenticationTwoFactor">
									{(field) => (
										<div className="flex items-center gap-2">
											<Checkbox
												id="o365-twofactor"
												checked={field.state.value}
												disabled={!form.state.values.authenticationEnabled}
												onCheckedChange={(checked) =>
													field.handleChange(!!checked)
												}
											/>
											<Label htmlFor="o365-twofactor" className="font-normal">
												Two Factor
											</Label>
										</div>
									)}
								</form.Field>
								<form.Field name="authenticationAuthenticator">
									{(field) => (
										<div className="flex items-center gap-2">
											<Checkbox
												id="o365-authenticator"
												checked={field.state.value}
												disabled={!form.state.values.authenticationEnabled}
												onCheckedChange={(checked) =>
													field.handleChange(!!checked)
												}
											/>
											<Label
												htmlFor="o365-authenticator"
												className="font-normal"
											>
												Authenticator
											</Label>
										</div>
									)}
								</form.Field>
								<form.Field name="authenticationPhone">
									{(field) => (
										<div className="flex items-center gap-2">
											<Checkbox
												id="o365-phone"
												checked={field.state.value}
												disabled={!form.state.values.authenticationEnabled}
												onCheckedChange={(checked) =>
													field.handleChange(!!checked)
												}
											/>
											<Label htmlFor="o365-phone" className="font-normal">
												Phone
											</Label>
										</div>
									)}
								</form.Field>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Office 365 Groups</Label>
							<form.Field name="groups">
								{(field) => (
									<div className="space-y-2">
										{field.state.value.map((group, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													value={group}
													maxLength={100}
													placeholder="Group name"
													onChange={(e) => {
														const next = [...field.state.value];
														next[index] = e.target.value;
														field.handleChange(next);
													}}
												/>
												{index > 0 && (
													<Button
														type="button"
														variant="ghost"
														size="icon-sm"
														title="Remove group"
														onClick={() => removeGroup(index)}
													>
														<X />
													</Button>
												)}
											</div>
										))}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											disabled={field.state.value.length >= MAX_GROUPS}
											onClick={addGroup}
										>
											<Plus />
											Add Group
										</Button>
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Recipient Limit</Label>
							<form.Field name="recipientLimit">
								{(field) => (
									<Input
										value={field.state.value}
										maxLength={50}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>One Drive</Label>
							<form.Field name="oneDrive">
								{(field) => (
									<EnabledSelect
										label="OneDrive"
										value={field.state.value}
										onValueChange={field.handleChange}
									/>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Mail Type</Label>
							<form.Field name="mailType">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? "Default Mailbox")
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Default Mailbox">
												Default Mailbox
											</SelectItem>
											<SelectItem value="Shared Mailbox">
												Shared Mailbox
											</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Mail Storage Size</Label>
							<form.Field name="mailStorageSize">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? "50GB")
										}
										disabled
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="50GB">50GB</SelectItem>
											<SelectItem value="100GB">100GB</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Online Mailbox Archive</Label>
							<form.Field name="onlineMailboxArchive">
								{(field) => (
									<EnabledSelect
										label="Archive"
										value={field.state.value}
										onValueChange={field.handleChange}
									/>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Online Archive Storage Size</Label>
							<form.Field name="onlineArchiveStorageSize">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? "50GB")
										}
										disabled
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="50GB">50GB</SelectItem>
											<SelectItem value="100GB">100GB</SelectItem>
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>
					</div>

					<DialogFooter className="sm:col-span-2">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<Loader2 className="animate-spin" />
									) : (
										"Update"
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
