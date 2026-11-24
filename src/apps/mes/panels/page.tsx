"use client";

import type {
	ColDef,
	GridApi,
	GridOptions,
	GridReadyEvent,
} from "ag-grid-community";
import {
	AllCommunityModule,
	CsvExportModule,
	ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTableTheme } from "@/hooks/use-tableTheme";
import { trpc } from "@/trpc/react";

import {
	BoxCellRenderer,
	ContainerCellRenderer,
	DateCellRenderer,
	JobCellRenderer,
	PanelCellRender,
	StatusCellRenderer,
} from "../CellsRender";
import type { PanelsReportData } from "@/server/routers/MES/reports/panel";

interface ProjectItem {
	project_code: string;
	project_name: string;
}

const ALL_PROJECTS: ProjectItem = {
	project_code: "all",
	project_name: "All Projects",
};

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

export default function ReportPage() {
	const theme = useTableTheme();
	const [gridApi, setGridApi] = useState<GridApi | null>(null);
	const [selectedRows, setSelectedRows] = useState<PanelsReportData[]>([]);
	const [filter, setFilter] = useState("today");
	const [panelType, setPanelType] = useState<"all" | "main" | "assembly">(
		"all",
	);
	const [selectedProject, setSelectedProject] =
		useState<ProjectItem>(ALL_PROJECTS);

	const { data: projects = [] } = trpc.mes.panels.getProjects.useQuery() as {
		data: ProjectItem[];
	};

	const allProjectItems = useMemo(
		() => [ALL_PROJECTS, ...projects],
		[projects],
	);

	const { data, isLoading, isFetching, error, refetch } =
		trpc.mes.panels.getPanels.useQuery({
			filter,
			panelType,
			projectCode: selectedProject.project_code,
		});

	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === "visible") void refetch();
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [refetch]);

	const gridOptions = useMemo<GridOptions>(
		() => ({
			suppressMovableColumns: true,
			defaultColDef: {
				suppressMovable: true,
			},
		}),
		[],
	);

	const columnDefs = useMemo<ColDef<PanelsReportData>[]>(
		() => [
			{
				headerName: "Panel ID",
				field: "panel_id",
				pinned: "left",
				width: 250,
				cellRenderer: PanelCellRender,
			},
			{
				headerName: "Description",
				field: "description",
			},
			{
				headerName: "ASM Part No",
				field: "epicor_asm_part_no",
			},
			{ headerName: "Project Name", field: "project" },
			{
				headerName: "Job ID",
				field: "job_id",
				cellRenderer: JobCellRenderer,
			},
			{
				headerName: "Created At",
				field: "created_at",
				width: 130,
				filter: "agDateColumnFilter",
				cellRenderer: DateCellRenderer,
			},
			{
				headerName: "QC Passed At",
				field: "qc_datetime",
				width: 130,
				filter: "agDateColumnFilter",
				cellRenderer: DateCellRenderer,
			},
			{
				headerName: "Final",
				field: "final",
				width: 100,
				cellRenderer: StatusCellRenderer,
			},
			{
				headerName: "Wrapped",
				field: "wrapped",
				width: 100,
				cellRenderer: StatusCellRenderer,
			},
			{
				headerName: "Box Code",
				field: "package",
				cellRenderer: BoxCellRenderer,
			},
			{
				headerName: "Container Code",
				field: "container",
				cellRenderer: ContainerCellRenderer,
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
			suppressMovable: true,
		}),
		[],
	);

	const onGridReady = useCallback(
		(params: GridReadyEvent) => setGridApi(params.api),
		[],
	);

	const onRowSelectionChanged = useCallback(() => {
		if (gridApi) {
			setSelectedRows(gridApi.getSelectedRows());
		}
	}, [gridApi]);

	const refreshData = useCallback(() => {
		gridApi?.setFilterModel(null);
		gridApi?.resetColumnState();
		gridApi?.deselectAll();
		refetch();
	}, [gridApi, refetch]);

	const exportRows = useCallback(() => {
		gridApi?.exportDataAsCsv({
			onlySelected: selectedRows.length > 0,
			fileName: `panels-${new Date().toISOString().split("T")[0]}.csv`,
		});
	}, [gridApi, selectedRows]);

	if (error) {
		return (
			<div className="p-10 text-center">
				<p className="text-destructive mb-4">
					{error.message || "Failed to load data"}
				</p>
				<Button onClick={() => refetch()}>Retry</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden bg-background">
			<div className="p-3 border-b bg-card flex flex-row items-center justify-between gap-3 shrink-0">
				<div className="flex flex-1 flex-row gap-4 items-center">
					<Button
						variant="outline"
						onClick={exportRows}
						disabled={isFetching || !gridApi}
					>
						<FileSpreadsheet className="size-4 mr-2" />
						<span className="max-sm:hidden">
							Export {selectedRows.length > 0 && `(${selectedRows.length})`}
						</span>
					</Button>

					<Button variant="outline" onClick={refreshData} disabled={isFetching}>
						<RefreshCw className="size-4 mr-1" />
						<span className="max-sm:hidden">Refresh</span>
					</Button>

					<Combobox
						value={selectedProject}
						onValueChange={(val) => setSelectedProject(val ?? ALL_PROJECTS)}
						items={allProjectItems}
						itemToStringLabel={(p: ProjectItem) =>
							`${p.project_code} ${p.project_name}`
						}
					>
						<ComboboxInput placeholder="Search project..." className="w-56" />
						<ComboboxContent>
							<ComboboxEmpty>No project found.</ComboboxEmpty>
							<ComboboxList>
								{(p: ProjectItem) => (
									<ComboboxItem key={p.project_code} value={p}>
										<span className="flex flex-col">
											<span className="text-sm font-medium leading-snug">
												{p.project_name}
											</span>
											<span className="text-xs text-muted-foreground">
												{p.project_code}
											</span>
										</span>
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>

					<Select
						value={panelType}
						onValueChange={(value) =>
							setPanelType(value as "all" | "main" | "assembly")
						}
					>
						<SelectTrigger className="w-44 border-border">
							<SelectValue placeholder="Panel Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Panels</SelectItem>
							<SelectItem value="main">Main Panels</SelectItem>
							<SelectItem value="assembly">Assembly Panels</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-row justify-end">
					<Select
						value={filter}
						onValueChange={(val) => {
							if (val !== null) {
								setFilter(val);
							}
						}}
					>
						<SelectTrigger className="w-40 border-border">
							<SelectValue placeholder="Filter by date" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="last7days">Last 7 Days</SelectItem>
							<SelectItem value="last30days">Last 30 Days</SelectItem>
							<SelectItem value="last90days">Last 90 Days</SelectItem>
							<SelectItem value="1year">Last Year</SelectItem>
							<SelectItem value="2years">Last 2 Years</SelectItem>
							<SelectItem value="3years">Last 3 Years</SelectItem>
							<SelectItem value="5years">Last 5 Years</SelectItem>
							<SelectItem value="all">All Times</SelectItem>
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
					onSelectionChanged={onRowSelectionChanged}
					rowSelection={{
						mode: "multiRow",
					}}
					theme={theme}
					loading={isLoading}
					gridOptions={gridOptions}
				/>
			</div>

			<div className="text-xs text-muted-foreground px-4 py-2 border-t bg-muted/30 shrink-0">
				Total Panels: {data?.length ?? 0}
				{selectedRows.length > 0 && (
					<span className="pl-4 ml-2 border-l-2 border-foreground">
						Selected: {selectedRows.length}
					</span>
				)}
			</div>
		</div>
	);
}
