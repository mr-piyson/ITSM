"use client";

import {
	Activity,
	Pause,
	Play,
	RefreshCw,
	RadioTower,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

const INTERVAL_OPTIONS = [
	{ label: "15s", value: 15_000 },
	{ label: "30s", value: 30_000 },
	{ label: "60s", value: 60_000 },
] as const;

function formatTime(value: string | null): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function DccMiniChart({
	logs,
}: {
	logs: {
		dccReachable: boolean;
		readerReachable: boolean;
		dccPingLatencyMs: number | null;
		readerPingLatencyMs: number | null;
		checkedAt: string | null;
	}[];
}) {
	const reversed = logs.slice().reverse();

	if (reversed.length === 0) {
		return (
			<div className="flex h-24 items-center justify-center text-[10px] text-muted-foreground">
				No data
			</div>
		);
	}

	const points = reversed.map((log, i) => ({
		i,
		time: log.checkedAt
			? new Date(log.checkedAt).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})
			: "",
		pi: log.dccReachable ? 1 : 0,
		reader: log.readerReachable ? 1 : 0,
		piLatency: log.dccPingLatencyMs,
		readerLatency: log.readerPingLatencyMs,
	}));

	const chartH = 60;
	const padY = 4;

	const toY = (val: number) => padY + chartH - val * (chartH - padY * 2);

	const piPath = points
		.map((p, i) => `${i === 0 ? "M" : "L"} ${i * 8 + 4},${toY(p.pi)}`)
		.join(" ");
	const readerPath = points
		.map((p, i) => `${i === 0 ? "M" : "L"} ${i * 8 + 4},${toY(p.reader)}`)
		.join(" ");

	return (
		<div className="relative h-16 w-full overflow-hidden">
			<svg
				viewBox={`0 0 ${Math.min(points.length * 8 + 8, 400)} ${chartH + padY * 2}`}
				preserveAspectRatio="none"
				className="h-full w-full"
			>
				<path d={piPath} fill="none" stroke="#2563eb" strokeWidth="1.5" />
				<path d={readerPath} fill="none" stroke="#dc2626" strokeWidth="1.5" />
				{points.map((p, i) => (
					<circle key={i} cx={i * 8 + 4} cy={toY(p.pi)} r="2" fill="#2563eb" />
				))}
				{points.map((p, i) => (
					<circle
						key={`r-${i}`}
						cx={i * 8 + 4}
						cy={toY(p.reader)}
						r="2"
						fill="#dc2626"
					/>
				))}
			</svg>
		</div>
	);
}

function DccRealtimeCard({
	dcc,
}: {
	dcc: {
		id: number;
		name: string;
		dccCode: string | null;
		ipAddress: string | null;
		cardReaderIp: string | null;
		lastStatus: "connected" | "disconnected" | null;
		lastCheckedAt: string | null;
		recentLogs: {
			dccReachable: boolean;
			readerReachable: boolean;
			dccPingLatencyMs: number | null;
			readerPingLatencyMs: number | null;
			checkedAt: string | null;
		}[];
	};
}) {
	const isOnline = dcc.lastStatus === "connected";

	return (
		<Card
			className={cn(
				"overflow-hidden transition-colors",
				isOnline === false && "border-red-200 dark:border-red-900",
			)}
		>
			<CardHeader className="space-y-2 p-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<CardTitle className="truncate text-sm font-semibold">
							{dcc.dccCode || dcc.name || `DCC #${dcc.id}`}
						</CardTitle>
						{dcc.dccCode && dcc.name && (
							<p className="truncate text-[10px] text-muted-foreground">
								{dcc.name}
							</p>
						)}
					</div>
					<span
						className={cn(
							"shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
							isOnline
								? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
								: dcc.lastStatus === "disconnected"
									? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
									: "bg-muted text-muted-foreground",
						)}
					>
						{isOnline
							? "Online"
							: dcc.lastStatus === "disconnected"
								? "Offline"
								: "Unknown"}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-1">
					{dcc.ipAddress && (
						<div className="flex items-center gap-1.5">
							<span className="shrink-0 text-muted-foreground">Pi:</span>
							<span className="min-w-0 truncate font-mono text-muted-foreground">
								{dcc.ipAddress}
							</span>
						</div>
					)}
					{dcc.cardReaderIp && (
						<div className="flex items-center gap-1.5">
							<span className="shrink-0 text-muted-foreground">Reader:</span>
							<span className="min-w-0 truncate font-mono text-muted-foreground">
								{dcc.cardReaderIp}
							</span>
						</div>
					)}
				</div>

				<div className="text-[10px] text-muted-foreground">
					<span>Last: {formatTime(dcc.lastCheckedAt)}</span>
				</div>
			</CardHeader>

			<div className="border-t px-3 py-2">
				<div className="mb-1 flex items-center gap-3 text-[10px]">
					<span className="inline-flex items-center gap-1">
						<span className="size-1.5 rounded-full bg-blue-600" />
						Pi
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="size-1.5 rounded-full bg-red-600" />
						Reader
					</span>
				</div>
				<DccMiniChart logs={dcc.recentLogs} />
			</div>
		</Card>
	);
}

export function DccRealtimeDashboard() {
	const utils = trpc.useUtils();
	const { data: dccs = [], isPending } = trpc.dccs.listWithRecentLogs.useQuery({
		limit: 50,
	});
	const checkAllMutation = trpc.dccs.checkAllConnectivity.useMutation();

	const [pollingEnabled, setPollingEnabled] = useState(true);
	const [intervalMs, setIntervalMs] = useState(15_000);
	const [countdown, setCountdown] = useState(15);
	const [lastChecked, setLastChecked] = useState<Date | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	const pollingRef = useRef(pollingEnabled);
	const intervalMsRef = useRef(intervalMs);
	const isCheckingRef = useRef(isChecking);
	pollingRef.current = pollingEnabled;
	intervalMsRef.current = intervalMs;
	isCheckingRef.current = isChecking;

	useEffect(() => {
		const id = setInterval(() => {
			if (!pollingRef.current) return;
			setCountdown((prev) =>
				prev <= 1 ? intervalMsRef.current / 1000 : prev - 1,
			);
		}, 1000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		const id = setInterval(async () => {
			if (!pollingRef.current || isCheckingRef.current) return;
			isCheckingRef.current = true;
			setIsChecking(true);
			try {
				await checkAllMutation.mutateAsync();
				await utils.dccs.listWithRecentLogs.invalidate();
				await utils.dccs.dashboard.invalidate();
				setLastChecked(new Date());
			} catch {
				// silent
			} finally {
				isCheckingRef.current = false;
				setIsChecking(false);
				setCountdown(intervalMsRef.current / 1000);
			}
		}, intervalMs);
		return () => clearInterval(id);
	}, [intervalMs, checkAllMutation, utils]);

	useEffect(() => {
		(async () => {
			isCheckingRef.current = true;
			setIsChecking(true);
			try {
				await checkAllMutation.mutateAsync();
				await utils.dccs.listWithRecentLogs.invalidate();
				await utils.dccs.dashboard.invalidate();
				setLastChecked(new Date());
			} catch {
				// silent
			} finally {
				isCheckingRef.current = false;
				setIsChecking(false);
				setCountdown(intervalMsRef.current / 1000);
			}
		})();
	}, []);

	const connectedCount = dccs.filter(
		(d) => d.lastStatus === "connected",
	).length;
	const disconnectedCount = dccs.filter(
		(d) => d.lastStatus === "disconnected",
	).length;
	const uncheckedCount = dccs.filter((d) => d.lastStatus === null).length;

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden">
			<div className="shrink-0 space-y-3 border-b p-4 md:p-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							DCC Realtime
						</h1>
						<p className="text-xs text-muted-foreground">
							Live connectivity monitoring for all DCCs
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex items-center gap-1 rounded-none border">
							{INTERVAL_OPTIONS.map((opt) => (
								<Button
									key={opt.value}
									size="sm"
									variant={intervalMs === opt.value ? "default" : "ghost"}
									className="h-7 rounded-none px-2 text-xs"
									onClick={() => setIntervalMs(opt.value)}
								>
									{opt.label}
								</Button>
							))}
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setPollingEnabled(!pollingEnabled)}
							className="h-7 gap-1 text-xs"
						>
							{pollingEnabled ? (
								<Pause className="size-3" />
							) : (
								<Play className="size-3" />
							)}
							{pollingEnabled ? "Pause" : "Resume"}
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={isChecking}
							onClick={async () => {
								if (isCheckingRef.current) return;
								isCheckingRef.current = true;
								setIsChecking(true);
								try {
									await checkAllMutation.mutateAsync();
									await utils.dccs.listWithRecentLogs.invalidate();
									await utils.dccs.dashboard.invalidate();
									setLastChecked(new Date());
								} catch {
									// silent
								} finally {
									isCheckingRef.current = false;
									setIsChecking(false);
									setCountdown(intervalMsRef.current / 1000);
								}
							}}
							className="h-7 gap-1 text-xs"
						>
							<RefreshCw
								className={cn("size-3", isChecking && "animate-spin")}
							/>
							Check now
						</Button>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<RadioTower className="size-3.5" />
						<span>{dccs.length} DCCs</span>
					</div>
					<div className="flex items-center gap-1.5 text-green-600">
						<Wifi className="size-3.5" />
						<span>{connectedCount} online</span>
					</div>
					<div className="flex items-center gap-1.5 text-red-600">
						<WifiOff className="size-3.5" />
						<span>{disconnectedCount} offline</span>
					</div>
					{uncheckedCount > 0 && (
						<div className="flex items-center gap-1.5">
							<Activity className="size-3.5" />
							<span>{uncheckedCount} unchecked</span>
						</div>
					)}
					{lastChecked && (
						<span className="ml-auto hidden whitespace-nowrap sm:inline">
							Last check: {lastChecked.toLocaleTimeString()}
							{pollingEnabled && <> · Next in {countdown}s</>}
						</span>
					)}
				</div>
				{lastChecked && (
					<div className="flex items-center text-xs text-muted-foreground sm:hidden">
						<span>
							Last check: {lastChecked.toLocaleTimeString()}
							{pollingEnabled && <> · Next in {countdown}s</>}
						</span>
					</div>
				)}
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
				{isPending ? (
					<div className="flex h-48 items-center justify-center">
						<RefreshCw className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : dccs.length === 0 ? (
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<RadioTower />
							</EmptyMedia>
							<EmptyTitle>No DCCs found</EmptyTitle>
							<EmptyDescription>
								Add DCC stations to start monitoring connectivity.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{dccs.map((dcc) => (
							<DccRealtimeCard key={dcc.id} dcc={dcc} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
