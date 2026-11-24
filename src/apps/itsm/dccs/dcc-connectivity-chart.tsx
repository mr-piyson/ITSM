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
	dccOnline: number;
	readerOnline: number;
	dccLatencyMs: number | null;
	readerLatencyMs: number | null;
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
			dccOnline: log.dccReachable ? 1 : 0,
			readerOnline: log.readerReachable ? 1 : 0,
			dccLatencyMs: log.dccPingLatencyMs,
			readerLatencyMs: log.readerPingLatencyMs,
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
				<p>
					DCC (Pi):{" "}
					<span className={point.dccOnline ? "text-green-600" : "text-red-600"}>
						{point.dccOnline ? "Online" : "Offline"}
					</span>
					{point.dccLatencyMs != null && ` (${point.dccLatencyMs} ms)`}
				</p>
				<p>
					Card Reader:{" "}
					<span
						className={point.readerOnline ? "text-green-600" : "text-red-600"}
					>
						{point.readerOnline ? "Online" : "Offline"}
					</span>
					{point.readerLatencyMs != null && ` (${point.readerLatencyMs} ms)`}
				</p>
			</div>
		);
	};

	return (
		<div className="h-40 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					margin={{ top: 4, right: 8, bottom: 0, left: -4 }}
				>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
					<XAxis
						dataKey="label"
						interval="preserveStartEnd"
						tick={{ fontSize: 10 }}
						stroke="var(--muted-foreground)"
					/>
					<YAxis
						domain={[0, 1]}
						ticks={[0, 1]}
						tickFormatter={(v: number) => (v === 1 ? "Online" : "Offline")}
						tick={{ fontSize: 10 }}
						stroke="var(--muted-foreground)"
						width={52}
						tickLine={false}
					/>
					<Tooltip content={renderTooltip} />
					<Legend
						iconSize={8}
						wrapperStyle={{ fontSize: 10 }}
						formatter={(value) => <span className="text-xs">{value}</span>}
					/>
					<Line
						type="stepAfter"
						dataKey="dccOnline"
						stroke="#2563eb"
						strokeWidth={1.5}
						dot={{ r: 3 }}
						isAnimationActive={false}
						name="DCC (Pi)"
					/>
					<Line
						type="stepAfter"
						dataKey="readerOnline"
						stroke="#dc2626"
						strokeWidth={1.5}
						dot={{ r: 3 }}
						isAnimationActive={false}
						name="Card Reader"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
