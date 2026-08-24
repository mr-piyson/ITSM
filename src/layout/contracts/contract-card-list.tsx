"use client";

import { ChevronRight } from "lucide-react";

import { formatDateLabel } from "@/lib/contract-constants";
import type { Contract } from "@/server/routers/contracts";
import { StatusBadge } from "./status-badge";

type ContractsCardListProps = {
	contracts: Contract[];
	onDetails: (contract: Contract) => void;
};

export function ContractsCardList({
	contracts,
	onDetails,
}: ContractsCardListProps) {
	return (
		<div className="flex-1 min-h-0 divide-y overflow-y-auto rounded-none border">
			{contracts.map((contract) => (
				<button
					key={contract.id}
					type="button"
					onClick={() => onDetails(contract)}
					className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
				>
					<div className="min-w-0 flex-1 space-y-0.5">
						<p className="truncate text-sm font-medium">
							{contract.productName}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							{contract.vendorName || "No vendor"}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							Ends {formatDateLabel(contract.endDate)} · {contract.currency}{" "}
							{contract.cost} ·{" "}
							<span className="capitalize">{contract.bilingCycle}</span>
						</p>
					</div>
					<StatusBadge endDate={contract.endDate} className="shrink-0" />
					<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
				</button>
			))}
		</div>
	);
}
