"use client";

import { useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	type ColDef,
	type GridApi,
	ModuleRegistry,
} from "ag-grid-community";
import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { AssetReportRow } from "@/server/routers/ITSM/reports";
import { trpc } from "@/trpc/react";

import { ExportButtons } from "./export-buttons";
import { exportRowsToPdf } from "./pdf-export";

ModuleRegistry.registerModules([AllCommunityModule]);

const STATUSES = ["In Use", "Available", "Defective"] as const;

export function AssetsReport() {
	const tableTheme = useTableTheme();
	const gridApi = useRef<GridApi | null>(null);

	const [status, setStatus] = useQueryState("status", {
		defaultValue: "In Use",
		history: "replace",
	});
	const [search, setSearch] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});

	const typesQuery = trpc.reports.assetTypes.useQuery();
	const availableTypes = typesQuery.data ?? [];
	const [typeSelection, setTypeSelection] = useState<string[] | null>(null);
	const activeTypes = typeSelection ?? [...availableTypes];
	const allSelected =
		activeTypes.length > 0 && activeTypes.length === availableTypes.length;
	const typesReady = availableTypes.length > 0;

	const reportQuery = trpc.reports.assets.useQuery(
		{
			status: status as (typeof STATUSES)[number],
			types: typesReady ? activeTypes : ["-"],
		},
		{ enabled: typesReady },
	);

	const rows = useMemo(() => {
		const data = reportQuery.data ?? [];
		const q = search.trim().toLowerCase();
		if (!q) {
			return data;
		}
		return data.filter((row) =>
			[
				row.code,
				row.type,
				row.deviceName,
				row.location,
				row.department,
				row.owner,
			]
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q)),
		);
	}, [reportQuery.data, search]);

	const columnDefs = useMemo<ColDef<AssetReportRow>[]>(
		() => [
			{
				headerName: "Code",
				field: "code",
				width: 120,
				cellClass: "font-mono text-xs",
			},
			{
				headerName: "Device Name",
				field: "deviceName",
				flex: 1.4,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Type",
				field: "type",
				width: 130,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Status",
				field: "status",
				width: 110,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Location",
				field: "location",
				width: 140,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Department",
				field: "department",
				width: 150,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Owner",
				field: "owner",
				width: 180,
				valueFormatter: (p) => p.value ?? "-",
			},
		],
		[],
	);

	const handleCsv = () => {
		gridApi.current?.exportDataAsCsv({
			fileName: `assets-report-${status.toLowerCase().replace(" ", "-")}`,
		});
	};

	const handlePdf = () => {
		exportRowsToPdf({
			fileName: `assets-report-${status.toLowerCase().replace(" ", "-")}`,
			title: `Assets Report — ${status}`,
			subtitle: `${rows.length} asset(s) · Generated ${new Date().toLocaleString("en-GB")}`,
			columns: [
				{ header: "Code", getValue: (row) => row.code, widthWeight: 1 },
				{
					header: "Device Name",
					getValue: (row) => row.deviceName ?? "-",
					widthWeight: 2,
				},
				{
					header: "Type",
					getValue: (row) => row.type ?? "-",
					widthWeight: 1.3,
				},
				{
					header: "Location",
					getValue: (row) => row.location ?? "-",
					widthWeight: 1.5,
				},
				{
					header: "Department",
					getValue: (row) => row.department ?? "-",
					widthWeight: 1.5,
				},
				{
					header: "Owner",
					getValue: (row) => row.owner ?? "-",
					widthWeight: 1.8,
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
						Assets Report
					</h1>
					<p className="text-xs text-muted-foreground">
						{reportQuery.isPending ? "…" : rows.length} asset(s)
					</p>
				</div>
				<ExportButtons
					onCsv={handleCsv}
					onPdf={handlePdf}
					disabled={rows.length === 0}
				/>
			</div>

			<div className="flex flex-col gap-3">
				<Input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Filter rows…"
					className="h-9 max-w-lg"
				/>

				<div className="flex flex-wrap items-center gap-4">
					<div className="flex gap-1.5" role="group" aria-label="Asset status">
						{STATUSES.map((value) => (
							<button
								key={value}
								type="button"
								aria-pressed={status === value}
								onClick={() => setStatus(value)}
								className={cn(
									"whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
									status === value
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{value}
							</button>
						))}
					</div>

					<div
						className="flex flex-wrap items-center gap-2"
						role="group"
						aria-label="Asset types"
					>
						<button
							type="button"
							className={cn(
								"rounded-none border px-2 py-1 text-xs font-medium transition-colors",
								allSelected
									? "border-primary bg-primary text-primary-foreground"
									: "bg-background text-muted-foreground hover:bg-muted",
							)}
							onClick={() => setTypeSelection(allSelected ? [] : null)}
						>
							All Types
						</button>
						{availableTypes.map((type) => (
							<label
								key={type}
								className="flex cursor-pointer items-center gap-1 text-xs"
							>
								<input
									type="checkbox"
									checked={activeTypes.includes(type)}
									onChange={() =>
										setTypeSelection(
											activeTypes.includes(type)
												? activeTypes.filter((t) => t !== type)
												: [...activeTypes, type],
										)
									}
									className="size-3.5"
								/>
								{type}
							</label>
						))}
					</div>
				</div>
			</div>

			{reportQuery.isPending || typesQuery.isPending ? (
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
							Try a different status or include more asset types.
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
				Back to Reports
			</Button>
		</div>
	);
}
