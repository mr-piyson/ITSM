"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
	type ICellRendererParams,
	type RowStyle,
} from "ag-grid-community";

import { Badge } from "@/components/ui/badge";
import type { DailyAttendance } from "@/server/routers/attendance";
import { useTableTheme } from "@/hooks/use-table-theme";

ModuleRegistry.registerModules([AllCommunityModule]);

type AttendanceTableProps = {
	days: DailyAttendance[];
};

function formatMinutes(minutes: number): string {
	if (minutes === 0) {
		return "-";
	}
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) {
		return `${h}h ${m}m`;
	}
	if (h > 0) {
		return `${h}h`;
	}
	return `${m}m`;
}

function StatusBadge({ status }: { status: DailyAttendance["status"] }) {
	if (status === "absent") {
		return (
			<Badge
				variant="destructive"
				className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
			>
				Absent
			</Badge>
		);
	}
	if (status === "late") {
		return (
			<Badge
				variant="secondary"
				className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
			>
				Late
			</Badge>
		);
	}
	if (status === "weekend") {
		return (
			<Badge
				variant="secondary"
				className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
			>
				Weekend
			</Badge>
		);
	}
	return (
		<Badge
			variant="secondary"
			className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
		>
			On Time
		</Badge>
	);
}

function getWeekday(dateStr: string): string {
	const [y, m, d] = dateStr.split("-");
	const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
	return dateObj.toLocaleDateString("en-US", { weekday: "long" });
}

export function AttendanceTable({ days }: AttendanceTableProps) {
	const tableTheme = useTableTheme();
	const columnDefs = useMemo<ColDef<DailyAttendance>[]>(
		() => [
			{
				headerName: "Day",
				valueGetter: (params) =>
					params.data ? getWeekday(params.data.date) : "",
				width: 110,
				sortable: false,
				filter: false,
			},
			{
				headerName: "Date",
				field: "date",
				width: 120,
				sortable: false,
				filter: false,
				cellClass: "font-mono text-xs",
			},
			{
				headerName: "Check In",
				field: "checkIn",
				width: 100,
				sortable: false,
				filter: false,
				cellClass: (params) =>
					params.value
						? "font-mono text-xs"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (params) => params.value ?? "-",
			},
			{
				headerName: "Check Out",
				field: "checkOut",
				width: 100,
				sortable: false,
				filter: false,
				cellClass: (params) =>
					params.value
						? "font-mono text-xs"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (params) => params.value ?? "-",
			},
			{
				headerName: "Status",
				field: "status",
				width: 110,
				sortable: false,
				filter: false,
				cellRenderer: (params: ICellRendererParams<DailyAttendance>) => {
					if (!params.data) return null;
					return <StatusBadge status={params.data.status} />;
				},
			},
			{
				headerName: "Late",
				field: "lateMinutes",
				width: 100,
				sortable: false,
				filter: false,
				cellClass: (params) =>
					params.value > 0
						? "font-mono text-xs text-red-600 dark:text-red-400"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (params) => formatMinutes(params.value),
			},
			{
				headerName: "Extra Hours",
				field: "extraMinutes",
				width: 120,
				sortable: false,
				filter: false,
				cellClass: (params) =>
					params.value > 0
						? "font-mono text-xs text-emerald-600 dark:text-emerald-400"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (params) => formatMinutes(params.value),
			},
		],
		[],
	);

	return (
		<div
			className="ag-theme-alpine flex-1 min-h-0 rounded-none border"
			style={{ height: "100%" }}
		>
			<AgGridReact
				theme={tableTheme}
				rowData={days}
				columnDefs={columnDefs}
				getRowId={(params) => params.data.date}
				getRowStyle={(params): RowStyle | undefined => {
					if (params.data?.weekend) {
						return {
							background: "hsl(var(--muted) / 0.5)",
							color: "hsl(var(--muted-foreground))",
						};
					}
					return undefined;
				}}
				headerHeight={36}
				rowHeight={40}
				suppressRowHoverHighlight={false}
			/>
		</div>
	);
}
