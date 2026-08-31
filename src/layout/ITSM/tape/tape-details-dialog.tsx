"use client";

import { Eraser, Loader2, Pencil, Trash2 } from "lucide-react";
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
	formatTapeDateTime,
	locationLabel,
	tapeStatusBadge,
} from "@/lib/tape-constants";
import { cn } from "@/lib/utils";
import type { TapeItem } from "@/server/routers/ITSM/tapes";
import { trpc } from "@/trpc/react";

type TapeDetailsDialogProps = {
	tape: TapeItem | null;
	onOpenChange: (tape: TapeItem | null) => void;
	onEdit: () => void;
	onFormatted: () => void;
	onDeleted: () => void;
};

function Row({
	label,
	value,
}: {
	label: string;
	value?: string | number | null;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-xs font-medium break-words">
				{value === null || value === undefined || value === "" ? "-" : value}
			</span>
		</div>
	);
}

export function TapeDetailsDialog({
	tape,
	onOpenChange,
	onEdit,
	onFormatted,
	onDeleted,
}: TapeDetailsDialogProps) {
	const formatMutation = trpc.tapes.format.useMutation();
	const deleteMutation = trpc.tapes.delete.useMutation();

	const handleFormat = async () => {
		if (!tape) {
			return;
		}
		try {
			await formatMutation.mutateAsync({ id: tape.id });
			toast.success(`${tape.tapeID} formatted — assignment cleared`);
			onFormatted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to format tape",
			);
		}
	};

	const handleDelete = async () => {
		if (!tape) {
			return;
		}
		try {
			await deleteMutation.mutateAsync({ id: tape.id });
			toast.success("Tape deleted");
			onDeleted();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete tape",
			);
		}
	};

	const hasAssignment = Boolean(tape?.month && tape?.year);
	const busy = formatMutation.isPending || deleteMutation.isPending;

	return (
		<Dialog
			open={!!tape}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Tape Details</DialogTitle>
					<DialogDescription className="font-mono">
						{tape ? tape.tapeID : ""}
					</DialogDescription>
				</DialogHeader>

				{!tape ? null : (
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={cn(
									"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
									tapeStatusBadge(tape.status, hasAssignment).className,
								)}
							>
								{tapeStatusBadge(tape.status, hasAssignment).label}
							</span>
							{hasAssignment ? (
								<span className="text-xs text-muted-foreground">
									{tape.month} {tape.year}
									{tape.sequenceNum ? ` · Backup #${tape.sequenceNum}` : ""}
								</span>
							) : (
								<span className="text-xs text-muted-foreground">
									No backup assigned
								</span>
							)}
						</div>

						<div className="grid grid-cols-2 gap-x-4 gap-y-3">
							<Row label="Location" value={locationLabel(tape.location)} />
							<Row label="Sequence Number" value={tape.sequenceNum ?? "-"} />
							<Row
								label="Last Written"
								value={formatTapeDateTime(tape.lastWritten)}
							/>
							<Row label="Expires On" value={formatTapeDateTime(tape.expire)} />
							<Row label="Capacity" value={tape.capacity} />
							<Row label="Free Space" value={tape.free} />
						</div>

						<Separator />

						<p className="text-xs text-muted-foreground">
							Tapes rotate monthly with up to 10 sequences per month. Formatting
							prepares a tape for reuse by clearing its assignment.
						</p>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onEdit} disabled={!tape}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>

					<AlertDialog>
						<AlertDialogTrigger
							render={<Button variant="outline" disabled={!tape || busy} />}
						>
							{formatMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Eraser data-icon="inline-start" />
							)}
							Format
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Format this tape?</AlertDialogTitle>
								<AlertDialogDescription>
									This clears <strong>{tape?.tapeID}</strong>&apos;s location,
									backup period, status, sequence, dates and free space so it
									can be reused. The tape ID is kept and this cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleFormat}>
									{formatMutation.isPending ? (
										<Loader2 className="animate-spin" />
									) : (
										"Format Tape"
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<AlertDialog>
						<AlertDialogTrigger
							render={<Button variant="destructive" disabled={!tape || busy} />}
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
								<AlertDialogTitle>Delete this tape?</AlertDialogTitle>
								<AlertDialogDescription>
									This removes <strong>{tape?.tapeID}</strong> from the active
									tape list. The action can be reviewed in the change logs.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction variant="destructive" onClick={handleDelete}>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
