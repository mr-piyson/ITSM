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

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { assetTypeColor } from "@/lib/assets-constants";
import type {
	AssetTypeCount,
	StockCategory,
} from "@/server/routers/ITSM/dashboard";

const STOCK_CONFIG: ChartConfig = {
	itemCount: { label: "Item count", color: "var(--chart-1)" },
	stock: { label: "Total stock", color: "var(--chart-2)" },
};

function truncateLabel(value: string): string {
	return value.length > 16 ? `${value.slice(0, 14)}…` : value;
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

export function StockByCategoryCard({ data }: { data: StockCategory[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Stock by category</CardTitle>
				<CardDescription>Items and total units on hand</CardDescription>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No stock data available
					</p>
				) : (
					<ChartContainer config={STOCK_CONFIG} className="h-64 w-full">
						<BarChart data={data} accessibilityLayer>
							<CartesianGrid vertical={false} strokeDasharray="3 3" />
							<XAxis
								dataKey="category"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								interval={0}
								angle={-20}
								height={48}
								tickFormatter={truncateLabel}
							/>
							<YAxis tickLine={false} axisLine={false} width={32} />
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent nameKey="category" />}
							/>
							<Bar
								dataKey="itemCount"
								fill="var(--color-itemCount)"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="stock"
								fill="var(--color-stock)"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}

export function DistributionCharts({
	assetsByType,
	stockByCategory,
	totalAssets,
}: {
	assetsByType: AssetTypeCount[];
	stockByCategory: StockCategory[];
	totalAssets: number;
}) {
	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-2">
			<AssetsByTypeCard data={assetsByType} total={totalAssets} />
			<StockByCategoryCard data={stockByCategory} />
		</div>
	);
}
