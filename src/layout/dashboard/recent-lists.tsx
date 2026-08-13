"use client";

import { formatDistanceToNow } from "date-fns";
import { Boxes, History, Monitor, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	RecentAsset,
	RecentItem,
	RecentLog,
} from "@/server/routers/dashboard";

function relativeTime(date: string): string {
	if (!date) {
		return "";
	}
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}
	return formatDistanceToNow(parsed, { addSuffix: true });
}

function ListCard({
	icon: Icon,
	title,
	children,
}: {
	icon: LucideIcon;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle className="flex items-center gap-1.5">
					<Icon className="size-4 text-muted-foreground" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-1.5">{children}</CardContent>
		</Card>
	);
}

function EmptyRow() {
	return (
		<p className="py-6 text-center text-xs text-muted-foreground">
			Nothing yet
		</p>
	);
}

function LogRow({ log }: { log: RecentLog }) {
	return (
		<li className="flex flex-col gap-0.5 border-b border-border/60 py-1.5 last:border-0">
			<div className="flex items-center justify-between gap-2">
				<span className="truncate font-medium">{log.node}</span>
				<time className="shrink-0 text-[11px] text-muted-foreground">
					{relativeTime(log.date)}
				</time>
			</div>
			<p className="truncate text-xs text-muted-foreground">
				{log.user ?? "System"} · {log.action} #{log.nodeID}
			</p>
		</li>
	);
}

function AssetRow({ asset }: { asset: RecentAsset }) {
	return (
		<li className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
			<Link href="/app/assets" className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium">
					{asset.deviceName ?? asset.code}
				</span>
				<span className="truncate font-mono text-[11px] text-muted-foreground">
					{asset.code}
				</span>
			</Link>
			{asset.type && <Badge variant="outline">{asset.type}</Badge>}
		</li>
	);
}

function ItemRow({ item }: { item: RecentItem }) {
	return (
		<li className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 last:border-0">
			<Link href="/app/stock" className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium">{item.name}</span>
				<span className="truncate text-xs text-muted-foreground">
					{item.category}
				</span>
			</Link>
			<Badge variant={item.stock === 0 ? "destructive" : "outline"}>
				{item.stock}
			</Badge>
		</li>
	);
}

export function RecentLists({
	recentLogs,
	recentAssets,
	recentItems,
}: {
	recentLogs: RecentLog[];
	recentAssets: RecentAsset[];
	recentItems: RecentItem[];
}) {
	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-3">
			<ListCard icon={History} title="Latest logs">
				{recentLogs.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentLogs.map((log) => (
							<LogRow key={log.id} log={log} />
						))}
					</ul>
				)}
			</ListCard>
			<ListCard icon={Monitor} title="Latest assets">
				{recentAssets.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentAssets.map((asset) => (
							<AssetRow key={asset.code} asset={asset} />
						))}
					</ul>
				)}
			</ListCard>
			<ListCard icon={Boxes} title="Latest items">
				{recentItems.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentItems.map((item) => (
							<ItemRow key={item.id} item={item} />
						))}
					</ul>
				)}
			</ListCard>
		</div>
	);
}
