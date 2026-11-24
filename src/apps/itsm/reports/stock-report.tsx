"use client";

import { useMemo, useRef } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
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
import { cn } from "@/lib/utils";
import type {
	StockProvideRow,
	StockPurchaseRow,
} from "@/server/routers/ITSM/reports";
import { trpc } from "@/trpc/react";

import { ExportButtons } from "./export-buttons";
import { exportRowsToPdf } from "./pdf-export";

ModuleRegistry.registerModules([AllCommunityModule]);

type Section = "all" | "purchase" | "provide";
type PurchaseType = "all" | "items" | "service";

const SECTIONS: { value: Section; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "purchase", label: "Purchase" },
	{ value: "provide", label: "Provide" },
];

const PURCHASE_TYPES: { value: PurchaseType; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "items", label: "Items" },
	{ value: "service", label: "Services" },
];

const SECTION_VALUES: Section[] = ["all", "purchase", "provide"];
const PURCHASE_TYPE_VALUES: PurchaseType[] = ["all", "items", "service"];

function defaultFromDate(): string {
	const date = new Date();
	date.setMonth(date.getMonth() - 1);
	return date.toISOString().slice(0, 10);
}

export function StockReport() {
	const tableTheme = useTableTheme();
	const purchaseGridApi = useRef<GridApi | null>(null);
	const provideGridApi = useRef<GridApi | null>(null);

	const [fromDate, setFromDate] = useQueryState("from", {
		defaultValue: defaultFromDate(),
		history: "replace",
	});
	const [toDate, setToDate] = useQueryState("to", {
		defaultValue: new Date().toISOString().slice(0, 10),
		history: "replace",
	});
	const [section, setSection] = useQueryState(
		"section",
		parseAsStringLiteral(SECTION_VALUES)
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [purchaseType, setPurchaseType] = useQueryState(
		"poType",
		parseAsStringLiteral(PURCHASE_TYPE_VALUES)
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [search, setSearch] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});

	const reportQuery = trpc.reports.stock.useQuery({
		fromDate,
		toDate,
		section,
		purchaseType,
	});

	const showPurchases = section !== "provide";
	const showProvides = section !== "purchase";

	const purchases = useMemo(() => {
		const data = reportQuery.data?.purchases ?? [];
		const q = search.trim().toLowerCase();
		if (!q) {
			return data;
		}
		return data.filter((row) =>
			[
				row.poType,
				row.poNumber,
				row.date,
				row.vendorName,
				row.lineItems,
				row.grandTotal,
				row.currency,
				row.forWho,
			]
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q)),
		);
	}, [reportQuery.data, search]);

	const provides = useMemo(() => {
		const data = reportQuery.data?.provides ?? [];
		const q = search.trim().toLowerCase();
		if (!q) {
			return data;
		}
		return data.filter((row) =>
			[
				row.date,
				row.employeeName,
				row.requestedByName,
				row.receivedByName,
				row.providedBy,
				row.lineItems,
				row.notes,
			]
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q)),
		);
	}, [reportQuery.data, search]);

	const purchaseColumns = useMemo<ColDef<StockPurchaseRow>[]>(
		() => [
			{ headerName: "PO Type", field: "poType", width: 110 },
			{
				headerName: "PO Number",
				field: "poNumber",
				width: 110,
				cellClass: "font-mono text-xs",
			},
			{
				headerName: "Date",
				field: "date",
				width: 120,
				valueFormatter: (p) => p.value?.slice(0, 10) ?? "-",
				cellClass: "font-mono text-xs",
			},
			{ headerName: "Vendor", field: "vendorName", width: 170 },
			{
				headerName: "Items / Services",
				field: "lineItems",
				flex: 2,
				autoHeight: true,
				cellClass: "whitespace-pre-line leading-4",
			},
			{
				headerName: "Qty",
				field: "quantities",
				width: 70,
				autoHeight: true,
				cellClass: "whitespace-pre-line leading-4 text-right font-mono text-xs",
			},
			{
				headerName: "Price",
				field: "prices",
				width: 100,
				autoHeight: true,
				cellClass: "whitespace-pre-line leading-4 font-mono text-xs",
			},
			{
				headerName: "Grand Total",
				field: "grandTotal",
				width: 120,
				cellClass: "font-mono text-xs",
			},
			{ headerName: "Currency", field: "currency", width: 95 },
			{
				headerName: "Paid",
				field: "paid",
				width: 90,
				cellRenderer: (params: { value: boolean }) =>
					params.value ? (
						<span className="bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
							Yes
						</span>
					) : (
						<span className="bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/60 dark:text-red-200">
							No
						</span>
					),
			},
			{
				headerName: "For",
				field: "forWho",
				flex: 1.2,
				valueFormatter: (p) => p.value ?? "-",
			},
		],
		[],
	);

	const provideColumns = useMemo<ColDef<StockProvideRow>[]>(
		() => [
			{
				headerName: "Date",
				field: "date",
				width: 120,
				valueFormatter: (p) => p.value?.slice(0, 10) ?? "-",
				cellClass: "font-mono text-xs",
			},
			{ headerName: "Employee", field: "employeeName", width: 160 },
			{
				headerName: "Requested By",
				field: "requestedByName",
				width: 150,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Received By",
				field: "receivedByName",
				width: 150,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Provided By",
				field: "providedBy",
				width: 140,
				valueFormatter: (p) => p.value ?? "-",
			},
			{
				headerName: "Items",
				field: "lineItems",
				flex: 2,
				autoHeight: true,
				cellClass: "whitespace-pre-line leading-4",
			},
			{
				headerName: "Qty",
				field: "quantities",
				width: 70,
				autoHeight: true,
				cellClass: "whitespace-pre-line leading-4 text-right font-mono text-xs",
			},
			{
				headerName: "Notes",
				field: "notes",
				flex: 1,
				valueFormatter: (p) => p.value ?? "-",
			},
		],
		[],
	);

	const purchaseColumnsToPdf = [
		{ header: "PO Type", getValue: (row: StockPurchaseRow) => row.poType },
		{
			header: "PO #",
			getValue: (row: StockPurchaseRow) => String(row.poNumber),
			widthWeight: 0.8,
		},
		{
			header: "Date",
			getValue: (row: StockPurchaseRow) => row.date?.slice(0, 10) ?? "-",
			widthWeight: 1,
		},
		{
			header: "Vendor",
			getValue: (row: StockPurchaseRow) => row.vendorName ?? "-",
			widthWeight: 1.6,
		},
		{
			header: "Items / Services",
			getValue: (row: StockPurchaseRow) => row.lineItems.replace(/\n/g, "; "),
			widthWeight: 3,
		},
		{
			header: "Total",
			getValue: (row: StockPurchaseRow) =>
				`${row.grandTotal ?? "-"} ${row.currency}`,
			widthWeight: 1.1,
		},
		{
			header: "Paid",
			getValue: (row: StockPurchaseRow) => (row.paid ? "Yes" : "No"),
			widthWeight: 0.7,
		},
		{
			header: "For",
			getValue: (row: StockPurchaseRow) => row.forWho ?? "-",
			widthWeight: 1.6,
		},
	];

	const provideColumnsToPdf = [
		{
			header: "Date",
			getValue: (row: StockProvideRow) => row.date?.slice(0, 10) ?? "-",
		},
		{
			header: "Employee",
			getValue: (row: StockProvideRow) => row.employeeName ?? "-",
			widthWeight: 1.6,
		},
		{
			header: "Requested By",
			getValue: (row: StockProvideRow) => row.requestedByName ?? "-",
			widthWeight: 1.5,
		},
		{
			header: "Received By",
			getValue: (row: StockProvideRow) => row.receivedByName ?? "-",
			widthWeight: 1.5,
		},
		{
			header: "Items",
			getValue: (row: StockProvideRow) => row.lineItems.replace(/\n/g, "; "),
			widthWeight: 3,
		},
		{
			header: "Notes",
			getValue: (row: StockProvideRow) => row.notes ?? "-",
			widthWeight: 1.6,
		},
	];

	const handleCsv = () => {
		if (showPurchases && purchases.length > 0) {
			purchaseGridApi.current?.exportDataAsCsv({
				fileName: `stock-report-purchases-${fromDate}_${toDate}`,
			});
		}
		if (showProvides && provides.length > 0) {
			provideGridApi.current?.exportDataAsCsv({
				fileName: `stock-report-provide-${fromDate}_${toDate}`,
			});
		}
	};

	const handlePdf = () => {
		if (section === "provide") {
			exportRowsToPdf({
				fileName: `stock-report-${fromDate}_${toDate}`,
				title: "Stock Report",
				subtitle: `${fromDate} → ${toDate} · Generated ${new Date().toLocaleString("en-GB")}`,
				columns: provideColumnsToPdf,
				rows: provides,
			});
			return;
		}
		exportRowsToPdf({
			fileName: `stock-report-${fromDate}_${toDate}`,
			title: "Stock Report",
			subtitle: `${fromDate} → ${toDate} · Total Quantity ${reportQuery.data?.totalQuantity ?? 0} · Total Amount ${reportQuery.data?.totalAmountBHD ?? 0} BHD · Generated ${new Date().toLocaleString("en-GB")}`,
			columns: purchaseColumnsToPdf,
			rows: purchases,
		});
	};

	const hasAnyRows =
		(showPurchases && purchases.length > 0) ||
		(showProvides && provides.length > 0);

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">Stock Report</h1>
					<p className="text-xs text-muted-foreground">
						Purchases and provided items ·{" "}
						{reportQuery.isPending
							? "…"
							: `${purchases.length} PO(s), ${provides.length} provide(s)`}
					</p>
				</div>
				<ExportButtons
					onCsv={handleCsv}
					onPdf={handlePdf}
					disabled={!hasAnyRows}
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
				<div className="flex gap-1.5" role="group" aria-label="Section">
					{SECTIONS.map(({ value, label }) => (
						<button
							key={value}
							type="button"
							aria-pressed={section === value}
							onClick={() => setSection(value)}
							className={cn(
								"whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
								section === value
									? "border-primary bg-primary text-primary-foreground"
									: "bg-background text-muted-foreground hover:bg-muted",
							)}
						>
							{label}
						</button>
					))}
				</div>
				{section !== "provide" && (
					<div className="flex gap-1.5" role="group" aria-label="Purchase type">
						{PURCHASE_TYPES.map(({ value, label }) => (
							<button
								key={value}
								type="button"
								aria-pressed={purchaseType === value}
								onClick={() => setPurchaseType(value)}
								className={cn(
									"whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
									purchaseType === value
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{label}
							</button>
						))}
					</div>
				)}
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
			) : !hasAnyRows ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchX />
						</EmptyMedia>
						<EmptyTitle>No results</EmptyTitle>
						<EmptyDescription>
							No purchases or provided items were found in this period.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
					{showPurchases && purchases.length > 0 && (
						<section className="flex min-h-[320px] flex-col">
							<h2 className="pb-2 text-sm font-semibold">Purchases</h2>
							<div
								className="ag-theme-alpine min-h-[300px] rounded-none border"
								style={{ height: "420px" }}
							>
								<AgGridReact
									theme={tableTheme}
									ref={(instance) => {
										purchaseGridApi.current = instance?.api ?? null;
									}}
									rowData={purchases}
									columnDefs={purchaseColumns}
									getRowId={(params) => String(params.data.id)}
									pagination
									paginationPageSize={25}
									headerHeight={36}
									rowHeight={44}
								/>
							</div>
						</section>
					)}

					{showProvides && provides.length > 0 && (
						<section className="flex min-h-[320px] flex-col">
							<h2 className="pb-2 text-sm font-semibold">Provide</h2>
							<div
								className="ag-theme-alpine min-h-[300px] rounded-none border"
								style={{ height: "420px" }}
							>
								<AgGridReact
									theme={tableTheme}
									ref={(instance) => {
										provideGridApi.current = instance?.api ?? null;
									}}
									rowData={provides}
									columnDefs={provideColumns}
									getRowId={(params) => String(params.data.id)}
									pagination
									paginationPageSize={25}
									headerHeight={36}
									rowHeight={44}
								/>
							</div>
						</section>
					)}

					{(showPurchases || showProvides) && (
						<p className="text-xs text-muted-foreground">
							Total Quantity: <b>{reportQuery.data?.totalQuantity ?? 0}</b> ·
							Total Amount: <b>{reportQuery.data?.totalAmountBHD ?? 0} BHD</b>{" "}
							(USD/EUR converted)
						</p>
					)}
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
