"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
	type GridApi,
	type GridReadyEvent,
	type IDatasource,
	type PaginationChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	RefreshCw,
	User,
	XCircle,
} from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTableTheme } from "@/hooks/use-table-theme";
import { SYNC_STATUS_LABELS, syncStatusBadgeClass } from "@/lib/sync-photos";
import { cn } from "@/lib/utils";
import type { SyncPhotoEmployee } from "@/server/routers/ITSM/sync-photos";

type SyncPhotosTableProps = {
	datasource: IDatasource;
	pageSize: number;
	page: number;
	loading: boolean;
	syncingId: number | null;
	onSyncOne: (emp: SyncPhotoEmployee) => void;
	onPageChange: (page: number) => void;
	onReady: (api: GridApi<SyncPhotoEmployee>) => void;
};

const SYNC_STATUS_ICONS: Record<
	SyncPhotoEmployee["syncStatus"],
	typeof CheckCircle2
> = {
	synced: CheckCircle2,
	different: AlertTriangle,
	not_in_oracle: XCircle,
	no_photo: XCircle,
};

function PhotoRenderer({ value }: { value: string | null }) {
	return (
		<Avatar className="size-8">
			<AvatarImage src={value ? value : undefined} alt="" />
			<AvatarFallback>
				<User className="size-4" />
			</AvatarFallback>
		</Avatar>
	);
}

function UrlRenderer({ value }: { value: string | null }) {
	if (!value) {
		return <span className="text-xs text-muted-foreground">Not set</span>;
	}
	return (
		<span
			className="max-w-[200px] truncate font-mono text-xs text-muted-foreground"
			title={value}
		>
			{value}
		</span>
	);
}

function StatusRenderer({
	value,
}: {
	value?: SyncPhotoEmployee["syncStatus"] | null;
}) {
	const status = value ?? "no_photo";
	const Icon = SYNC_STATUS_ICONS[status];
	return (
		<Badge
			variant="secondary"
			className={cn("gap-1", syncStatusBadgeClass(status))}
		>
			<Icon data-icon="inline-start" />
			{SYNC_STATUS_LABELS[status]}
		</Badge>
	);
}

type ActionRendererProps = {
	data?: SyncPhotoEmployee;
	syncingId: number | null;
	onSyncOne: (emp: SyncPhotoEmployee) => void;
};

function ActionRenderer({ data, syncingId, onSyncOne }: ActionRendererProps) {
	if (!data?.imageUrl) {
		return null;
	}
	const isSyncing = syncingId === data.id;
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			disabled={isSyncing}
			onClick={() => onSyncOne(data)}
			title="Sync to Oracle"
		>
			{isSyncing ? (
				<Loader2 className="animate-spin" data-icon="inline-start" />
			) : (
				<RefreshCw data-icon="inline-start" />
			)}
		</Button>
	);
}

export function SyncPhotosTable({
	datasource,
	pageSize,
	page,
	loading,
	syncingId,
	onSyncOne,
	onPageChange,
	onReady,
}: SyncPhotosTableProps) {
	const tableTheme = useTableTheme();
	const gridApiRef = useRef<GridApi<SyncPhotoEmployee> | null>(null);

	const columnDefs = useMemo<ColDef<SyncPhotoEmployee>[]>(
		() => [
			{
				headerName: "#",
				valueGetter: "node.rowIndex + 1",
				width: 50,
				cellClass: "text-muted-foreground text-xs",
			},
			{
				headerName: "Emp Code",
				field: "empCode",
				width: 100,
				cellClass: "font-mono text-xs font-medium",
			},
			{
				headerName: "Name",
				field: "name",
				flex: 1.2,
				minWidth: 150,
			},
			{
				headerName: "Department",
				field: "department",
				flex: 1,
				minWidth: 120,
				valueFormatter: (p) => p.value || "-",
			},
			{
				headerName: "Photo",
				field: "imageUrl",
				width: 60,
				cellRenderer: PhotoRenderer,
				headerClass: "text-center",
				cellClass: "flex items-center justify-center",
			},
			{
				headerName: "MES URL",
				field: "imageUrl",
				flex: 1.5,
				minWidth: 200,
				cellRenderer: UrlRenderer,
			},
			{
				headerName: "Oracle Path",
				field: "oraclePicPath",
				flex: 1.5,
				minWidth: 200,
				cellRenderer: UrlRenderer,
			},
			{
				headerName: "Status",
				field: "syncStatus",
				width: 130,
				cellRenderer: StatusRenderer,
				headerClass: "text-center",
				cellClass: "flex items-center",
			},
			{
				headerName: "Action",
				field: "id",
				width: 80,
				headerClass: "text-center",
				cellClass: "flex items-center justify-center",
				cellRenderer: ActionRenderer,
				cellRendererParams: { syncingId, onSyncOne },
			},
		],
		[syncingId, onSyncOne],
	);

	const handleGridReady = useCallback(
		(event: GridReadyEvent<SyncPhotoEmployee>) => {
			gridApiRef.current = event.api;
			onReady(event.api);
		},
		[onReady],
	);

	const handlePaginationChanged = useCallback(
		(event: PaginationChangedEvent<SyncPhotoEmployee>) => {
			if (!event.newPage) {
				return;
			}
			onPageChange(event.api.paginationGetCurrentPage());
		},
		[onPageChange],
	);

	useEffect(() => {
		const api = gridApiRef.current;
		if (!api) {
			return;
		}
		api.setGridOption("loading", true);
		api.setGridOption("datasource", datasource);
	}, [datasource]);

	useEffect(() => {
		gridApiRef.current?.setGridOption("loading", loading);
	}, [loading]);

	useEffect(() => {
		const api = gridApiRef.current;
		if (!api) {
			return;
		}
		const current = api.paginationGetCurrentPage();
		if (current !== page) {
			api.paginationGoToPage(page);
		}
	}, [page]);

	return (
		<div
			className="min-h-0 flex-1 rounded-none border"
			style={{ height: "100%" }}
		>
			<AgGridReact
				theme={tableTheme}
				columnDefs={columnDefs}
				rowModelType="infinite"
				datasource={datasource}
				loading={loading}
				getRowId={(params) => String(params.data.id)}
				defaultColDef={{ sortable: false }}
				pagination
				paginationPageSize={pageSize}
				cacheBlockSize={pageSize}
				headerHeight={36}
				rowHeight={42}
				enableCellTextSelection
				ensureDomOrder
				onGridReady={handleGridReady}
				onPaginationChanged={handlePaginationChanged}
			/>
		</div>
	);
}
