"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type DccStatus = "connected" | "disconnected" | null;

type DccStatusBadgeProps = {
	status: DccStatus;
	loading?: boolean;
};

export function DccStatusBadge({ status, loading }: DccStatusBadgeProps) {
	if (loading) {
		return (
			<span className="inline-flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
				<Loader2 className="size-3 animate-spin" />
				Checking…
			</span>
		);
	}

	if (status === "connected") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
					"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
				)}
			>
				<span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
				Connected
			</span>
		);
	}

	if (status === "disconnected") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
					"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
				)}
			>
				<span className="size-1.5 rounded-full bg-red-600 dark:bg-red-400" />
				Disconnected
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
			<span className="size-1.5 rounded-full bg-muted-foreground/50" />
			Not checked
		</span>
	);
}
