"use client";

import { History, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { DccItem } from "@/server/routers/ITSM/dccs";
import { trpc } from "@/trpc/react";

import { DccConnectivityChart } from "./dcc-connectivity-chart";
import { DccStatusBadge } from "./dcc-status-badge";

type DccDetailsDialogProps = {
	dcc: DccItem | null;
	onOpenChange: (dcc: DccItem | null) => void;
	onEdit: () => void;
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

function FeatureTag({ enabled, label }: { enabled: boolean; label: string }) {
	return (
		<span
			className={cn(
				"inline-flex whitespace-nowrap px-1.5 py-0.5 text-[10px] font-medium",
				enabled
					? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
					: "bg-muted text-muted-foreground",
			)}
		>
			{label}
		</span>
	);
}

export function DccDetailsDialog({
	dcc,
	onOpenChange,
	onEdit,
	onDeleted,
}: DccDetailsDialogProps) {
	const { data: detail, isPending } = trpc.dccs.byId.useQuery(
		{ id: dcc?.id ?? 0 },
		{ enabled: !!dcc },
	);
	const deleteMutation = trpc.dccs.delete.useMutation();
	const checkMutation = trpc.dccs.checkConnectivity.useMutation();
	const utils = trpc.useUtils();

	const handleDelete = async () => {
		if (!dcc) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: dcc.id });
			toast.success("DCC deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete DCC",
			);
		}
	};

	const handleCheck = async () => {
		if (!dcc) {
			return;
		}
		try {
			const result = await checkMutation.mutateAsync({ id: dcc.id });
			utils.dccs.byId.invalidate({ id: dcc.id });
			utils.dccs.list.invalidate();
			utils.dccs.dashboard.invalidate();
			toast.success(
				result.status === "connected"
					? "DCC is connected"
					: "DCC is disconnected",
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Connectivity check failed",
			);
		}
	};

	return (
		<Dialog
			open={!!dcc}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>
						{dcc ? `${dcc.dccCode || "DCC"} Details` : "DCC Details"}
					</DialogTitle>
					<DialogDescription>{dcc ? dcc.name : ""}</DialogDescription>
				</DialogHeader>

				{isPending || !detail ? (
					<div className="flex h-48 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-5">
						{/* Status header */}
						<div className="flex items-center justify-between gap-3">
							<div className="flex flex-wrap items-center gap-1.5">
								<DccStatusBadge status={detail.lastStatus} />
								<Button
									variant="outline"
									size="sm"
									disabled={checkMutation.isPending}
									onClick={handleCheck}
								>
									<RefreshCw
										className={cn(checkMutation.isPending && "animate-spin")}
									/>
									Check now
								</Button>
							</div>
							{detail.lastCheckedAt && (
								<span className="shrink-0 text-xs text-muted-foreground">
									Last checked:{" "}
									{new Date(detail.lastCheckedAt).toLocaleString()}
								</span>
							)}
						</div>

						{/* Device info */}
						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
							<Row label="Name" value={detail.name} />
							<Row label="Raspberry Pi IP" value={detail.ipAddress} />
							<Row label="Card Reader IP" value={detail.cardReaderIp} />
							<Row
								label="Card Reader ID"
								value={detail.cardReaderId ? String(detail.cardReaderId) : null}
							/>
							<Row label="Screen" value={detail.screenInch} />
							<Row
								label="Check Interval"
								value={
									detail.checkIntervalSeconds
										? `${detail.checkIntervalSeconds < 60 ? detail.checkIntervalSeconds : detail.checkIntervalSeconds < 3600 ? `${detail.checkIntervalSeconds / 60} min` : `${detail.checkIntervalSeconds / 3600} h`}`
										: null
								}
							/>
						</div>

						{/* Features */}
						<div className="space-y-2">
							<h4 className="text-sm font-semibold">Features</h4>
							<div className="flex flex-wrap gap-1.5">
								<FeatureTag enabled={detail.toggles} label="Toggles" />
								<FeatureTag enabled={detail.scanner} label="Scanner" />
								<FeatureTag enabled={detail.cardReader} label="Card Reader" />
								<FeatureTag
									enabled={detail.paperPrinter}
									label="Paper Printer"
								/>
								<FeatureTag
									enabled={detail.rfidLabelPrinter}
									label="RFID Label Printer"
								/>
								<FeatureTag enabled={detail.lightTower} label="Light Tower" />
							</div>
						</div>

						{/* Connectivity logs */}
						<Separator />
						<div className="space-y-2">
							<div className="flex items-center gap-1.5">
								<History className="size-4 text-muted-foreground" />
								<h4 className="text-sm font-semibold">
									Connectivity History ({detail.logs.length})
								</h4>
							</div>
							<DccConnectivityChart logs={detail.logs} />
							{detail.logs.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No connectivity checks recorded yet. Press{" "}
									<strong>Check now</strong> to run the first one.
								</p>
							) : (
								<ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
									{detail.logs.slice(0, 50).map((log) => (
										<li
											key={log.id}
											className="rounded-none border px-3 py-1.5 text-xs"
										>
											<div className="flex items-center gap-2">
												<span
													className={cn(
														"size-2 shrink-0 rounded-full",
														log.status === "connected"
															? "bg-green-600 dark:bg-green-400"
															: "bg-red-600 dark:bg-red-400",
													)}
												/>
												<span className="font-medium">{log.status}</span>
												<span className="text-muted-foreground">
													{log.checkedAt
														? new Date(log.checkedAt).toLocaleString()
														: "—"}
												</span>
											</div>
											<div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
												<span className="inline-flex items-center gap-1.5">
													<span
														className={cn(
															"size-1.5 rounded-full",
															log.dccReachable
																? "bg-green-600 dark:bg-green-400"
																: "bg-red-600 dark:bg-red-400",
														)}
													/>
													<span className="text-muted-foreground">DCC:</span>
													{log.dccReachable ? "Online" : "Offline"}
													{log.dccPingLatencyMs != null && (
														<span className="font-mono text-muted-foreground">
															{log.dccPingLatencyMs} ms
														</span>
													)}
												</span>
												<span
													className={cn(
														"inline-flex items-center gap-1.5",
														"sm:text-right",
													)}
												>
													<span
														className={cn(
															"size-1.5 rounded-full",
															log.readerReachable
																? "bg-green-600 dark:bg-green-400"
																: "bg-red-600 dark:bg-red-400",
														)}
													/>
													<span className="text-muted-foreground">Reader:</span>
													{log.readerReachable ? "Online" : "Offline"}
													{log.readerPingLatencyMs != null && (
														<span className="font-mono text-muted-foreground">
															{log.readerPingLatencyMs} ms
														</span>
													)}
												</span>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}

				<DialogFooter>
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
								<AlertDialogTitle>Delete this DCC?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove{" "}
									<strong>{dcc?.dccCode || dcc?.name || "this DCC"}</strong>{" "}
									from the active list. The action can be reviewed in the change
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
