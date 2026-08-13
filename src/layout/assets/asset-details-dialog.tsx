"use client";

import { BadgeCheck, Loader2, Pencil, Trash2 } from "lucide-react";
import QRCode from "react-qr-code";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { assetImageUrl, assetTypeBadge } from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import type { AssetItem } from "@/server/routers/assets";
import { trpc } from "@/trpc/react";

type AssetDetailsDialogProps = {
	asset: AssetItem | null;
	onOpenChange: (asset: AssetItem | null) => void;
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

export function AssetDetailsDialog({
	asset,
	onOpenChange,
	onEdit,
	onDeleted,
}: AssetDetailsDialogProps) {
	const { data: detail, isPending } = trpc.assets.byId.useQuery(
		{ id: asset?.id ?? 0 },
		{ enabled: !!asset },
	);
	const deleteMutation = trpc.assets.delete.useMutation();

	const handleDelete = async () => {
		if (!asset) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: asset.id });
			toast.success("Asset deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete asset",
			);
		}
	};

	const imageUrl = detail ? assetImageUrl(detail.image) : null;
	const ownerImageUrl = detail?.empImg ? assetImageUrl(detail.empImg) : null;

	return (
		<Dialog
			open={!!asset}
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
							<DialogTitle>Asset Details</DialogTitle>
							<DialogDescription>
								{asset
									? `${asset.code} — ${asset.deviceName ?? asset.type ?? ""}`
									: ""}
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
						{/* Header */}
						<div className="flex items-start gap-4">
							{imageUrl ? (
								<img
									src={imageUrl}
									alt={detail.code}
									className="h-28 w-36 shrink-0 object-contain"
								/>
							) : (
								<div className="flex h-28 w-36 shrink-0 items-center justify-center border bg-muted text-xs text-muted-foreground">
									No image
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-1.5">
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={cn(
											"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
											assetTypeBadge(detail.type),
										)}
									>
										{detail.type ?? "-"}
									</span>
									{detail.verified && (
										<span className="inline-flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400">
											<BadgeCheck className="size-3.5" /> Verified
										</span>
									)}
									{detail.deviceStatus && (
										<span className="inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
											{detail.deviceStatus}
										</span>
									)}
								</div>
								<p className="truncate text-sm font-semibold">{detail.code}</p>
								<p className="truncate text-xs text-muted-foreground">
									{detail.deviceName ?? "-"}
								</p>
							</div>
							{asset && (
								<div className="flex shrink-0 flex-col items-center gap-1 rounded-none border bg-white p-2">
									<QRCode
										value={`${
											typeof window !== "undefined"
												? window.location.origin
												: ""
										}/app/assets?code=${encodeURIComponent(asset.code)}`}
										size={88}
										level="M"
										bgColor="#ffffff"
										fgColor="#000000"
									/>
									<span className="max-w-full truncate text-[10px] text-muted-foreground">
										{asset.code}
									</span>
								</div>
							)}
						</div>

						{/* Owner */}
						<div className="flex items-center gap-3 rounded-none border p-3">
							<Avatar>
								{ownerImageUrl && (
									<AvatarImage
										src={ownerImageUrl}
										alt={detail.owner ?? "owner"}
									/>
								)}
								<AvatarFallback>
									{(detail.owner ?? "?")[0]?.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">
									{detail.owner ?? "No owner assigned"}
								</p>
								<p className="text-xs text-muted-foreground">
									Employee ID: {detail.empID || "—"}
								</p>
							</div>
						</div>

						{/* General specs */}
						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
							<Row label="Serial Number" value={detail.serialNumber} />
							<Row label="Location" value={detail.location} />
							<Row label="Department" value={detail.department} />
							<Row label="Manufacturer" value={detail.manufacturer} />
							<Row label="Model" value={detail.model} />
							<Row label="Processor" value={detail.processor} />
							<Row label="Operating System" value={detail.os} />
							<Row label="Memory" value={detail.memory} />
							<Row label="Hard Disk" value={detail.hdd} />
							<Row label="IP Address" value={detail.ip} />
							<Row label="MAC Address" value={detail.macAddress} />
							<Row label="Firmware Version" value={detail.firmwareVer} />
							<Row label="Purchase Date" value={detail.purchaseDate} />
							<Row label="Purchase Price" value={detail.purchasePrice} />
							<Row label="Warranty Date" value={detail.warrantyDate} />
							<Row label="Warranty Status" value={detail.warrantyStatus} />
						</div>

						{detail.specification && (
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground">
									Specification
								</span>
								<p className="text-xs break-words whitespace-pre-wrap">
									{detail.specification}
								</p>
							</div>
						)}

						{detail.ownerChangeLogs.length > 0 && (
							<>
								<Separator />
								<div className="space-y-2">
									<h4 className="text-sm font-semibold">Owner Change Log</h4>
									{detail.ownerChangeLogs.map((log, index) => (
										<div
											key={index}
											className="flex items-center gap-2 rounded-none border px-3 py-2 text-xs"
										>
											<span className="text-muted-foreground line-through">
												{log.old || "—"}
											</span>
											<span className="text-muted-foreground">→</span>
											<span className="font-medium">{log.new || "—"}</span>
											<span className="ml-auto shrink-0 text-muted-foreground">
												{new Date(log.date).toLocaleString()}
											</span>
										</div>
									))}
								</div>
							</>
						)}
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
								<AlertDialogTitle>Delete this asset?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove <strong>{detail?.code}</strong> from the
									active asset list. The action can be reviewed in the change
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
