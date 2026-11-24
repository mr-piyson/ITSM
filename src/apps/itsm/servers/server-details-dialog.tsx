"use client";

import { History, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	capitalize,
	formatServerActionDate,
	formatServerDate,
	serverImageUrl,
	serverActionBadge,
	serverStatusBadge,
} from "@/lib/server-constants";
import { cn } from "@/lib/utils";
import type { ServerDetail, ServerItem } from "@/server/routers/ITSM/servers";
import { trpc } from "@/trpc/react";

type ServerDetailsDialogProps = {
	server: ServerItem | null;
	onOpenChange: (server: ServerItem | null) => void;
	onEdit: () => void;
	onAction: () => void;
	onDeleted: () => void;
};

function Row({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-xs font-medium break-words">{value || "-"}</span>
		</div>
	);
}

export function ServerDetailsDialog({
	server,
	onOpenChange,
	onEdit,
	onAction,
	onDeleted,
}: ServerDetailsDialogProps) {
	const { data: detail, isPending } = trpc.servers.byId.useQuery(
		{ id: server?.id ?? 0 },
		{ enabled: !!server },
	);
	const deleteMutation = trpc.servers.delete.useMutation();

	const handleDelete = async () => {
		if (!server) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: server.id });
			toast.success("Server deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete server",
			);
		}
	};

	const imageUrl = server ? serverImageUrl(server.image) : null;

	return (
		<Dialog
			open={!!server}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Server Details</DialogTitle>
					<DialogDescription>{server ? server.name : ""}</DialogDescription>
				</DialogHeader>

				{isPending || !detail ? (
					<div className="flex h-48 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-5">
						{/* General Information */}
						<div className="flex items-start gap-4">
							{imageUrl ? (
								<img
									src={imageUrl}
									alt={detail.name}
									className="h-28 w-36 shrink-0 object-contain"
								/>
							) : (
								<div className="flex h-28 w-36 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
									No image
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-2">
								<p className="truncate text-base font-semibold">
									{detail.name || "-"}
								</p>
								<div className="flex flex-wrap gap-1.5">
									<StatusBadge detail={detail} />
								</div>
								<p className="text-xs text-muted-foreground">
									#{detail.id} · {detail.type ? capitalize(detail.type) : "-"} ·{" "}
									{detail.host || "-"}
								</p>
								{detail.serverIP && (
									<p className="truncate text-xs">
										<a
											href={`http://${detail.serverIP}`}
											target="_blank"
											rel="noreferrer"
											className="text-primary underline"
										>
											{detail.serverIP}
										</a>
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
							<Row
								label="Type"
								value={detail.type ? capitalize(detail.type) : null}
							/>
							<Row label="Host IP" value={detail.hostIP} />
							<Row label="OS" value={detail.os} />
							<Row
								label="Last Maintenance"
								value={formatServerDate(detail.maintenanceLast)}
							/>
							<Row
								label="Next Maintenance"
								value={formatServerDate(detail.maintenanceDue)}
							/>
							<Row
								label="Backup"
								value={
									detail.backupStatus === "yes"
										? `Yes${detail.backupSoftware ? ` — ${detail.backupSoftware}` : ""}`
										: "No"
								}
							/>
						</div>

						{/* Specs */}
						<Separator />
						<div className="space-y-2">
							<h4 className="text-sm font-semibold">Specs</h4>
							<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
								<Row label="CPU" value={detail.cpu} />
								<Row label="RAM" value={detail.ram} />
								<Row label="Applications" value={detail.applications} />
								{detail.diskAmount === 2 ? (
									<>
										<Row label="Disk 1 Size" value={detail.disk} />
										<Row label="Disk 2 Size" value={detail.disk2} />
										<Row label="Disk 1 Type" value={detail.diskType} />
										<Row label="Disk 2 Type" value={detail.diskType2} />
										<Row label="Storage 1 Location" value={detail.location} />
										<Row label="Storage 2 Location" value={detail.location2} />
									</>
								) : (
									<>
										<Row label="Number of Disks" value="1" />
										<Row label="Disk Size" value={detail.disk} />
										<Row label="Disk Type" value={detail.diskType} />
										<Row label="Storage Location" value={detail.location} />
									</>
								)}
							</div>
						</div>

						{/* Notes */}
						{(detail.descrip || detail.notes) && (
							<>
								<Separator />
								<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
									<Row label="Description" value={detail.descrip} />
									<Row label="Notes" value={detail.notes} />
								</div>
							</>
						)}

						{/* Actions */}
						<Separator />
						<div className="space-y-2">
							<div className="flex items-center gap-1.5">
								<History className="size-4 text-muted-foreground" />
								<h4 className="text-sm font-semibold">
									Server Actions ({detail.actions.length})
								</h4>
							</div>
							{detail.actions.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No actions recorded yet.
								</p>
							) : (
								<ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
									{detail.actions.map((action) => (
										<li
											key={action.id}
											className="rounded-none border px-3 py-2"
										>
											<div className="flex flex-wrap items-center gap-2">
												<span
													className={cn(
														"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
														serverActionBadge(action.actionType),
													)}
												>
													{action.actionType}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatServerActionDate(action.actionDate)}
												</span>
												<span className="ml-auto shrink-0 text-xs">
													{action.userName
														? `${action.userEmpID ?? ""} ${action.userName}`.trim()
														: "-"}
												</span>
											</div>
											{(action.actionPeriod ||
												action.actionDescription ||
												action.actionImage) && (
												<div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
													{action.actionPeriod && (
														<p>
															<span className="font-medium text-foreground">
																Period:
															</span>{" "}
															{action.actionPeriod}
														</p>
													)}
													{action.actionDescription && (
														<p>{action.actionDescription}</p>
													)}
													{action.actionImage && (
														<a
															href={serverImageUrl(action.actionImage) ?? "#"}
															target="_blank"
															rel="noreferrer"
														>
															<img
																src={serverImageUrl(action.actionImage) ?? ""}
																alt="Action"
																className="mt-1 h-12 object-contain"
															/>
														</a>
													)}
												</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onAction} disabled={!detail}>
						<Plus data-icon="inline-start" />
						Add Action
					</Button>
					<Button variant="outline" onClick={onEdit} disabled={!detail}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button
									variant="destructive"
									disabled={!detail || deleteMutation.isPending}
								/>
							}
						>
							{deleteMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Trash2 data-icon="inline-start" />
							)}
							Delete
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete this server?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove <strong>{server?.name}</strong> from the
									active server list. The action can be reviewed in the change
									logs.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction variant="destructive" onClick={handleDelete}>
									{deleteMutation.isPending ? (
										<Loader2 className="animate-spin" />
									) : (
										"Delete"
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function StatusBadge({ detail }: { detail: ServerDetail }) {
	const badge = serverStatusBadge({
		serverStatus: detail.serverStatus,
		maintenanceDue: detail.maintenanceDue,
	});
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
				badge.className,
			)}
		>
			{badge.label}
		</span>
	);
}
