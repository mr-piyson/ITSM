"use client";

import { useMemo, useRef } from "react";
import { useQueryState } from "nuqs";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	type ColDef,
	type GridApi,
	ModuleRegistry,
} from "ag-grid-community";
import { ArrowLeft, Loader2, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useTableTheme } from "@/hooks/use-table-theme";
import type { PrinterReportRow } from "@/server/routers/ITSM/reports";
import { trpc } from "@/trpc/react";

import { ExportButtons } from "./export-buttons";
import { exportRowsToPdf } from "./pdf-export";

ModuleRegistry.registerModules([AllCommunityModule]);

function defaultFromDate(): string {
	const date = new Date();
	date.setMonth(date.getMonth() - 1);
	return date.toISOString().slice(0, 10);
}

function defaultToDate(): string {
	return new Date().toISOString().slice(0, 10);
}

export function PrintersReport() {
	const tableTheme = useTableTheme();
	const gridApi = useRef<GridApi | null>(null);

	const [fromDate, setFromDate] = useQueryState("from", {
		defaultValue: defaultFromDate(),
		history: "replace",
	});
	const [toDate, setToDate] = useQueryState("to", {
		defaultValue: defaultToDate(),
		history: "replace",
	});
	const [search, setSearch] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});

	const reportQuery = trpc.reports.printers.useQuery({ fromDate, toDate });

	const rows = useMemo(() => {
		const data = reportQuery.data ?? [];
		const q = search.trim().toLowerCase();
		if (!q) {
			return data;
		}
		return data.filter((row) =>
			[
				row.actionDate,
				row.printerName,
				row.printerLocation,
				row.actionType,
				row.itemName,
				row.actionBy,
			]
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q)),
		);
	}, [reportQuery.data, search]);

	const columnDefs = useMemo<ColDef<PrinterReportRow>[]>(
		() => [
			{
				headerName: "Date",
				field: "actionDate",
				width: 120,
				cellClass: "font-mono text-xs",
			},
			{
				headerName: "Printer",
				valueGetter: (params) =>
					params.data
						? `${params.data.printerName ?? "-"} (${params.data.printerLocation ?? "-"})`
						: "",
				flex: 1.5,
			},
			{ headerName: "Action", field: "actionType", width: 130 },
			{
				headerName: "Toner / Roll",
				field: "itemName",
				flex: 1.3,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Current Stock",
				field: "itemStock",
				width: 130,
				cellClass: (params) =>
					params.value > 0 ? "" : "text-red-600 dark:text-red-400",
			},
			{
				headerName: "Action By",
				field: "actionBy",
				width: 160,
				valueFormatter: (p) => p.value ?? "-",
			},
		],
		[],
	);

	const handleCsv = () => {
		gridApi.current?.exportDataAsCsv({
			fileName: `printers-report-${fromDate}_${toDate}`,
		});
	};

	const handlePdf = () => {
		exportRowsToPdf({
			fileName: `printers-report-${fromDate}_${toDate}`,
			title: "Printers Report",
			subtitle: `${fromDate} → ${toDate} · ${rows.length} action(s) · Generated ${new Date().toLocaleString("en-GB")}`,
			columns: [
				{
					header: "Date",
					getValue: (row) => row.actionDate ?? "-",
					widthWeight: 1,
				},
				{
					header: "Printer",
					getValue: (row) =>
						`${row.printerName ?? "-"} (${row.printerLocation ?? "-"})`,
					widthWeight: 2.2,
				},
				{
					header: "Action",
					getValue: (row) => row.actionType ?? "-",
					widthWeight: 1,
				},
				{
					header: "Toner / Roll",
					getValue: (row) => row.itemName ?? "-",
					widthWeight: 2,
				},
				{
					header: "Current Stock",
					getValue: (row) => String(row.itemStock ?? "-"),
					widthWeight: 1,
				},
				{
					header: "Action By",
					getValue: (row) => row.actionBy ?? "-",
					widthWeight: 1.4,
				},
			],
			rows,
		});
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						Printers Report
					</h1>
					<p className="text-xs text-muted-foreground">
						Toner and maintenance actions (
						{reportQuery.isPending ? "…" : rows.length})
					</p>
				</div>
				<ExportButtons
					onCsv={handleCsv}
					onPdf={handlePdf}
					disabled={rows.length === 0}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<label className="flex items-center gap-2 text-xs">
					<span className="text-muted-foreground">From</span>
					<Input
						type="date"
						value={fromDate}
						max={toDate}
						onChange={(e) => setFromDate(e.target.value)}
						className="h-9 w-40"
					/>
				</label>
				<label className="flex items-center gap-2 text-xs">
					<span className="text-muted-foreground">To</span>
					<Input
						type="date"
						value={toDate}
						min={fromDate}
						onChange={(e) => setToDate(e.target.value)}
						className="h-9 w-40"
					/>
				</label>
				<Input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Filter rows…"
					className="h-9 max-w-xs"
				/>
			</div>

			{reportQuery.isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : rows.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchX />
						</EmptyMedia>
						<EmptyTitle>No results</EmptyTitle>
						<EmptyDescription>
							No printer actions were recorded in this period.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div
					className="ag-theme-alpine min-h-0 flex-1 rounded-none border"
					style={{ height: "100%" }}
				>
					<AgGridReact
						theme={tableTheme}
						ref={(instance) => {
							gridApi.current = instance?.api ?? null;
						}}
						rowData={rows}
						columnDefs={columnDefs}
						getRowId={(params) => String(params.data.id)}
						pagination
						paginationPageSize={50}
						headerHeight={36}
						rowHeight={38}
					/>
				</div>
			)}

			<Button
				variant="outline"
				size="sm"
				render={<Link href="/app/reports" />}
				nativeButton={false}
			>
				<ArrowLeft data-icon="inline-start" />
				Back to Reports
			</Button>
		</div>
	);
}
