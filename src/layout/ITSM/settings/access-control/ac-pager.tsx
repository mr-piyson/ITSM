"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AC_DEFAULT_PAGE_SIZE, AC_MAX_PAGE_SIZE } from "@/lib/ac/constants";
import { formatAcNumber } from "@/lib/ac/format";

const PAGE_SIZES = [AC_DEFAULT_PAGE_SIZE, 50, AC_MAX_PAGE_SIZE];

/** Server-side pager shared by the users and groups panels. */
export function AcPager({
	page,
	perPage,
	total,
	pageCount,
	onPageChange,
	onPerPageChange,
	pending = false,
}: {
	page: number;
	perPage: number;
	total: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (perPage: number) => void;
	pending?: boolean;
}) {
	const first = total === 0 ? 0 : (page - 1) * perPage + 1;
	const last = Math.min(page * perPage, total);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
			<p className="text-xs text-muted-foreground">
				{pending
					? "Loading…"
					: `${formatAcNumber(first)}–${formatAcNumber(last)} of ${formatAcNumber(total)}`}
			</p>

			<div className="flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<span className="text-xs text-muted-foreground">Rows</span>
					<Select
						value={String(perPage)}
						onValueChange={(value) => onPerPageChange(Number(value))}
					>
						<SelectTrigger size="sm" className="h-7 w-16">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZES.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon-sm"
						title="Previous page"
						disabled={pending || page <= 1}
						onClick={() => onPageChange(page - 1)}
					>
						<ChevronLeft />
					</Button>
					<span className="min-w-16 text-center text-xs text-muted-foreground">
						Page {pageCount === 0 ? 0 : Math.min(page, pageCount)} of{" "}
						{formatAcNumber(pageCount)}
					</span>
					<Button
						variant="outline"
						size="icon-sm"
						title="Next page"
						disabled={pending || page >= pageCount}
						onClick={() => onPageChange(page + 1)}
					>
						<ChevronRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
