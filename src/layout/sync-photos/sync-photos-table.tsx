"use client";

import { useMemo } from "react";

import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);
import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	RefreshCw,
	User,
	XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTableTheme } from "@/hooks/use-table-theme";
import { SYNC_STATUS_LABELS, syncStatusBadgeClass } from "@/lib/sync-photos";
import { cn } from "@/lib/utils";
import type { SyncPhotoEmployee } from "@/server/routers/sync-photos";

type SyncPhotosTableProps = {
	rows: SyncPhotoEmployee[];
	syncingId: number | null;
	onSyncOne: (emp: SyncPhotoEmployee) => void;
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

function StatusRenderer({ value }: { value: SyncPhotoEmployee["syncStatus"] }) {
	const Icon = SYNC_STATUS_ICONS[value];
	return (
		<Badge
			variant="secondary"
			className={cn("gap-1", syncStatusBadgeClass(value))}
		>
			<Icon data-icon="inline-start" />
			{SYNC_STATUS_LABELS[value]}
		</Badge>
	);
}

type ActionRendererProps = {
	data: SyncPhotoEmployee;
	syncingId: number | null;
	onSyncOne: (emp: SyncPhotoEmployee) => void;
};

function ActionRenderer({ data, syncingId, onSyncOne }: ActionRendererProps) {
	if (!data.imageUrl) {
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
	rows,
	syncingId,
	onSyncOne,
}: SyncPhotosTableProps) {
	const tableTheme = useTableTheme();

	const columnDefs = useMemo<ColDef<SyncPhotoEmployee>[]>(
		() => [
			{
				headerName: "#",
				valueGetter: "node.rowIndex + 1",
				width: 50,
				sortable: false,
				filter: false,
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
				sortable: false,
				filter: false,
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
				sortable: false,
				filter: false,
				headerClass: "text-center",
				cellClass: "flex items-center justify-center",
				cellRenderer: ActionRenderer,
				cellRendererParams: { syncingId, onSyncOne },
			},
		],
		[syncingId, onSyncOne],
	);

	return (
		<div
			className="min-h-0 flex-1 rounded-none border"
			style={{ height: "100%" }}
		>
			<AgGridReact
				theme={tableTheme}
				rowData={rows}
				columnDefs={columnDefs}
				getRowId={(params) => String(params.data.id)}
				pagination
				paginationPageSize={30}
				headerHeight={36}
				rowHeight={42}
				enableCellTextSelection
				ensureDomOrder
			/>
		</div>
	);
}
