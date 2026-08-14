"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { printerImageUrl } from "@/lib/printer-constants";
import type { PrinterItem } from "@/server/routers/printers";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

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
		estimateSize: () => CARD_HEIGHT,
		overscan: 4,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border p-3"
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
							}}
						>
							<div
								className="grid gap-3"
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
		<div className="flex h-[180px] flex-col rounded-none border bg-card p-3">
			<div className="flex items-start gap-3">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={printer.name}
						className="h-14 w-20 shrink-0 object-contain"
					/>
				) : (
					<div className="flex h-14 w-20 shrink-0 items-center justify-center bg-muted text-[10px] text-muted-foreground">
						No image
					</div>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{printer.name}</p>
					<p className="truncate text-xs text-muted-foreground">
						{printer.location}
					</p>
				</div>
			</div>

			<p className="mt-2 truncate text-xs text-muted-foreground">
				Used by: {printer.usedBy || "-"}
			</p>

			<div className="mt-auto flex justify-end gap-1 border-t pt-1.5">
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(printer)}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(printer)}
				>
					<Pencil />
				</Button>
			</div>
		</div>
	);
}
