"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	modificationLabel,
	pageLabel,
	REQUEST_STATUSES,
	statusLabel,
} from "@/lib/request-constants";
import { cn } from "@/lib/utils";
import type { RequestItem, RequestReplyItem } from "@/server/routers/requests";
import { trpc } from "@/trpc/react";

import { PriorityBadge, StatusBadge } from "./requests-table";

type RequestDetailsDialogProps = {
	request: RequestItem | null;
	onOpenChange: (request: RequestItem | null) => void;
	onChanged: () => void;
};

function formatDateTime(value: string | null): string {
	if (!value) {
		return "-";
	}
	const date = new Date(value.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

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

function ReplyBubble({ reply }: { reply: RequestReplyItem }) {
	return (
		<div className="space-y-0.5 border px-3 py-2">
			<div className="flex items-center justify-between gap-2">
				<span className="text-xs font-semibold">
					{reply.userName ?? "User"}
				</span>
				<span className="text-[11px] text-muted-foreground">
					{formatDateTime(reply.replyDate)}
				</span>
			</div>
			<p className="text-xs break-words whitespace-pre-wrap">{reply.reply}</p>
		</div>
	);
}

export function RequestDetailsDialog({
	request,
	onOpenChange,
	onChanged,
}: RequestDetailsDialogProps) {
	const meQuery = trpc.auth.me.useQuery();
	const isAdmin = meQuery.data?.type === "admin";

	const repliesQuery = trpc.requests.replies.useQuery(
		{ requestID: request?.id ?? 0 },
		{ enabled: !!request },
	);

	const updateStatusMutation = trpc.requests.updateStatus.useMutation();
	const addReplyMutation = trpc.requests.addReply.useMutation();

	const [statusValue, setStatusValue] = useState<string>("pending");
	const [replyText, setReplyText] = useState("");

	useEffect(() => {
		setStatusValue(request?.status ?? "pending");
		setReplyText("");
	}, [request?.id, request?.status]);

	const handleStatusUpdate = async () => {
		if (!request || statusValue === request.status) {
			return;
		}
		try {
			await updateStatusMutation.mutateAsync({
				id: request.id,
				status: statusValue as (typeof REQUEST_STATUSES)[number],
			});
			onChanged();
		} catch {
			// error surfaced by mutation state below
		}
	};

	const handleAddReply = async () => {
		if (!request || !replyText.trim()) {
			return;
		}
		try {
			await addReplyMutation.mutateAsync({
				requestID: request.id,
				reply: replyText.trim(),
			});
			setReplyText("");
			repliesQuery.refetch();
			onChanged();
		} catch {
			// error surfaced by mutation state below
		}
	};

	const statusError =
		updateStatusMutation.error ??
		(addReplyMutation.error as Error | null | undefined);

	return (
		<Dialog
			open={!!request}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Request Details</DialogTitle>
					<DialogDescription className="font-mono">
						{request ? `#${request.id}` : ""}
					</DialogDescription>
				</DialogHeader>

				{!request ? null : (
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<PriorityBadge priority={request.requestPrio} />
							<StatusBadge status={request.status} />
							<span className="text-xs text-muted-foreground">
								Submitted {formatDateTime(request.submitDate)} by{" "}
								{request.userName ?? "Unknown"}
							</span>
						</div>

						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
							<Row
								label="Page"
								value={pageLabel(
									request.pgtype,
									request.slctname,
									request.newpg,
									request.otherpg,
								)}
							/>
							<Row
								label="Modification"
								value={modificationLabel(request.modifi)}
							/>
						</div>

						<div className="flex flex-col gap-0.5">
							<span className="text-xs text-muted-foreground">Description</span>
							<p className="text-xs break-words whitespace-pre-wrap">
								{request.descrip || "-"}
							</p>
						</div>

						{request.imagefilePath && (
							<div className="flex flex-col gap-1">
								<span className="text-xs text-muted-foreground">
									Attachment
								</span>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={`/ISS/itemsImages/${request.imagefilePath}`}
									alt={`Request #${request.id} attachment`}
									className="max-h-64 w-auto border object-contain"
								/>
							</div>
						)}

						<Separator />

						<div className="space-y-2">
							<h4 className="text-sm font-semibold">
								Replies ({repliesQuery.data?.length ?? 0})
							</h4>
							<div className="max-h-48 space-y-2 overflow-y-auto">
								{repliesQuery.isPending ? (
									<p className="text-xs text-muted-foreground">Loading…</p>
								) : (repliesQuery.data?.length ?? 0) === 0 ? (
									<p className="text-xs text-muted-foreground">
										No replies yet.
									</p>
								) : (
									repliesQuery.data?.map((reply) => (
										<ReplyBubble key={reply.id} reply={reply} />
									))
								)}
							</div>

							<div className="space-y-2 pt-1">
								<Label htmlFor="reply">Add Reply</Label>
								<Textarea
									id="reply"
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
									placeholder="Write a reply…"
									rows={2}
									maxLength={2000}
								/>
								<Button
									size="sm"
									variant="outline"
									disabled={!replyText.trim() || addReplyMutation.isPending}
									onClick={handleAddReply}
								>
									Send Reply
								</Button>
							</div>
						</div>

						{isAdmin && (
							<>
								<Separator />
								<div className="flex flex-wrap items-end gap-3">
									<div className="space-y-2">
										<Label htmlFor="status-select">Update Status</Label>
										<Select
											value={statusValue}
											onValueChange={(value) =>
												setStatusValue(value ?? "pending")
											}
										>
											<SelectTrigger id="status-select" className="w-40">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{REQUEST_STATUSES.map((status) => (
													<SelectItem key={status} value={status}>
														{statusLabel(status)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<Button
										size="sm"
										disabled={
											statusValue === request.status ||
											updateStatusMutation.isPending
										}
										onClick={handleStatusUpdate}
									>
										Save Status
									</Button>
								</div>
							</>
						)}
					</div>
				)}

				{statusError && (
					<p className={cn("text-xs text-destructive")}>
						{statusError.message}
					</p>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(null)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
