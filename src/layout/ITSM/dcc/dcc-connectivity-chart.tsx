"use client";

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from "recharts";

import type { DccLogItem } from "@/server/routers/ITSM/dccs";

type DccConnectivityChartProps = {
	logs: DccLogItem[];
};

type ChartPoint = {
	label: string;
	dccLatency: number | null;
	readerLatency: number | null;
	status: string;
};

function formatCheckedAt(value: string | null): string {
	if (!value) {
		return "";
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}
	return parsed.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function DccConnectivityChart({ logs }: DccConnectivityChartProps) {
	const data: ChartPoint[] = logs
		.slice()
		.reverse()
		.map((log) => ({
			label: formatCheckedAt(log.checkedAt),
			dccLatency: log.dccPingLatencyMs,
			readerLatency: log.readerPingLatencyMs,
			status: log.status,
		}));

	if (data.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
				No connectivity data yet.
			</div>
		);
	}

	const renderTooltip = ({ active, payload }: TooltipContentProps) => {
		if (!active || !payload?.length) {
			return null;
		}
		const point = payload[0]?.payload as ChartPoint | undefined;
		if (!point) {
			return null;
		}
		return (
			<div className="rounded-none border bg-background px-3 py-2 text-xs shadow">
				<p className="font-medium">{point.label || "—"}</p>
				<p>Status: {point.status}</p>
				<p>
					DCC: {point.dccLatency != null ? `${point.dccLatency} ms` : "offline"}
				</p>
				<p>
					Reader:{" "}
					{point.readerLatency != null
						? `${point.readerLatency} ms`
						: "offline"}
				</p>
			</div>
		);
	};

	return (
		<div className="h-40 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					margin={{ top: 4, right: 8, bottom: 0, left: -18 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="label"
						interval="preserveStartEnd"
						tick={{ fontSize: 10 }}
						stroke="var(--muted-foreground)"
					/>
					<YAxis
						tick={{ fontSize: 10 }}
						stroke="var(--muted-foreground)"
						width={40}
					/>
					<Tooltip content={renderTooltip} />
					<Legend
						iconSize={8}
						wrapperStyle={{ fontSize: 10 }}
						formatter={(value) => <span className="text-xs">{value}</span>}
					/>
					<Line
						type="monotone"
						dataKey="dccLatency"
						stroke="#2563eb"
						strokeWidth={1.5}
						dot={false}
						isAnimationActive={false}
						connectNulls={false}
						name="DCC (Pi)"
					/>
					<Line
						type="monotone"
						dataKey="readerLatency"
						stroke="#dc2626"
						strokeWidth={1.5}
						dot={false}
						isAnimationActive={false}
						connectNulls={false}
						name="Card Reader"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
