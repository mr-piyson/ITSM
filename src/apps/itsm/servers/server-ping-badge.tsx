import { cn } from "@/lib/utils";

import type { PingState } from "@/lib/use-ping";

type ServerPingBadgeProps = {
	state?: PingState;
	className?: string;
};

export function ServerPingBadge({ state, className }: ServerPingBadgeProps) {
	if (!state) {
		return (
			<span className={cn("text-xs text-muted-foreground", className)}>—</span>
		);
	}

	if (state.loading) {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-2 text-xs text-muted-foreground",
					className,
				)}
			>
				<span className="inline-block size-2 animate-pulse rounded-full bg-amber-400" />
				Checking…
			</span>
		);
	}

	if (state.status === "active") {
		return (
			<span className={cn("inline-flex items-center gap-2 text-xs", className)}>
				<span className="relative flex size-2">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
					<span className="relative inline-flex size-2 rounded-full bg-green-500" />
				</span>
				<span className="text-green-700 dark:text-green-400">Online</span>
				{state.latencyMs != null && (
					<span className="font-mono text-muted-foreground">
						{state.latencyMs} ms
					</span>
				)}
			</span>
		);
	}

	return (
		<span className={cn("inline-flex items-center gap-2 text-xs", className)}>
			<span className="inline-block size-2 rounded-full bg-red-500" />
			<span className="text-red-700 dark:text-red-400">Offline</span>
		</span>
	);
}
