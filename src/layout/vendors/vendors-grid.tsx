"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { vendorImageUrl } from "@/lib/vendor-constants";
import type { Vendor } from "@/server/routers/vendors";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 200;

type VendorsGridProps = {
	vendors: Vendor[];
	onDetails: (vendor: Vendor) => void;
	onEdit: (vendor: Vendor) => void;
};

export function VendorsGrid({ vendors, onDetails, onEdit }: VendorsGridProps) {
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

	const rowCount = Math.ceil(vendors.length / columns);
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
					const rowItems = vendors.slice(start, start + columns);
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
								{rowItems.map((vendor) => (
									<VendorCard
										key={vendor.id}
										vendor={vendor}
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

function VendorCard({
	vendor,
	onDetails,
	onEdit,
}: {
	vendor: Vendor;
	onDetails: (vendor: Vendor) => void;
	onEdit: (vendor: Vendor) => void;
}) {
	const imageUrl = vendorImageUrl(vendor.image);

	return (
		<Button
			type="button"
			onClick={() => onDetails(vendor)}
			className="flex h-[184px] cursor-pointer flex-col rounded-none border bg-card p-3 text-left transition-colors hover:bg-muted/50"
		>
			<div className="flex items-start gap-3">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={vendor.name}
						className="h-12 w-20 shrink-0 object-contain"
					/>
				) : (
					<div className="flex h-12 w-20 shrink-0 items-center justify-center bg-muted text-muted-foreground">
						<Store className="size-5" />
					</div>
				)}
				<p className="line-clamp-2 min-w-0 flex-1 text-sm font-medium">
					{vendor.name}
				</p>
			</div>

			<p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
				{vendor.notes || "No notes"}
			</p>

			<ul className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-hidden text-xs">
				{vendor.contacts.slice(0, 3).map((contact) => (
					<li key={contact.id} className="flex items-center gap-1 truncate">
						<span className="font-medium">{contact.contactName}</span>
						{contact.personPosition && (
							<span className="text-muted-foreground">
								({contact.personPosition})
							</span>
						)}
						<span className="truncate text-muted-foreground">
							{contact.contact}
						</span>
					</li>
				))}
				{vendor.contacts.length > 3 && (
					<li className="text-muted-foreground">
						+{vendor.contacts.length - 3} more…
					</li>
				)}
			</ul>

			<div
				className="mt-auto flex justify-end gap-1 border-t pt-1.5"
				onClick={(e) => e.stopPropagation()}
			>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(vendor)}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(vendor)}
				>
					<Pencil />
				</Button>
			</div>
		</Button>
	);
}
