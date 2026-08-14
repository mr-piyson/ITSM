"use client";

import {
	History,
	Loader2,
	MapPin,
	Pencil,
	Plus,
	Trash2,
	User,
} from "lucide-react";
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
	isTonerAction,
	printerActionBadge,
	printerImageUrl,
} from "@/lib/printer-constants";
import { cn } from "@/lib/utils";
import type { PrinterItem } from "@/server/routers/printers";
import { trpc } from "@/trpc/react";

type PrinterDetailsDialogProps = {
	printer: PrinterItem | null;
	onOpenChange: (printer: PrinterItem | null) => void;
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

export function PrinterDetailsDialog({
	printer,
	onOpenChange,
	onEdit,
	onAction,
	onDeleted,
}: PrinterDetailsDialogProps) {
	const { data: detail, isPending } = trpc.printers.byId.useQuery(
		{ id: printer?.id ?? 0 },
		{ enabled: !!printer },
	);
	const deleteMutation = trpc.printers.delete.useMutation();

	const handleDelete = async () => {
		if (!printer) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: printer.id });
			toast.success("Printer deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete printer",
			);
		}
	};

	const imageUrl = printer ? printerImageUrl(printer.img) : null;

	return (
		<Dialog
			open={!!printer}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4 pr-8">
						<div className="min-w-0">
							<DialogTitle>Printer Details</DialogTitle>
							<DialogDescription>
								{printer ? printer.name : ""}
							</DialogDescription>
						</div>
					</div>
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
								<div className="space-y-1">
									{detail.location && (
										<p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
											<MapPin className="size-3.5 shrink-0" />
											{detail.location}
										</p>
									)}
									{detail.usedBy && (
										<p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
											<User className="size-3.5 shrink-0" />
											{detail.usedBy}
										</p>
									)}
								</div>
								{detail.printerLink && (
									<p className="truncate text-xs">
										<a
											href={`http://${detail.printerLink}`}
											target="_blank"
											rel="noreferrer"
											className="text-primary underline"
										>
											{detail.printerLink}
										</a>
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
							<Row label="Location" value={detail.location} />
							<Row label="Department" value={detail.department} />
							<Row label="Used By" value={detail.usedBy} />
							<Row label="Printer Link" value={detail.printerLink} />
						</div>

						{/* Printer Info */}
						{detail.info && (
							<>
								<Separator />
								<div className="space-y-2">
									<h4 className="text-sm font-semibold">Printer Info</h4>
									<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
										<Row
											label="Manufacturer"
											value={detail.info.manufacturer}
										/>
										<Row label="Model" value={detail.info.model} />
										<Row
											label="Serial Number"
											value={detail.info.serialNumber}
										/>
										<Row label="Firmware" value={detail.info.firmware} />
										<Row
											label="RFID"
											value={
												detail.info.RFID === null
													? null
													: detail.info.RFID
														? "Yes"
														: "No"
											}
										/>
										<Row label="Darkness" value={detail.info.darkness} />
										<Row
											label="Print Speed"
											value={
												detail.info.printSpeed === null
													? null
													: String(detail.info.printSpeed)
											}
										/>
										<Row
											label="Tear Off Adjust"
											value={
												detail.info.tearOffAdjust === null
													? null
													: String(detail.info.tearOffAdjust)
											}
										/>
										<Row label="Print Mode" value={detail.info.printMode} />
										<Row label="Media Type" value={detail.info.mediaType} />
										<Row
											label="Sensor Select"
											value={detail.info.sensorSelect}
										/>
										<Row label="Print Method" value={detail.info.printMethod} />
										<Row
											label="Print Width"
											value={
												detail.info.printWidth === null
													? null
													: String(detail.info.printWidth)
											}
										/>
										<Row
											label="Label Length"
											value={
												detail.info.labelLength === null
													? null
													: String(detail.info.labelLength)
											}
										/>
										<Row
											label="Label Top"
											value={
												detail.info.labelTop === null
													? null
													: String(detail.info.labelTop)
											}
										/>
										<Row
											label="Left Position"
											value={
												detail.info.leftPosition === null
													? null
													: String(detail.info.leftPosition)
											}
										/>
									</div>
								</div>
							</>
						)}

						{/* Printer Actions */}
						<Separator />
						<div className="space-y-2">
							<div className="flex items-center gap-1.5">
								<History className="size-4 text-muted-foreground" />
								<h4 className="text-sm font-semibold">
									Printer Actions ({detail.actions.length})
								</h4>
							</div>
							{detail.actions.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No actions recorded yet.
								</p>
							) : (
								<ul className="space-y-2">
									{detail.actions.map((action) => (
										<li
											key={action.id}
											className="rounded-none border px-3 py-2"
										>
											<div className="flex flex-wrap items-center gap-2">
												<span
													className={cn(
														"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
														printerActionBadge(action.actionType),
													)}
												>
													{action.actionType}
												</span>
												<span className="text-xs text-muted-foreground">
													{action.actionDate}
												</span>
												<span className="ml-auto shrink-0 text-xs">
													{action.actionBy || "-"}
												</span>
											</div>
											{(isTonerAction(action.actionType) && action.itemName) ||
											action.note ||
											action.requestedBy ||
											action.recievedBy ? (
												<div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
													{isTonerAction(action.actionType) &&
														action.itemName && (
															<p>
																<span className="font-medium text-foreground">
																	Toner:
																</span>{" "}
																{action.itemName}
															</p>
														)}
													{action.note && <p>Note: {action.note}</p>}
													{(action.requestedBy || action.recievedBy) && (
														<p>
															{action.requestedBy || "—"} →{" "}
															{action.recievedBy || "—"}
														</p>
													)}
												</div>
											) : null}
										</li>
									))}
								</ul>
							)}
						</div>

						{/* Linked Toners/Rolls */}
						<Separator />
						<div className="space-y-2">
							<h4 className="text-sm font-semibold">
								Linked Toners/Rolls ({detail.linkedToners.length})
							</h4>
							{detail.linkedToners.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No linked toners or rolls.
								</p>
							) : (
								<ul className="space-y-2">
									{detail.linkedToners.map((toner) => {
										const tonerImage = printerImageUrl(toner.img);
										return (
											<li
												key={toner.id}
												className="flex items-center gap-3 rounded-none border px-3 py-2"
											>
												{tonerImage ? (
													<img
														src={tonerImage}
														alt={toner.name}
														className="h-10 w-14 shrink-0 object-contain"
													/>
												) : (
													<div className="flex h-10 w-14 shrink-0 items-center justify-center bg-muted text-[10px] text-muted-foreground">
														No image
													</div>
												)}
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">
														{toner.name}
													</p>
													<p className="truncate text-xs text-muted-foreground">
														{toner.brand || "-"}
													</p>
												</div>
												<span
													className={cn(
														"shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
														toner.stock > 0
															? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
															: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
													)}
												>
													{toner.stock} in stock
												</span>
											</li>
										);
									})}
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
								<AlertDialogTitle>Delete this printer?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove <strong>{printer?.name}</strong> from the
									active printer list. The action can be reviewed in the change
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
