"use client";

import { Fragment, useMemo, useState } from "react";

import {
	Boxes,
	ChevronRight,
	ExternalLink,
	Pencil,
	RadioTower,
	RefreshCw,
	Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePing, type PingTarget } from "@/lib/use-ping";
import {
	capitalize,
	serverStatusBadge,
} from "@/lib/server-constants";
import { cn } from "@/lib/utils";
import type { ServerItem } from "@/server/routers/ITSM/servers";

import { ServerPingBadge } from "./server-ping-badge";

type ServersTableProps = {
	servers: ServerItem[];
	onDetails: (server: ServerItem) => void;
	onEdit: (server: ServerItem) => void;
};

type HostGroup = {
	hostIP: string | null;
	host: string | null;
	servers: ServerItem[];
};

function groupByHostIP(servers: ServerItem[]): HostGroup[] {
	const groups = new Map<string | null, HostGroup>();
	for (const server of servers) {
		const key = server.hostIP ?? null;
		if (!groups.has(key)) {
			groups.set(key, { hostIP: key, host: server.host, servers: [] });
		}
		groups.get(key)!.servers.push(server);
	}
	const withIP = [...groups.keys()]
		.filter((k) => k !== null)
		.sort((a, b) => (a ?? "").localeCompare(b ?? ""));
	const noIP = groups.get(null);
	const ordered: (string | null)[] = [...withIP];
	if (noIP) {
		ordered.push(null);
	}
	return ordered.map((key) => groups.get(key)!);
}

function StatusCell({ server }: { server: ServerItem }) {
	const badge = serverStatusBadge({
		serverStatus: server.serverStatus,
		maintenanceDue: server.maintenanceDue,
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

export function ServersTable({
	servers,
	onDetails,
	onEdit,
}: ServersTableProps) {
	const groups = useMemo(() => groupByHostIP(servers), [servers]);
	const { get, ping, pingMany } = usePing();

	const targets = useMemo<PingTarget[]>(() => {
		const list: PingTarget[] = [];
		const seenHosts = new Set<string>();
		for (const group of groups) {
			const hostIP = group.hostIP?.trim();
			if (hostIP && !seenHosts.has(hostIP)) {
				seenHosts.add(hostIP);
				list.push({ id: `host:${hostIP}`, host: hostIP });
			}
		}
		for (const server of servers) {
			const serverIP = server.serverIP?.trim();
			if (serverIP) {
				list.push({ id: `server:${server.id}`, host: serverIP });
			}
		}
		return list;
	}, [groups, servers]);

	const offlineCount = targets.filter((target) => {
		const state = get(target.id);
		return state && !state.loading && state.status === "inactive";
	}).length;

	const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
		"__all__": true,
	}));

	const isExpanded = (key: string) =>
		expanded["__all__"] ? true : !!expanded[key];

	const toggle = (key: string) =>
		setExpanded((e) => {
			if (key === "__all__") {
				return { "__all__": !e["__all__"] };
			}
			return { ...e, [key]: !e[key] };
		});

	return (
		<div className="flex min-h-0 flex-1 flex-col rounded-none border">
			<div className="flex items-center justify-between gap-2 border-b px-3 py-2">
				<span className="text-xs text-muted-foreground">
					{groups.length} host{groups.length === 1 ? "" : "s"} ·{" "}
					{servers.length} server{servers.length === 1 ? "" : "s"}
					{offlineCount > 0 && (
						<span className="text-red-700 dark:text-red-400">
							{" "}
							· {offlineCount} offline
						</span>
					)}
				</span>
				<Button
					size="sm"
					variant="outline"
					onClick={() => pingMany(targets)}
				>
					<RadioTower />
					Ping all
				</Button>
			</div>
			<div className="min-h-0 flex-1 overflow-auto">
				<table className="w-full min-w-[1020px] caption-bottom text-xs">
					<TableHeader className="sticky top-0 z-10">
						<TableRow className="flex w-full bg-muted hover:bg-muted">
							<TableHead className="flex min-w-0 flex-1 items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Name
							</TableHead>
							<TableHead className="flex w-[110px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Type
							</TableHead>
							<TableHead className="flex w-[120px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								OS
							</TableHead>
							<TableHead className="flex w-[160px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Server IP
							</TableHead>
							<TableHead className="flex w-[150px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Backup
							</TableHead>
							<TableHead className="flex w-[180px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Status
							</TableHead>
							<TableHead className="flex w-[130px] items-center overflow-hidden border-r px-2 text-xs font-semibold">
								Availability
							</TableHead>
							<TableHead className="flex w-[112px] items-center overflow-hidden px-2 text-xs font-semibold">
								&nbsp;
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow
							className="flex cursor-pointer bg-secondary/40 hover:bg-secondary/40"
							onClick={() => toggle("__all__")}
						>
							<TableCell className="flex min-w-0 flex-1 items-center overflow-hidden px-2">
								<ChevronRight
									className={cn(
										"size-4 shrink-0 text-muted-foreground transition-transform",
										isExpanded("__all__") && "rotate-90",
									)}
								/>
								<span className="font-medium">
									{isExpanded("__all__") ? "Collapse all" : "Expand all"}
								</span>
							</TableCell>
							<TableCell className="flex w-[110px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[120px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[160px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[150px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[180px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[130px] items-center overflow-hidden px-2" />
							<TableCell className="flex w-[112px] items-center overflow-hidden px-2" />
						</TableRow>

					{groups.map((group) => {
						const hostIP = group.hostIP;
						const key = (hostIP ?? "").toLowerCase();
						const open = isExpanded(key);
						const hasBackup = group.servers.some(
							(s) => s.backupStatus === "yes",
						);
						const needsMaintenance = group.servers.some((s) => {
							const badge = serverStatusBadge({
								serverStatus: s.serverStatus,
								maintenanceDue: s.maintenanceDue,
							});
							return badge.label === "Maintenance Required";
						});
						const hostStatus: "active" | "warn" | "none" = needsMaintenance
							? "warn"
							: group.servers.some((s) => s.serverStatus === "active")
								? "active"
								: "none";

						return (
							<Fragment key={group.hostIP ?? "no-host-ip"}>
								<TableRow
									className="flex cursor-pointer bg-secondary/40 hover:bg-secondary/40"
									onClick={() => toggle(key)}
								>
									<TableCell className="flex min-w-0 flex-1 items-center overflow-hidden px-2">
										<ChevronRight
											className={cn(
												"size-4 shrink-0 text-muted-foreground transition-transform",
												open && "rotate-90",
											)}
										/>
										<Boxes className="size-4 shrink-0 text-primary" />
										<span className="ml-1 min-w-0">
											<span className="block truncate font-mono font-medium">
												{group.hostIP || "No host IP"}
											</span>
											{group.host && (
												<span className="block truncate text-xs text-muted-foreground">
													{capitalize(group.host)}
												</span>
											)}
										</span>
										<span className="ml-2 shrink-0 text-muted-foreground">
											({group.servers.length})
										</span>
									</TableCell>
									<TableCell className="flex w-[110px] items-center overflow-hidden px-2 text-muted-foreground">
										Host
									</TableCell>
									<TableCell className="flex w-[120px] items-center overflow-hidden px-2" />
									<TableCell className="flex w-[160px] items-center overflow-hidden px-2" />
									<TableCell className="flex w-[150px] items-center overflow-hidden px-2 text-muted-foreground">
										{hasBackup ? "Yes" : "No"}
									</TableCell>
									<TableCell className="flex w-[180px] items-center overflow-hidden px-2">
										<span
											className={cn(
												"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
												hostStatus === "warn"
													? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
													: hostStatus === "active"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
														: "bg-muted text-muted-foreground",
											)}
										>
											{hostStatus === "warn"
												? "Maintenance Required"
												: hostStatus === "active"
													? "Active"
													: "-"}
										</span>
									</TableCell>
									<TableCell className="flex w-[130px] items-center overflow-hidden px-2">
										{hostIP ? (
											<ServerPingBadge state={get(`host:${hostIP}`)} />
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell className="flex w-[112px] items-center justify-end gap-0.5 overflow-hidden px-2">
										{hostIP && (
											<Button
												variant="ghost"
												size="icon-sm"
												title="Ping host"
												disabled={get(`host:${hostIP}`)?.loading}
												onClick={(e) => {
													e.stopPropagation();
													ping({ id: `host:${hostIP}`, host: hostIP });
												}}
											>
												<RefreshCw
													className={cn(
														get(`host:${hostIP}`)?.loading && "animate-spin",
													)}
												/>
											</Button>
										)}
									</TableCell>
								</TableRow>

{group.servers.map((server) => {
								const serverIP = server.serverIP;
								return (
									open && (
										<TableRow
											key={server.id}
											className="flex cursor-pointer border-t"
											onClick={() => onDetails(server)}
										>
												<TableCell className="flex min-w-0 flex-1 items-center overflow-hidden px-2">
													<span className="w-4 shrink-0" />
													<Server className="size-4 shrink-0 text-chart-2" />
													<span className="ml-2 block min-w-0 truncate font-medium">
														{server.name || "-"}
													</span>
												</TableCell>
												<TableCell className="flex w-[110px] items-center overflow-hidden px-2">
													{server.type ? capitalize(server.type) : "-"}
												</TableCell>
												<TableCell className="flex w-[120px] items-center overflow-hidden px-2">
													<span className="block min-w-0 truncate">
														{server.os || "-"}
													</span>
												</TableCell>
												<TableCell className="flex w-[160px] items-center overflow-hidden px-2 font-mono">
													<span className="block min-w-0 truncate">
														{server.serverIP || "-"}
													</span>
												</TableCell>
												<TableCell className="flex w-[150px] items-center overflow-hidden px-2">
													{server.backupStatus === "yes"
														? `Yes${server.backupSoftware ? ` — ${server.backupSoftware}` : ""}`
														: "No"}
												</TableCell>
												<TableCell className="flex w-[180px] items-center overflow-hidden px-2">
													<StatusCell server={server} />
												</TableCell>
												<TableCell className="flex w-[130px] items-center overflow-hidden px-2">
													{serverIP ? (
														<ServerPingBadge
															state={get(`server:${server.id}`)}
														/>
													) : (
														<span className="text-xs text-muted-foreground">
															—
														</span>
													)}
												</TableCell>
												<TableCell className="flex w-[112px] items-center justify-end gap-0.5 overflow-hidden px-2">
													{serverIP && (
														<Button
															variant="ghost"
															size="icon-sm"
															title="Ping"
															disabled={get(`server:${server.id}`)?.loading}
															onClick={(e) => {
																e.stopPropagation();
																ping({
																	id: `server:${server.id}`,
																	host: serverIP,
																});
															}}
														>
															<RefreshCw
																className={cn(
																	get(`server:${server.id}`)?.loading &&
																		"animate-spin",
																)}
															/>
														</Button>
													)}
													<Button
														variant="ghost"
														size="icon-sm"
														title="Details"
														onClick={(e) => {
															e.stopPropagation();
															onDetails(server);
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
															onEdit(server);
														}}
													>
														<Pencil />
													</Button>
												</TableCell>
											</TableRow>
									)
								);
							})}
							</Fragment>
						);
					})}
					</TableBody>
				</table>
			</div>
		</div>
	);
}
