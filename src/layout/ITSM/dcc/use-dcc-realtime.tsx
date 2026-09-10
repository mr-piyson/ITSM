"use client";

import { Pause, Play, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

export const INTERVAL_OPTIONS = [
	{ label: "15s", value: 15_000 },
	{ label: "30s", value: 30_000 },
	{ label: "60s", value: 60_000 },
] as const;

export function useDccRealtime() {
	const utils = trpc.useUtils();
	const { data: dccs = [], isPending } = trpc.dccs.listWithRecentLogs.useQuery({
		limit: 50,
	});
	const { data: dashboard } = trpc.dccs.dashboard.useQuery();
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

	const runCheck = useRef(async () => {
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
	});

	// Countdown timer
	useEffect(() => {
		const id = setInterval(() => {
			if (!pollingRef.current) return;
			setCountdown((prev) =>
				prev <= 1 ? intervalMsRef.current / 1000 : prev - 1,
			);
		}, 1000);
		return () => clearInterval(id);
	}, []);

	// Polling interval
	useEffect(() => {
		const id = setInterval(() => {
			if (!pollingRef.current || isCheckingRef.current) return;
			runCheck.current();
		}, intervalMs);
		return () => clearInterval(id);
	}, [intervalMs]);

	// Initial check on mount
	useEffect(() => {
		runCheck.current();
	}, []);

	const checkNow = () => runCheck.current();

	const invalidate = () => {
		utils.dccs.listWithRecentLogs.invalidate();
		utils.dccs.dashboard.invalidate();
	};

	return {
		dccs,
		dashboard,
		isPending,
		pollingEnabled,
		setPollingEnabled,
		intervalMs,
		setIntervalMs,
		countdown,
		lastChecked,
		isChecking,
		checkNow,
		invalidate,
	};
}

export function PollingControls({
	pollingEnabled,
	setPollingEnabled,
	intervalMs,
	setIntervalMs,
	countdown,
	lastChecked,
	isChecking,
	checkNow,
	variant = "full",
}: {
	pollingEnabled: boolean;
	setPollingEnabled: (v: boolean) => void;
	intervalMs: number;
	setIntervalMs: (v: number) => void;
	countdown: number;
	lastChecked: Date | null;
	isChecking: boolean;
	checkNow: () => void;
	variant?: "full" | "compact";
}) {
	if (variant === "compact") {
		return (
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
					onClick={checkNow}
					className="h-7 gap-1 text-xs"
				>
					<RefreshCw
						className={cn("size-3", isChecking && "animate-spin")}
					/>
					Check now
				</Button>
				{lastChecked && (
					<span className="text-xs text-muted-foreground">
						Last: {lastChecked.toLocaleTimeString()}
						{pollingEnabled && <> · Next {countdown}s</>}
					</span>
				)}
			</div>
		);
	}

	return (
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
				onClick={checkNow}
				className="h-7 gap-1 text-xs"
			>
				<RefreshCw
					className={cn("size-3", isChecking && "animate-spin")}
				/>
				Check now
			</Button>
			{lastChecked && (
				<span className="ml-auto hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
					Last check: {lastChecked.toLocaleTimeString()}
					{pollingEnabled && <> · Next in {countdown}s</>}
				</span>
			)}
			{lastChecked && (
				<div className="flex items-center text-xs text-muted-foreground sm:hidden">
					<span>
						Last check: {lastChecked.toLocaleTimeString()}
						{pollingEnabled && <> · Next in {countdown}s</>}
					</span>
				</div>
			)}
		</div>
	);
}
