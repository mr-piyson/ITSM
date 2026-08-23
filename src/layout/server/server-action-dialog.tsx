"use client";

import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { Loader2, Upload, Wrench } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { SERVER_ACTION_TYPES, serverImageUrl } from "@/lib/server-constants";
import type { ServerItem } from "@/server/routers/servers";
import { trpc } from "@/trpc/react";

// Same action users as the legacy serverActionsLog.php select
const ACTION_USER_OPTIONS = [
	{ id: 179, name: "Salman Almosawi" },
	{ id: 5400, name: "Husain Rustam" },
	{ id: 5152, name: "Hadi Almahari" },
];

function nowLocalInput(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
		now.getDate(),
	)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

type ServerActionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	server: ServerItem | null;
	onSuccess: () => void;
};

export function ServerActionDialog({
	open,
	onOpenChange,
	server,
	onSuccess,
}: ServerActionDialogProps) {
	const addActionMutation = trpc.servers.addAction.useMutation();
	const uploadImageMutation = trpc.servers.uploadActionImage.useMutation();

	const [imageBusy, setImageBusy] = useState(false);
	const [image, setImage] = useState("");

	const form = useForm({
		defaultValues: {
			actionType:
				SERVER_ACTION_TYPES[0] as (typeof SERVER_ACTION_TYPES)[number],
			user: ACTION_USER_OPTIONS[0].id,
			actionDate: nowLocalInput(),
			actionPeriod: "",
			actionDescription: "",
		},
		onSubmit: async ({ value }) => {
			if (!server) {
				return;
			}
			try {
				await addActionMutation.mutateAsync({
					serverID: server.id,
					actionType: value.actionType,
					actionDate: value.actionDate,
					actionPeriod: value.actionPeriod.trim(),
					actionDescription: value.actionDescription,
					user: value.user,
					actionImage: image || null,
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

	const handleFile = async (file?: File) => {
		if (!file) {
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file");
			return;
		}
		setImageBusy(true);
		try {
			const dataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = () => reject(new Error("Could not read the file"));
				reader.readAsDataURL(file);
			});
			const { image: uploaded } = await uploadImageMutation.mutateAsync({
				dataUrl,
			});
			setImage(uploaded);
			toast.success("Image uploaded");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Image upload failed",
			);
		} finally {
			setImageBusy(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					form.reset();
					setImage("");
				}
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Wrench className="size-4 text-muted-foreground" />
						Log An Action
					</DialogTitle>
					<DialogDescription>
						{server ? `Record an action for ${server.name}.` : ""}
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
							<Label>User *</Label>
							<form.Field name="user">
								{(field) => (
									<Select
										value={String(field.state.value)}
										onValueChange={(value) => field.handleChange(Number(value))}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select user" />
										</SelectTrigger>
										<SelectContent>
											{ACTION_USER_OPTIONS.map((user) => (
												<SelectItem key={user.id} value={String(user.id)}>
													{user.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label>Action Type *</Label>
							<form.Field name="actionType">
								{(field) => (
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(
												(value ??
													SERVER_ACTION_TYPES[0]) as (typeof SERVER_ACTION_TYPES)[number],
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{SERVER_ACTION_TYPES.map((type) => (
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
							<Label htmlFor="actionDate">Date &amp; Time *</Label>
							<form.Field name="actionDate">
								{(field) => (
									<Input
										id="actionDate"
										type="datetime-local"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<Label htmlFor="actionPeriod">Completion Period *</Label>
							<form.Field name="actionPeriod">
								{(field) => (
									<Input
										id="actionPeriod"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										maxLength={50}
										placeholder="e.g. 2 hours"
									/>
								)}
							</form.Field>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="actionDescription">Description</Label>
						<form.Field name="actionDescription">
							{(field) => (
								<Textarea
									id="actionDescription"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									maxLength={200}
									className="resize-none"
									rows={3}
									placeholder="Describe the action..."
								/>
							)}
						</form.Field>
					</div>

					<div className="space-y-2">
						<Label>Image</Label>
						<div className="flex items-start gap-3">
							{serverImageUrl(image) ? (
								<img
									src={serverImageUrl(image) ?? ""}
									alt="Action preview"
									className="h-16 w-24 shrink-0 object-contain"
								/>
							) : (
								<div className="flex h-16 w-24 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
									No image
								</div>
							)}
							<div className="flex-1 space-y-1.5">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="w-full"
									disabled={imageBusy}
									onClick={() =>
										document.getElementById("serverActionImageInput")?.click()
									}
								>
									{imageBusy ? (
										<Loader2 className="animate-spin" />
									) : (
										<Upload />
									)}
									{imageBusy ? "Uploading…" : "Upload image"}
								</Button>
								<input
									id="serverActionImageInput"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => handleFile(e.target.files?.[0])}
								/>
								<p className="text-xs text-muted-foreground">
									PNG, JPG or WebP up to 5 MB.
								</p>
							</div>
						</div>
					</div>

					<DialogFooter>
						<form.Subscribe selector={(state) => [state.isSubmitting]}>
							{([isSubmitting]) => (
								<Button
									type="submit"
									disabled={
										isSubmitting || addActionMutation.isPending || imageBusy
									}
								>
									{isSubmitting ? <Loader2 className="animate-spin" /> : "Send"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
