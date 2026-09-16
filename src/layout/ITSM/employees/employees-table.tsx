"use client";

import { useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
	type FilterModel,
	type GridApi,
	type ICellRendererParams,
} from "ag-grid-community";
import { Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	employeeImageUrl,
	employeeStaffLabel,
} from "@/lib/employees-constants";
import { useTableTheme } from "@/hooks/use-table-theme";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

ModuleRegistry.registerModules([AllCommunityModule]);

type EmployeesTableProps = {
	employees: EmployeeItem[];
	onView: (emplCode: string) => void;
	filterModel: FilterModel | null;
	onFilterModelChange: (model: FilterModel | null) => void;
};

function StaffTypeRenderer(params: ICellRendererParams<EmployeeItem>) {
	const type = params.data?.staffType;
	if (!type) return null;
	const label = employeeStaffLabel(type);
	return (
		<span
			className={
				type === "S"
					? "inline-flex whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
					: "inline-flex whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium bg-warning/20 text-warning dark:bg-warning/90 dark:text-warning-foreground"
			}
		>
			{label}
		</span>
	);
}

function StatusRenderer(params: ICellRendererParams<EmployeeItem>) {
	const left = params.data?.leftDate;
	return (
		<span
			className={
				left
					? "inline-flex whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
					: "inline-flex whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
			}
		>
			{left ? "Left" : "Active"}
		</span>
	);
}

function PayrollRenderer(params: ICellRendererParams<EmployeeItem>) {
	const val = params.data?.onPayroll;
	if (!val) return <span className="text-muted-foreground text-sm">-</span>;
	return (
		<span
			className={
				val === "Y"
					? "text-sm font-medium text-green-700 dark:text-green-400"
					: "text-sm text-muted-foreground"
			}
		>
			{val === "Y" ? "Yes" : "No"}
		</span>
	);
}

function AvatarRenderer(params: ICellRendererParams<EmployeeItem>) {
	const data = params.data;
	if (!data) return null;
	const imageUrl = employeeImageUrl(data.picPath);
	return (
		<Avatar className="size-11">
			{imageUrl && <AvatarImage src={imageUrl} alt={data.name ?? ""} />}
			<AvatarFallback className="text-sm font-medium">
				{data.name?.[0]?.toUpperCase() ?? "?"}
			</AvatarFallback>
		</Avatar>
	);
}

export function EmployeesTable({
	employees,
	onView,
	filterModel,
	onFilterModelChange,
}: EmployeesTableProps) {
	const tableTheme = useTableTheme();
	const gridApiRef = useRef<GridApi | null>(null);

	const defaultColDef: ColDef<EmployeeItem> = {
		sortable: true,
		filter: true,
		floatingFilter: true,
		resizable: true,
		editable: true,
	};

	const columnDefs = useMemo<ColDef<EmployeeItem>[]>(
		() => [
			{
				headerName: "",
				field: "picPath",
				width: 64,
				sortable: false,
				filter: false,
				cellRenderer: AvatarRenderer,
			},
			{
				headerName: "Code",
				field: "emplCode",
				width: 120,
				cellClass: "font-mono text-sm",
				sortable: true,
				filter: true,
			},
			{
				headerName: "Name",
				field: "name",
				cellClass: "font-mono text-sm",
				flex: 1,
				minWidth: 200,
				sortable: true,
				filter: true,
				valueFormatter: (params) => params.value ?? "-",
			},
			{
				headerName: "Email",
				field: "email",
				cellClass: "font-mono text-sm",
				width: 280,
				sortable: true,
				filter: true,
				valueFormatter: (params) => params.value ?? "-",
			},
			{
				headerName: "Type",
				field: "staffType",
				width: 120,
				sortable: true,
				filter: true,
				cellRenderer: StaffTypeRenderer,
				valueGetter: (params) => {
					if (params.data?.staffType == "S") {
						return "Staff";
					}
					return "Worker";
				},
			},
			{
				headerName: "On Payroll",
				field: "onPayroll",
				width: 130,
				sortable: true,
				filter: true,
				cellRenderer: PayrollRenderer,
				valueGetter: (params) => {
					if (params.data?.onPayroll == "Y") {
						return "Yes";
					}
					return "No";
				},
			},
			{
				headerName: "Status",
				colId: "status",
				field: "leftDate",
				width: 120,
				sortable: true,
				filter: true,
				cellRenderer: StatusRenderer,
				valueGetter: (params) => {
					return params.data?.leftDate ? "Left" : "Active";
				},
			},
			{
				headerName: "Left Date",
				colId: "leftDate",
				field: "leftDate",
				width: 170,
				sortable: true,
				filter: true,
				cellClass: "font-mono text-sm",
				valueFormatter: (params) => {
					if (!params.value) return "-";
					try {
						return new Date(params.value).toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						});
					} catch {
						return params.value;
					}
				},
			},
			{
				headerName: "",
				field: "emplCode",
				width: 80,
				sortable: false,
				filter: false,
				cellRenderer: (params: ICellRendererParams<EmployeeItem>) => {
					if (!params.data) return null;
					return (
						<Button
							variant="ghost"
							size="icon-sm"
							title="View details"
							onClick={() => onView(params.data!.emplCode)}
						>
							<Eye />
						</Button>
					);
				},
			},
		],
		[onView],
	);

	useEffect(() => {
		const api = gridApiRef.current;
		if (!api) return;
		const current = api.getFilterModel();
		if (JSON.stringify(current) !== JSON.stringify(filterModel)) {
			api.setFilterModel(filterModel);
		}
	}, [filterModel]);

	return (
		<div
			className="ag-theme-alpine flex-1 min-h-0 rounded-none border"
			style={{ height: "100%" }}
		>
			<AgGridReact
				theme={tableTheme}
				rowData={employees}
				columnDefs={columnDefs}
				getRowId={(params) => params.data.emplCode}
				headerHeight={44}
				rowHeight={56}
				suppressRowHoverHighlight={false}
				defaultColDef={defaultColDef}
				onGridReady={(e) => {
					gridApiRef.current = e.api;
					if (filterModel && Object.keys(filterModel).length > 0) {
						e.api.setFilterModel(filterModel);
					}
				}}
				onFilterChanged={(e) => {
					const model = e.api.getFilterModel();
					onFilterModelChange(
						model && Object.keys(model).length > 0 ? model : null,
					);
				}}
			/>
		</div>
	);
}
