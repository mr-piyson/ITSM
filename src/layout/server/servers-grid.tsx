"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	capitalize,
	serverImageUrl,
	serverStatusBadge,
} from "@/lib/server-constants";
import { cn } from "@/lib/utils";
import type { ServerItem } from "@/server/routers/servers";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

type ServersGridProps = {
	servers: ServerItem[];
	onDetails: (server: ServerItem) => void;
	onEdit: (server: ServerItem) => void;
};

export function ServersGrid({ servers, onDetails, onEdit }: ServersGridProps) {
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

	const rowCount = Math.ceil(servers.length / columns);
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
					const rowItems = servers.slice(start, start + columns);
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
								{rowItems.map((server) => (
									<ServerCard
										key={server.id}
										server={server}
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

function ServerCard({
	server,
	onDetails,
	onEdit,
}: {
	server: ServerItem;
	onDetails: (server: ServerItem) => void;
	onEdit: (server: ServerItem) => void;
}) {
	const imageUrl = serverImageUrl(server.image);
	const badge = serverStatusBadge(server);

	return (
		<div className="flex h-[180px] flex-col rounded-none border bg-card p-3">
			<div className="flex items-start gap-3">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={server.name}
						className="h-14 w-20 shrink-0 object-contain"
					/>
				) : (
					<div className="flex h-14 w-20 shrink-0 items-center justify-center bg-muted text-[10px] text-muted-foreground">
						No image
					</div>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{server.name}</p>
					<p className="truncate text-xs text-muted-foreground">
						{server.type ? capitalize(server.type) : "-"}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{server.hostIP ? `HostIP: ${server.hostIP}` : "-"}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{server.os || "-"}
					</p>
				</div>
			</div>

			<span
				className={cn(
					"mt-2 inline-flex w-fit whitespace-nowrap px-1.5 py-0.5 text-xs font-medium",
					badge.className,
				)}
			>
				{badge.label}
			</span>

			<div className="mt-auto flex justify-end gap-1 border-t pt-1.5">
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(server)}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(server)}
				>
					<Pencil />
				</Button>
			</div>
		</div>
	);
}
