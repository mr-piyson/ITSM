"use client";

import { Badge } from "@/components/ui/badge";
import {
	contractStatus,
	type ContractStatusTone,
} from "@/lib/contract-constants";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<ContractStatusTone, string> = {
	expired: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
	soon: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
	valid:
		"border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function StatusBadge({
	endDate,
	className,
}: {
	endDate: string;
	className?: string;
}) {
	const status = contractStatus(endDate);
	return (
		<Badge
			variant="outline"
			className={cn(TONE_CLASSES[status.tone], className)}
		>
			{status.label}
		</Badge>
	);
}
