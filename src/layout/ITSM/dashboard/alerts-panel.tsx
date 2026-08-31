"use client";

import {
	CalendarClock,
	FileWarning,
	PackageX,
	Wrench,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardAlert } from "@/server/routers/ITSM/dashboard";

const KIND_ICON: Record<DashboardAlert["kind"], LucideIcon> = {
	low_stock: PackageX,
	contract: CalendarClock,
	maintenance: Wrench,
	warranty: FileWarning,
};

const SEVERITY_CLASS: Record<DashboardAlert["severity"], string> = {
	high: "border-destructive/40 text-destructive",
	medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
	low: "border-border text-muted-foreground",
};

export function AlertsPanel({ alerts }: { alerts: DashboardAlert[] }) {
	if (alerts.length === 0) {
		return null;
	}

	const items = alerts.slice(0, 8);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Action needed</CardTitle>
				<CardDescription>
					{alerts.length} item{alerts.length === 1 ? "" : "s"} require attention
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-1.5">
				{items.map((alert) => {
					const Icon = KIND_ICON[alert.kind];
					const body = (
						<>
							<div
								className={cn(
									"flex size-8 shrink-0 items-center justify-center border",
									SEVERITY_CLASS[alert.severity],
								)}
							>
								<Icon className="size-4" />
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate font-medium">{alert.title}</span>
								<span className="truncate text-muted-foreground">
									{alert.detail}
								</span>
							</div>
							{alert.date && (
								<time className="shrink-0 text-xs text-muted-foreground">
									{alert.date}
								</time>
							)}
						</>
					);

					return alert.href ? (
						<Link
							key={alert.id}
							href={alert.href}
							className="flex items-center gap-2.5 rounded-none border border-border px-2.5 py-2 transition-colors hover:bg-muted"
						>
							{body}
						</Link>
					) : (
						<div
							key={alert.id}
							className="flex items-center gap-2.5 rounded-none border border-border px-2.5 py-2"
						>
							{body}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
