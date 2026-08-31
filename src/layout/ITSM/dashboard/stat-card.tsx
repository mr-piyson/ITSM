"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
	label: string;
	value: number;
	icon: LucideIcon;
	href?: string;
	iconClassName?: string;
};

export function StatCard({
	label,
	value,
	icon: Icon,
	href,
	iconClassName,
}: StatCardProps) {
	const inner = (
		<Card className="h-full min-w-0">
			<CardContent className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="truncate text-xs text-muted-foreground">
						{label}
					</span>
					<span className="font-heading text-2xl font-semibold tabular-nums">
						{value.toLocaleString()}
					</span>
				</div>
				<div
					className={cn(
						"flex size-10 shrink-0 items-center justify-center border",
						iconClassName ?? "border-primary/20 bg-primary/5 text-primary",
					)}
				>
					<Icon className="size-5" />
				</div>
			</CardContent>
		</Card>
	);

	if (href) {
		return (
			<Link
				href={href}
				className="block h-full min-w-0 transition-opacity hover:opacity-80"
			>
				{inner}
			</Link>
		);
	}

	return inner;
}
