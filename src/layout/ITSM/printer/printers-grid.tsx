"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { printerImageUrl } from "@/lib/printer-constants";
import type { PrinterItem } from "@/server/routers/ITSM/printers";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 280;
const ROW_GAP = 16;

type PrintersGridProps = {
	printers: PrinterItem[];
	onDetails: (printer: PrinterItem) => void;
	onEdit: (printer: PrinterItem) => void;
};

export function PrintersGrid({
	printers,
	onDetails,
	onEdit,
}: PrintersGridProps) {
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

	const rowCount = Math.ceil(printers.length / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => CARD_HEIGHT + ROW_GAP,
		overscan: 4,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-xl border bg-muted/30 p-4"
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					position: "relative",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const start = virtualRow.index * columns;
					const rowItems = printers.slice(start, start + columns);
					return (
						<div
							key={virtualRow.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
								paddingBottom: ROW_GAP,
							}}
						>
							<div
								className="grid gap-4"
								style={{
									gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
								}}
							>
								{rowItems.map((printer) => (
									<PrinterCard
										key={printer.id}
										printer={printer}
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

function PrinterCard({
	printer,
	onDetails,
	onEdit,
}: {
	printer: PrinterItem;
	onDetails: (printer: PrinterItem) => void;
	onEdit: (printer: PrinterItem) => void;
}) {
	const imageUrl = printerImageUrl(printer.img);

	return (
		<div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
			<div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 to-muted p-6">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={printer.name}
						className="h-full w-full object-contain"
					/>
				) : (
					<div className="flex flex-col items-center gap-2 text-muted-foreground/50">
						<Printer className="size-12" strokeWidth={1} />
						<span className="text-[10px] font-medium uppercase tracking-wider">
							No image
						</span>
					</div>
				)}
				<div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
			</div>

			<div className="flex flex-1 flex-col gap-1.5 px-4 pt-3 pb-2">
				<h3 className="truncate text-sm font-semibold leading-snug">
					{printer.name || "Unnamed Printer"}
				</h3>
				<p className="truncate text-xs text-muted-foreground">
					{printer.location || "Unknown location"}
				</p>
				{printer.usedBy && (
					<p className="truncate text-xs text-muted-foreground">
						Used by <span className="font-medium text-foreground/70">{printer.usedBy}</span>
					</p>
				)}
			</div>

			<div className="flex items-center justify-end gap-1 border-t px-3 py-2">
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(printer)}
				>
					<ExternalLink className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(printer)}
				>
					<Pencil className="size-4" />
				</Button>
			</div>
		</div>
	);
}
