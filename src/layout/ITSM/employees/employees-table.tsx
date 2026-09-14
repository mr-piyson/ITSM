"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
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
					: "inline-flex whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium bg-muted text-muted-foreground"
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

export function EmployeesTable({ employees, onView }: EmployeesTableProps) {
	const tableTheme = useTableTheme();

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
				flex: 1,
				minWidth: 200,
				sortable: true,
				filter: true,
				valueFormatter: (params) => params.value ?? "-",
			},
			{
				headerName: "Email",
				field: "email",
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
			},
			{
				headerName: "On Payroll",
				field: "onPayroll",
				width: 130,
				sortable: true,
				filter: true,
				cellRenderer: PayrollRenderer,
			},
			{
				headerName: "Status",
				field: "leftDate",
				width: 120,
				sortable: true,
				filter: true,
				cellRenderer: StatusRenderer,
			},
			{
				headerName: "Created On",
				field: "createdOn",
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
				headerName: "Left Date",
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
				defaultColDef={{
					resizable: true,
				}}
			/>
		</div>
	);
}
