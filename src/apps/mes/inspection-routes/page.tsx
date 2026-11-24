"use client";

import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
	AllCommunityModule,
	CsvExportModule,
	ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTableTheme } from "@/hooks/use-tableTheme";
import type { InspectionRouteRow } from "@/server/routers/MES/reports/inspection-routes";
import { trpc } from "@/trpc/react";

import {
	DateCellRenderer,
	PanelCellRender,
	RouteCellRenderer,
} from "../CellsRender";
import { filterParam } from "../params";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function ReportPage() {
	const theme = useTableTheme();
	const [filter, setFilter] = useQueryState("filter", filterParam);
	const [gridApi, setGridApi] = useState<GridApi | null>(null);

	const { data, isLoading, isFetching, isError, error, refetch } =
		trpc.mes.route.get_inspection_routes.useQuery({
			filter,
		});

	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === "visible") void refetch();
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [refetch]);

	const columnDefs = useMemo<ColDef<InspectionRouteRow>[]>(
		() => [
			{
				headerName: "Panel Serial",
				field: "panel_serial",
				pinned: "left",
				width: 280,
				cellRenderer: PanelCellRender,
			},
			{
				headerName: "Date Out",
				field: "latest_out",
				filter: "agDateColumnFilter",
				cellRenderer: DateCellRenderer,
			},
			{
				headerName: "Last Gate",
				field: "route",
				width: 120,
				valueGetter: ({ data }) => data?.route.at(-1) ?? "N/A",
			},
			{
				headerName: "Route",
				field: "route",
				width: 1080,
				cellRenderer: RouteCellRenderer,
			},
		],
		[],
	);

	const defaultColDef = useMemo<ColDef>(
		() => ({
			resizable: true,
			sortable: true,
			filter: true,
			floatingFilter: true,
		}),
		[],
	);

	const onGridReady = useCallback(
		(params: GridReadyEvent) => setGridApi(params.api),
		[],
	);

	const exportRows = useCallback(
		() =>
			gridApi?.exportDataAsCsv({
				fileName: `panel-routes-${new Date().toISOString().split("T")[0]}.csv`,
			}),
		[gridApi],
	);

	const refreshData = useCallback(() => {
		gridApi?.setFilterModel(null);
		gridApi?.resetColumnState();
		refetch();
	}, [gridApi, refetch]);

	if (isError) {
		return (
			<div className="p-10 text-center">
				<p className="text-destructive mb-4">
					{error?.message || "Failed to load data"}
				</p>
				<Button onClick={() => refetch()}>Retry</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden bg-background">
			<div className="p-3 border-b bg-card flex flex-row items-center justify-between gap-3 shrink-0">
				<div className="flex flex-1 flex-row gap-4">
					<Button
						variant="outline"
						onClick={exportRows}
						disabled={isFetching || !gridApi}
					>
						<FileSpreadsheet className="size-4" />
						<span className="max-sm:hidden">Export</span>
					</Button>
					<Button variant="outline" onClick={refreshData} disabled={isFetching}>
						<RefreshCw className="size-4" />
						<span className="max-sm:hidden">Refresh</span>
					</Button>
				</div>

				<div className="flex flex-1 flex-row justify-end">
					<Select value={filter} onValueChange={(val) => setFilter(val)}>
						<SelectTrigger className="w-40 border-border">
							<SelectValue placeholder="Filter by date" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="last7days">Last 7 Days</SelectItem>
							<SelectItem value="last30days">Last 30 Days</SelectItem>
							<SelectItem value="last90days">Last 90 Days</SelectItem>
							<SelectItem value="1year">Last 1 Year</SelectItem>
							<SelectItem value="2years">Last 2 Years</SelectItem>
							<SelectItem value="3years">Last 3 Years</SelectItem>
							<SelectItem value="5years">Last 5 Years</SelectItem>
							<SelectItem value="all">All Time</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex-1 min-h-0">
				<AgGridReact
					rowData={data ?? []}
					columnDefs={columnDefs}
					defaultColDef={defaultColDef}
					onGridReady={onGridReady}
					theme={theme}
					loading={isLoading}
				/>
			</div>

			<div className="text-xs text-muted-foreground px-4 py-2 border-t bg-muted/30 shrink-0">
				Total Panels: {data?.length ?? 0}
			</div>
		</div>
	);
}
