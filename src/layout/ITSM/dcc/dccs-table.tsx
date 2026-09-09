"use client";

import { useMemo, useState } from "react";

import { ExternalLink, Pencil, RadioTower, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePing, type PingTarget } from "@/lib/use-ping";
import type { DccItem } from "@/server/routers/ITSM/dccs";
import { trpc } from "@/trpc/react";

import { DccPingBadge } from "./dcc-ping-badge";
import { DccStatusBadge } from "./dcc-status-badge";

type DccsTableProps = {
	dccs: DccItem[];
	onDetails: (dcc: DccItem) => void;
	onEdit: (dcc: DccItem) => void;
};

export function DccsTable({ dccs, onDetails, onEdit }: DccsTableProps) {
	const checkMutation = trpc.dccs.checkConnectivity.useMutation();
	const [isCheckingAll, setIsCheckingAll] = useState(false);
	const utils = trpc.useUtils();
	const { get, ping, pingMany } = usePing("dccs");

	const connectedCount = dccs.filter(
		(d) => d.lastStatus === "connected",
	).length;
	const disconnectedCount = dccs.filter(
		(d) => d.lastStatus === "disconnected",
	).length;

	const targets = useMemo<PingTarget[]>(() => {
		return dccs.flatMap((dcc) => {
			const list: PingTarget[] = [];
			if (dcc.ipAddress) {
				list.push({ id: `pi:${dcc.id}`, host: dcc.ipAddress });
			}
			if (dcc.cardReaderIp) {
				list.push({ id: `reader:${dcc.id}`, host: dcc.cardReaderIp });
			}
			return list;
		});
	}, [dccs]);

	const offlineCount = targets.filter((target) => {
		const state = get(target.id);
		return state && !state.loading && state.status === "inactive";
	}).length;

	const handleCheck = async (dcc: DccItem) => {
		const targets: PingTarget[] = [];
		if (dcc.ipAddress) {
			targets.push({ id: `pi:${dcc.id}`, host: dcc.ipAddress });
		}
		if (dcc.cardReaderIp) {
			targets.push({ id: `reader:${dcc.id}`, host: dcc.cardReaderIp });
		}
		if (targets.length > 0) {
			pingMany(targets);
		}
		try {
			await checkMutation.mutateAsync({ id: dcc.id });
			utils.dccs.list.invalidate();
			utils.dccs.dashboard.invalidate();
			utils.dccs.byId.invalidate({ id: dcc.id });
		} catch {
			// status reflected on next refetch
		}
	};

	const handleCheckAll = async () => {
		if (isCheckingAll || dccs.length === 0) {
			return;
		}
		setIsCheckingAll(true);

		const allTargets = dccs.flatMap((dcc) => {
			const list: PingTarget[] = [];
			if (dcc.ipAddress) {
				list.push({ id: `pi:${dcc.id}`, host: dcc.ipAddress });
			}
			if (dcc.cardReaderIp) {
				list.push({ id: `reader:${dcc.id}`, host: dcc.cardReaderIp });
			}
			return list;
		});
		if (allTargets.length > 0) {
			pingMany(allTargets);
		}

		try {
			await Promise.all(
				dccs.map((dcc) =>
					checkMutation.mutateAsync({ id: dcc.id }).catch(() => {}),
				),
			);
			utils.dccs.list.invalidate();
			utils.dccs.dashboard.invalidate();
		} finally {
			setIsCheckingAll(false);
		}
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col rounded-none border">
			<div className="flex items-center justify-between gap-2 border-b px-3 py-2">
				<span className="text-xs text-muted-foreground">
					{dccs.length} DCC{dccs.length === 1 ? "" : "s"}
					<span className="text-green-700 dark:text-green-500">
						{" "}
						· {connectedCount} connected
					</span>
					<span className="text-red-700 dark:text-red-400">
						{" "}
						· {disconnectedCount} disconnected
					</span>
					{offlineCount > 0 && (
						<span className="text-red-700 dark:text-red-400">
							{" "}
							· {offlineCount} hosts offline
						</span>
					)}
				</span>
				<Button
					size="sm"
					variant="outline"
					disabled={isCheckingAll}
					onClick={() => handleCheckAll()}
				>
					<RadioTower className={cn(isCheckingAll && "animate-pulse")} />
					Ping all
				</Button>
			</div>
			<div className="min-h-0 flex-1 overflow-auto">
				<table className="w-full min-w-[1080px] caption-bottom text-xs">
					<TableHeader className="sticky top-0 z-10">
						<TableRow className="flex w-full bg-muted hover:bg-muted">
							<TableHead className="flex w-[110px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Code
							</TableHead>
							<TableHead className="flex min-w-0 flex-1 items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Name
							</TableHead>
							<TableHead className="flex w-[200px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Pi IP / Status
							</TableHead>
							<TableHead className="flex w-[200px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Reader IP / Status
							</TableHead>
							<TableHead className="flex w-[130px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Screen
							</TableHead>
							<TableHead className="flex w-[150px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Last Check
							</TableHead>
							<TableHead className="flex w-[140px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Status
							</TableHead>
							<TableHead className="flex w-[140px] items-center overflow-hidden px-2 text-xs font-semibold">
								&nbsp;
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dccs.map((dcc) => {
							const checking =
								checkMutation.isPending &&
								checkMutation.variables?.id === dcc.id;
							return (
								<TableRow
									key={dcc.id}
									className="flex cursor-pointer border-t"
									onClick={() => onDetails(dcc)}
								>
									<TableCell className="flex w-[110px] items-center overflow-hidden px-2 font-mono">
										<span className="block min-w-0 truncate">
											{dcc.dccCode || "-"}
										</span>
									</TableCell>
									<TableCell className="flex min-w-0 flex-1 items-center overflow-hidden px-2">
										<span className="ml-2 block min-w-0 truncate font-medium">
											{dcc.name || "-"}
										</span>
									</TableCell>
									<TableCell className="flex w-[200px] items-center gap-2 overflow-hidden px-2">
										{dcc.ipAddress ? (
											<>
												<span className="shrink-0 text-muted-foreground">
													{dcc.ipAddress}
												</span>
												<DccPingBadge
													state={get(`pi:${dcc.id}`)}
													className="shrink-0"
												/>
												<Button
													variant="ghost"
													size="icon-sm"
													title="Ping Pi"
													disabled={get(`pi:${dcc.id}`)?.loading}
													onClick={(e) => {
														e.stopPropagation();
														ping({ id: `pi:${dcc.id}`, host: dcc.ipAddress! });
													}}
												>
													<RefreshCw
														className={cn(
															get(`pi:${dcc.id}`)?.loading && "animate-spin",
														)}
													/>
												</Button>
											</>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell className="flex w-[200px] items-center gap-2 overflow-hidden px-2">
										{dcc.cardReaderIp ? (
											<>
												<span className="shrink-0 text-muted-foreground">
													{dcc.cardReaderIp}
												</span>
												<DccPingBadge
													state={get(`reader:${dcc.id}`)}
													className="shrink-0"
												/>
												<Button
													variant="ghost"
													size="icon-sm"
													title="Ping reader"
													disabled={get(`reader:${dcc.id}`)?.loading}
													onClick={(e) => {
														e.stopPropagation();
														ping({
															id: `reader:${dcc.id}`,
															host: dcc.cardReaderIp!,
														});
													}}
												>
													<RefreshCw
														className={cn(
															get(`reader:${dcc.id}`)?.loading &&
																"animate-spin",
														)}
													/>
												</Button>
											</>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell className="flex w-[130px] items-center overflow-hidden px-2">
										{dcc.screenInch || "-"}
									</TableCell>
									<TableCell className="flex w-[150px] items-center overflow-hidden px-2 text-muted-foreground">
										{dcc.lastCheckedAt
											? new Date(dcc.lastCheckedAt).toLocaleString()
											: "-"}
									</TableCell>
									<TableCell className="flex w-[140px] items-center overflow-hidden px-2">
										<DccStatusBadge
											status={dcc.lastStatus}
											loading={checking}
										/>
									</TableCell>
									<TableCell className="flex w-[140px] items-center justify-end gap-0.5 overflow-hidden px-2">
										<Button
											variant="ghost"
											size="icon-sm"
											title="Check connectivity now"
											disabled={checking}
											onClick={(e) => {
												e.stopPropagation();
												handleCheck(dcc);
											}}
										>
											<RefreshCw className={cn(checking && "animate-spin")} />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											title="Details"
											onClick={(e) => {
												e.stopPropagation();
												onDetails(dcc);
											}}
										>
											<ExternalLink />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											title="Edit"
											onClick={(e) => {
												e.stopPropagation();
												onEdit(dcc);
											}}
										>
											<Pencil />
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</table>
			</div>
		</div>
	);
}
