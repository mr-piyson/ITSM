"use client";

import {
	Boxes,
	Monitor,
	PackageSearch,
	Printer,
	ShoppingCart,
	Server,
	Users,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/server/routers/dashboard";
import { trpc } from "@/trpc/react";

import { AlertsPanel } from "./alerts-panel";
import { DistributionCharts } from "./distribution-charts";
import { QuickActions } from "./quick-actions";
import { RecentLists } from "./recent-lists";
import { StatCard } from "./stat-card";

export function DashboardPage() {
	const { data, isPending } = trpc.dashboard.overview.useQuery();

	return (
		<div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
				<p className="text-xs text-muted-foreground">
					IT service management overview
				</p>
			</div>

			{isPending ? (
				<DashboardSkeleton />
			) : data ? (
				<DashboardContent data={data} />
			) : null}
		</div>
	);
}

function DashboardContent({ data }: { data: DashboardData }) {
	const { kpis, alerts } = data;

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<StatCard
					label="Assets"
					value={kpis.totalAssets}
					icon={Monitor}
					href="/app/assets"
				/>
				<StatCard
					label="Provide"
					value={kpis.totalProvide}
					icon={PackageSearch}
					href="/app/provide"
				/>
				<StatCard
					label="Stock (units)"
					value={kpis.totalStock}
					icon={Boxes}
					href="/app/stock"
				/>
				<StatCard
					label="Purchases"
					value={kpis.totalPurchase}
					icon={ShoppingCart}
					href="/app/purchases"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-y border-border py-2 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<Users className="size-3.5" />
					{kpis.totalEmployees.toLocaleString()} employees
				</span>
				<span className="flex items-center gap-1.5">
					<Printer className="size-3.5" />
					{kpis.totalPrinters.toLocaleString()} printers
				</span>
				<span className="flex items-center gap-1.5">
					<Server className="size-3.5" />
					{kpis.totalServers.toLocaleString()} servers
				</span>
				<span className="flex items-center gap-1.5">
					<Boxes className="size-3.5" />
					{kpis.totalItems.toLocaleString()} items
				</span>
			</div>


			<DistributionCharts
				assetsByType={data.assetsByType}
				stockByCategory={data.stockByCategory}
				totalAssets={kpis.totalAssets}
			/>

			<QuickActions />

			<RecentLists
				recentLogs={data.recentLogs}
				recentAssets={data.recentAssets}
				recentItems={data.recentItems}
			/>

			<AlertsPanel alerts={alerts} />
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-20" />
				))}
			</div>
			<Skeleton className="h-9" />
			<div className="grid min-w-0 gap-4 lg:grid-cols-2">
				<Skeleton className="h-72" />
				<Skeleton className="h-72" />
			</div>
			<Skeleton className="h-32" />
			<div className="grid min-w-0 gap-4 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-56" />
				))}
			</div>
		</div>
	);
}
