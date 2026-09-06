"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	type ChartConfig,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { assetTypeColor } from "@/lib/assets-constants";
import { formatDateLabel } from "@/lib/contract-constants";
import type {
	AssetTypeCount,
	ContractExpiry,
	ExpiredContract,
} from "@/server/routers/ITSM/dashboard";

const EXPIRY_CONFIG: ChartConfig = {
	daysLeft: { label: "Days left", color: "var(--chart-1)" },
};

const TOOLTIP_TONES = {
	urgent: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
	soon: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const;

function truncateLabel(value: string): string {
	return value.length > 16 ? `${value.slice(0, 14)}…` : value;
}

function ContractTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload?: ContractExpiry }>;
}) {
	if (!active || !payload?.length) {
		return null;
	}

	const entry = payload[0].payload as ContractExpiry;
	const label =
		entry.daysLeft === 0
			? "Expires today"
			: `${entry.daysLeft} day${entry.daysLeft === 1 ? "" : "s"} left`;

	return (
		<div className="grid min-w-32 items-start gap-1.5 rounded-none border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<div className="font-medium">{entry.productName}</div>
			<Badge
				variant="outline"
				className={
					entry.daysLeft <= 7 ? TOOLTIP_TONES.urgent : TOOLTIP_TONES.soon
				}
			>
				{label}
			</Badge>
		</div>
	);
}

export function AssetsByTypeCard({
	data,
	total,
}: {
	data: AssetTypeCount[];
	total: number;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Assets by type</CardTitle>
				<CardDescription>{total} registered assets</CardDescription>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No asset data available
					</p>
				) : (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<ChartContainer
							config={{ assets: { label: "Assets" } }}
							className="mx-auto h-48 w-full min-w-0 flex-1 sm:mx-0"
						>
							<PieChart>
								<Pie
									data={data}
									dataKey="total"
									nameKey="type"
									innerRadius={48}
									outerRadius={78}
									paddingAngle={2}
									strokeWidth={2}
								>
									{data.map((entry) => (
										<Cell key={entry.type} fill={assetTypeColor(entry.type)} />
									))}
								</Pie>
								<ChartTooltip
									content={<ChartTooltipContent hideLabel nameKey="type" />}
								/>
							</PieChart>
						</ChartContainer>
						<ul className="flex min-w-0 flex-col gap-1.5 sm:w-44">
							{data.slice(0, 7).map((entry) => {
								const percent =
									total > 0 ? Math.round((entry.total / total) * 100) : 0;
								return (
									<li
										key={entry.type}
										className="flex items-center justify-between gap-2 text-xs"
									>
										<span className="flex min-w-0 items-center gap-1.5">
											<span
												className="size-2 shrink-0"
												style={{
													backgroundColor: assetTypeColor(entry.type),
												}}
											/>
											<span className="truncate">{entry.type}</span>
										</span>
										<span className="shrink-0 text-muted-foreground tabular-nums">
											{entry.total} ({percent}%)
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function expiryBarColor(daysLeft: number): string {
	return daysLeft <= 7 ? "hsl(0, 84%, 60%)" : "hsl(38, 92%, 50%)";
}

export function ActiveContractsCard({
	expiring,
}: {
	expiring: ContractExpiry[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Active Contracts</CardTitle>
				<CardDescription>
					{expiring.length} active contracts · soonest to expire
				</CardDescription>
			</CardHeader>
			<CardContent>
				{expiring.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No active contracts
					</p>
				) : (
					<ChartContainer config={EXPIRY_CONFIG} className="h-72 w-full">
						<BarChart
							data={expiring}
							layout="vertical"
							margin={{ left: 8, right: 16 }}
							accessibilityLayer
						>
							<CartesianGrid horizontal={false} strokeDasharray="3 3" />
							<XAxis
								type="number"
								dataKey="daysLeft"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								domain={[0, "dataMax + 2"]}
							/>
							<YAxis
								type="category"
								dataKey="productName"
								tickLine={false}
								axisLine={false}
								tickMargin={4}
								width={120}
								tickFormatter={truncateLabel}
							/>
							<ChartTooltip cursor={false} content={<ContractTooltip />} />
							<Bar dataKey="daysLeft" radius={[0, 4, 4, 0]} barSize={18}>
								{expiring.map((entry) => (
									<Cell key={entry.id} fill={expiryBarColor(entry.daysLeft)} />
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}

export function ExpiredContractsCard({
	expired,
}: {
	expired: ExpiredContract[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Expired Contracts</CardTitle>
				<CardDescription>{expired.length} expired contracts</CardDescription>
			</CardHeader>
			<CardContent>
				{expired.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No expired contracts
					</p>
				) : (
					<ul className="flex max-h-72 min-w-0 flex-col gap-2 overflow-y-auto pr-1">
						{expired.map((c) => (
							<li key={c.id} className="flex min-w-0 flex-col gap-0.5 text-xs">
								<span className="flex min-w-0 items-center gap-1.5">
									<span className="size-1.5 shrink-0 rounded-full bg-red-500" />
									<span className="truncate font-medium">{c.productName}</span>
								</span>
								{c.vendorName && (
									<span className="truncate pl-3 text-muted-foreground">
										{c.vendorName}
									</span>
								)}
								<span className="pl-3 text-red-600 dark:text-red-400">
									Expired {c.daysExpired} day
									{c.daysExpired === 1 ? "" : "s"} ago ·{" "}
									{formatDateLabel(c.endDate)}
								</span>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

export function DistributionCharts({
	assetsByType,
	totalAssets,
	contractExpiry,
	expiredContracts,
}: {
	assetsByType: AssetTypeCount[];
	totalAssets: number;
	contractExpiry: ContractExpiry[];
	expiredContracts: ExpiredContract[];
}) {
	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-3">
			<AssetsByTypeCard data={assetsByType} total={totalAssets} />
			<ActiveContractsCard expiring={contractExpiry} />
			<ExpiredContractsCard expired={expiredContracts} />
		</div>
	);
}
