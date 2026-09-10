"use client";

import { RadioTower } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { DccItem, DccLogItem } from "@/server/routers/ITSM/dccs";

type DccWithLogs = DccItem & { recentLogs: DccLogItem[] };

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
	logs: DccLogItem[];
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
		pi: log.dccReachable ? 1 : 0,
		reader: log.readerReachable ? 1 : 0,
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
	onClick,
}: {
	dcc: DccWithLogs;
	onClick?: () => void;
}) {
	const isOnline = dcc.lastStatus === "connected";

	return (
		<Card
			className={cn(
				"cursor-pointer overflow-hidden transition-colors hover:bg-accent/50",
				isOnline === false && "border-red-200 dark:border-red-900",
			)}
			onClick={onClick}
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

export function DccRealtimeGrid({
	dccs,
	isPending,
	onCardClick,
}: {
	dccs: DccWithLogs[];
	isPending: boolean;
	onCardClick?: (dcc: DccWithLogs) => void;
}) {
	if (isPending) {
		return (
			<div className="flex h-48 items-center justify-center">
				<RadioTower className="size-6 animate-pulse text-muted-foreground" />
			</div>
		);
	}

	if (dccs.length === 0) {
		return (
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
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:p-6">
			{dccs.map((dcc) => (
				<DccRealtimeCard
					key={dcc.id}
					dcc={dcc}
					onClick={() => onCardClick?.(dcc)}
				/>
			))}
		</div>
	);
}
