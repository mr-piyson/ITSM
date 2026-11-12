"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ModuleRegistry,
	type CellKeyDownEvent,
	type ColDef,
	type FilterModel,
	type GridApi,
	type ICellRendererParams,
	type RowClickedEvent,
} from "ag-grid-community";
import { Eye } from "lucide-react";

import { EmployeeAvatar } from "@/components/employee-avatar";
import { Button } from "@/components/ui/button";
import { useTableTheme } from "@/hooks/use-table-theme";
import { useAzureSummariesContext } from "@/hooks/use-azure-summaries";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

import {
	EmploymentStatusPill,
	Pill,
	StaffTypePill,
	formatDate,
} from "./employee-badges";

ModuleRegistry.registerModules([AllCommunityModule]);

type EmployeesTableProps = {
	employees: EmployeeItem[];
	onView: (emplCode: string) => void;
	filterModel: FilterModel | null;
	onFilterModelChange: (model: FilterModel | null) => void;
};

type CellParams = ICellRendererParams<EmployeeItem>;

const MONO = "font-mono text-sm";

function StaffTypeRenderer({ data }: CellParams) {
	return <StaffTypePill type={data?.staffType} />;
}

function StatusRenderer({ data }: CellParams) {
	if (!data) return null;
	return <EmploymentStatusPill leftDate={data.leftDate} />;
}

function PayrollRenderer({ data }: CellParams) {
	const val = data?.onPayroll;
	if (!val) return <span className="text-sm text-muted-foreground">-</span>;
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

function AvatarRenderer({ data }: CellParams) {
	if (!data) return null;
	return (
		<div className="flex h-full w-full items-center justify-center">
			<EmployeeAvatar
				image={data.picPath}
				name={data.name}
				code={data.emplCode}
				className="size-11"
				fallbackClassName="text-sm font-medium"
				fallback={data.name?.[0]?.toUpperCase() ?? "?"}
			/>
		</div>
	);
}

function useRowAccess(email: string | null) {
	const { map, register } = useAzureSummariesContext();
	useEffect(() => {
		if (email) register(email);
	}, [email, register]);
	return email ? map[email] : undefined;
}

function Loading() {
	return (
		<span
			className="inline-block h-5 w-20 animate-pulse rounded-none bg-muted"
			aria-label="Loading"
		/>
	);
}

function LicenseRenderer({ data }: CellParams) {
	const email = data?.email ?? null;
	const summary = useRowAccess(email);
	if (!email) return <span className="text-sm text-muted-foreground">-</span>;
	if (!summary) return <Loading />;
	return summary.licenseTypes.length ? (
		<Pill tone="blue">{summary.licenseTypes.join(", ")}</Pill>
	) : (
		<Pill tone="muted">No license</Pill>
	);
}

function EmailActiveRenderer({ data }: CellParams) {
	const email = data?.email ?? null;
	const summary = useRowAccess(email);
	if (!email) return <span className="text-sm text-muted-foreground">-</span>;
	if (!summary) return <Loading />;
	if (summary.emailActive === null) return <Pill tone="muted">Unknown</Pill>;
	return summary.emailActive ? (
		<Pill tone="green">Active</Pill>
	) : (
		<Pill tone="red">Inactive</Pill>
	);
}

// Static config lives outside the component so AG Grid gets stable references.
const DEFAULT_COL_DEF: ColDef<EmployeeItem> = {
	sortable: true,
	filter: true,
	floatingFilter: false,
	resizable: true,
	suppressHeaderMenuButton: true,
};

const NO_FILTER = { sortable: false, filter: false, floatingFilter: false };

export function EmployeesTable({
	employees,
	onView,
	filterModel,
	onFilterModelChange,
}: EmployeesTableProps) {
	const tableTheme = useTableTheme();
	const gridApiRef = useRef<GridApi | null>(null);
	const filterModelRef = useRef(filterModel);
	filterModelRef.current = filterModel;

	const ActionsRenderer = useCallback(
		({ data }: CellParams) => {
			if (!data) return null;
			return (
				<div className="flex h-full w-full items-center justify-center">
					<Button
						variant="outline"
						size="icon-sm"
						title="View details"
						aria-label={`View ${data.name ?? data.emplCode}`}
						onClick={() => onView(data.emplCode)}
					>
						<Eye />
					</Button>
				</div>
			);
		},
		[onView],
	);

	const columnDefs = useMemo<ColDef<EmployeeItem>[]>(
		() => [
			{
				headerName: "",
				colId: "actions",
				width: 72,
				pinned: "left",
				lockPinned: true,
				suppressMovable: true,
				...NO_FILTER,
				cellRenderer: ActionsRenderer,
			},
			{
				headerName: "",
				colId: "avatar",
				field: "picPath",
				width: 64,
				...NO_FILTER,
				cellRenderer: AvatarRenderer,
			},
			{
				headerName: "Code",
				field: "emplCode",
				width: 120,
				cellClass: MONO,
			},
			{
				headerName: "Name",
				field: "name",
				cellClass: `${MONO} font-medium`,
				flex: 1,
				minWidth: 200,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Email",
				field: "email",
				cellClass: MONO,
				width: 280,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "License",
				colId: "licenseType",
				width: 200,
				...NO_FILTER,
				cellRenderer: LicenseRenderer,
			},
			{
				headerName: "Email Active",
				colId: "emailActive",
				width: 140,
				...NO_FILTER,
				cellRenderer: EmailActiveRenderer,
			},
			{
				headerName: "Type",
				field: "staffType",
				width: 130,
				cellRenderer: StaffTypeRenderer,
				valueGetter: (p) => (p.data?.staffType === "S" ? "Staff" : "Worker"),
			},
			{
				headerName: "On Payroll",
				field: "onPayroll",
				width: 130,
				cellRenderer: PayrollRenderer,
				valueGetter: (p) => (p.data?.onPayroll === "Y" ? "Yes" : "No"),
			},
			{
				headerName: "Status",
				colId: "status",
				field: "leftDate",
				width: 120,
				cellRenderer: StatusRenderer,
				valueGetter: (p) => (p.data?.leftDate ? "Left" : "Active"),
			},
			{
				headerName: "Left Date",
				colId: "leftDate",
				field: "leftDate",
				width: 150,
				cellClass: MONO,
				valueFormatter: (p) => formatDate(p.value),
			},
		],
		[ActionsRenderer],
	);

	// Keep the grid in sync when the URL-driven filter model changes externally
	// (e.g. "Clear filters" in the page toolbar).
	useEffect(() => {
		const api = gridApiRef.current;
		if (!api) return;
		const current = api.getFilterModel();
		if (
			JSON.stringify(current ?? null) !== JSON.stringify(filterModel ?? null)
		) {
			api.setFilterModel(filterModel);
		}
	}, [filterModel]);

	const handleRowClicked = useCallback(
		(e: RowClickedEvent<EmployeeItem>) => {
			const target = e.event?.target as HTMLElement | null;
			// Ignore clicks on buttons and while the user is selecting text.
			if (target?.closest("button, a, input")) return;
			if (window.getSelection()?.toString()) return;
			if (e.data) onView(e.data.emplCode);
		},
		[onView],
	);

	const handleCellKeyDown = useCallback(
		(e: CellKeyDownEvent<EmployeeItem>) => {
			const key = (e.event as KeyboardEvent | null)?.key;
			if (key === "Enter" && e.data) onView(e.data.emplCode);
		},
		[onView],
	);

	return (
		<div className="ag-theme-alpine min-h-0 flex-1 rounded-none border">
			<AgGridReact<EmployeeItem>
				theme={tableTheme}
				rowData={employees}
				columnDefs={columnDefs}
				defaultColDef={DEFAULT_COL_DEF}
				getRowId={(p) => p.data.emplCode}
				getRowClass={(p) =>
					p.data?.leftDate ? "cursor-pointer opacity-60" : "cursor-pointer"
				}
				rowHeight={56}
				animateRows={false}
				enableCellTextSelection
				ensureDomOrder
				suppressCellFocus={false}
				onRowClicked={handleRowClicked}
				onCellKeyDown={handleCellKeyDown}
				onGridReady={(e) => {
					gridApiRef.current = e.api;
					const fm = filterModelRef.current;
					if (fm && Object.keys(fm).length > 0) e.api.setFilterModel(fm);
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
