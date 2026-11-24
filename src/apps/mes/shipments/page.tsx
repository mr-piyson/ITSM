"use client";

import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
	AllCommunityModule,
	CsvExportModule,
	ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
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
import type { ShippedPackageData } from "@/server/routers/MES/reports/shipments";
import { trpc } from "@/trpc/react";

import {
	BoxCellRenderer,
	DateCellRenderer,
	PanelCellRender,
} from "../CellsRender";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function ReportPage() {
	const theme = useTableTheme();
	const [gridApi, setGridApi] = useState<GridApi | null>(null);
	const [year, setYear] = useQueryState(
		"year",
		parseAsInteger.withDefault(currentYear),
	);
	const [month, setMonth] = useQueryState(
		"month",
		parseAsInteger.withDefault(currentMonth),
	);

	const { data, isLoading, isFetching, isError, error, refetch } =
		trpc.mes.shipping.getMonthlyShipments.useQuery({
			month,
			year,
		});

	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === "visible") void refetch();
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [refetch]);

	const columnDefs = useMemo<ColDef<ShippedPackageData>[]>(
		() => [
			{
				headerName: "Panel ID",
				field: "part_id",
				sortable: true,
				filter: true,
				flex: 1,
				cellRenderer: PanelCellRender,
			},
			{
				headerName: "Description",
				field: "description",
				sortable: true,
				filter: true,
				flex: 1,
			},
			{
				headerName: "Box Code",
				field: "package",
				sortable: true,
				filter: true,
				flex: 1,
				cellRenderer: BoxCellRenderer,
			},
			{
				headerName: "Project Name",
				field: "project",
				sortable: true,
				filter: true,
				flex: 1,
			},
			{
				headerName: "Shipped By",
				field: "shipped_by",
				sortable: true,
				filter: true,
				flex: 1,
			},
			{
				headerName: "Date",
				field: "date",
				sortable: true,
				filter: "agDateColumnFilter",
				cellRenderer: DateCellRenderer,
			},
			{
				headerName: "Job ID",
				field: "job_id",
				sortable: true,
				filter: true,
				flex: 1,
			},
			{
				headerName: "Container ID",
				field: "container_id",
				sortable: true,
				filter: true,
				flex: 1,
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
				fileName: `shipments-${new Date().toISOString().split("T")[0]}.csv`,
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

				<div className="flex flex-1 flex-row justify-end gap-2">
					<Select
						value={String(year)}
						onValueChange={(v) => setYear(Number(v))}
					>
						<SelectTrigger className="border-border">
							<SelectValue placeholder="Year" />
						</SelectTrigger>
						<SelectContent>
							{Array.from({ length: 6 }, (_, index) => (
								<SelectItem
									key={index}
									value={String(new Date().getFullYear() - index)}
								>
									{new Date().getFullYear() - index}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={String(month)}
						onValueChange={(v) => setMonth(Number(v))}
					>
						<SelectTrigger className="border-border">
							<SelectValue placeholder="Month" />
						</SelectTrigger>
						<SelectContent>
							{Array.from({ length: 12 }, (_, index) => (
								<SelectItem key={index} value={String(index + 1)}>
									{monthNames[index]}
								</SelectItem>
							))}
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
