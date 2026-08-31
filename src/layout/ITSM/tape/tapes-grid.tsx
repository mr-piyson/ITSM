"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	formatTapeDateTime,
	locationLabel,
	tapeStatusBadge,
} from "@/lib/tape-constants";
import { cn } from "@/lib/utils";
import type { TapeItem } from "@/server/routers/ITSM/tapes";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 176;

type TapesGridProps = {
	tapes: TapeItem[];
	onDetails: (tape: TapeItem) => void;
	onEdit: (tape: TapeItem) => void;
};

export function TapesGrid({ tapes, onDetails, onEdit }: TapesGridProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);

	useEffect(() => {
		const el = parentRef.current;
		if (!el) {
			return;
		}
		const update = () => {
			setColumns(Math.max(1, Math.floor(el.clientWidth / CARD_WIDTH)));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const rowCount = Math.ceil(tapes.length / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => CARD_HEIGHT,
		overscan: 4,
	});

	return (
		<div
			ref={parentRef}
			className="min-h-0 flex-1 overflow-auto rounded-none border p-3"
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					position: "relative",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const start = virtualRow.index * columns;
					const rowItems = tapes.slice(start, start + columns);
					return (
						<div
							key={virtualRow.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<div
								className="grid gap-3"
								style={{
									gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
								}}
							>
								{rowItems.map((tape) => (
									<TapeCard
										key={tape.id}
										tape={tape}
										onDetails={onDetails}
										onEdit={onEdit}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function TapeCard({
	tape,
	onDetails,
	onEdit,
}: {
	tape: TapeItem;
	onDetails: (tape: TapeItem) => void;
	onEdit: (tape: TapeItem) => void;
}) {
	const badge = tapeStatusBadge(tape.status, Boolean(tape.month && tape.year));

	return (
		<button
			type="button"
			onClick={() => onDetails(tape)}
			className="flex h-[156px] cursor-pointer flex-col rounded-none border bg-card p-3 text-left transition-colors hover:bg-muted/50"
		>
			<div className="flex items-start justify-between gap-2">
				<p className="truncate font-mono text-sm font-medium">{tape.tapeID}</p>
				<span
					className={cn(
						"inline-flex shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
						badge.className,
					)}
				>
					{badge.label}
				</span>
			</div>

			<div className="mt-1.5 min-w-0 flex-1 space-y-0.5">
				<p className="truncate text-xs text-muted-foreground">
					{locationLabel(tape.location)}
				</p>
				{tape.month || tape.year ? (
					<>
						<p className="truncate text-xs text-muted-foreground">
							{[tape.month, tape.year].filter(Boolean).join(" ")}
							{tape.sequenceNum ? ` · #${tape.sequenceNum}` : ""}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							Last written: {formatTapeDateTime(tape.lastWritten)}
						</p>
					</>
				) : (
					<p className="text-xs italic text-muted-foreground">
						No backup assigned yet
					</p>
				)}
			</div>

			<div className="mt-auto flex justify-end gap-1 border-t pt-1.5">
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={(e) => {
						e.stopPropagation();
						onDetails(tape);
					}}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(tape);
					}}
				>
					<Pencil />
				</Button>
			</div>
		</button>
	);
}
