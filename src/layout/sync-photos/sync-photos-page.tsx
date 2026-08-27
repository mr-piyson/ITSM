"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	type ColDef,
	type GridApi,
	ModuleRegistry,
} from "ag-grid-community";
import {
	AlertTriangle,
	Camera,
	CheckCircle2,
	Loader2,
	RefreshCw,
	User,
	XCircle,
} from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTableTheme } from "@/hooks/use-table-theme";
import type { SyncPhotoEmployee } from "@/server/routers/sync-photos";
import { trpc } from "@/trpc/react";
import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

const STATUS_CONFIG: Record<
	string,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
		color: string;
		icon: typeof CheckCircle2;
	}
> = {
	synced: {
		label: "Synced",
		variant: "default",
		color: "green",
		icon: CheckCircle2,
	},
	different: {
		label: "Different",
		variant: "outline",
		color: "yellow",
		icon: AlertTriangle,
	},
	not_in_oracle: {
		label: "Not in Oracle",
		variant: "secondary",
		color: "red",
		icon: XCircle,
	},
	no_photo: {
		label: "No Photo",
		variant: "secondary",
		color: "gray",
		icon: XCircle,
	},
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

function StatusRenderer({ value }: { value: string }) {
	const config = STATUS_CONFIG[value] ?? STATUS_CONFIG.no_photo;
	const Icon = config.icon;
	const colorClass = `bg-${config.color}-500/10 text-${config.color}-700 dark:bg-${config.color}-500/20 dark:text-${config.color}-400`;
	return (
		<Badge variant={config.variant} className={cn("gap-1", colorClass)}>
			<Icon data-icon="inline-start" />
			{config.label}
		</Badge>
	);
}

export function SyncPhotosPage() {
	const tableTheme = useTableTheme();
	const gridApi = useRef<GridApi | null>(null);
	const [syncAllOpen, setSyncAllOpen] = useState(false);
	const [syncingId, setSyncingId] = useState<number | null>(null);

	const [search, setSearch] = useState("");

	const employeesQuery = trpc.syncPhotos.list.useQuery({ q: search });
	const syncOneMutation = trpc.syncPhotos.syncOne.useMutation();
	const syncAllMutation = trpc.syncPhotos.syncAll.useMutation();
	const utils = trpc.useUtils();

	const rows = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);

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
				valueFormatter: (p) => p.value ?? "-",
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
				cellRenderer: (params: { value: number; data: SyncPhotoEmployee }) => {
					const emp = params.data;
					if (!emp.imageUrl) return null;
					const isSyncing = syncingId === emp.id;
					return (
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={isSyncing}
							onClick={() => handleSyncOne(emp)}
							title="Sync to Oracle"
						>
							{isSyncing ? (
								<Loader2 className="animate-spin" data-icon="inline-start" />
							) : (
								<RefreshCw data-icon="inline-start" />
							)}
						</Button>
					);
				},
			},
		],
		[syncingId],
	);

	const handleSyncOne = useCallback(
		async (emp: SyncPhotoEmployee) => {
			setSyncingId(emp.id);
			try {
				const result = await syncOneMutation.mutateAsync({
					empCode: emp.empCode,
					imageUrl: emp.imageUrl,
				});
				if (result.success) {
					toast.success(result.message);
					await utils.syncPhotos.list.invalidate();
				} else {
					toast.error(result.message);
				}
			} catch {
				toast.error("Sync request failed");
			} finally {
				setSyncingId(null);
			}
		},
		[syncOneMutation, utils],
	);

	const handleSyncAll = useCallback(async () => {
		setSyncAllOpen(false);
		try {
			await syncAllMutation.mutateAsync();
			await utils.syncPhotos.list.invalidate();
		} finally {
			// done
		}
	}, [syncAllMutation, utils]);

	const handleSearch = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			employeesQuery.refetch();
		},
		[employeesQuery],
	);

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						Employee Photo Sync
					</h1>
					<p className="text-xs text-muted-foreground">
						{employeesQuery.isPending ? "…" : rows.length} employee(s)
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSyncAllOpen(true)}
					disabled={syncAllMutation.isPending || rows.length === 0}
				>
					{syncAllMutation.isPending ? (
						<Loader2 data-icon="inline-start" className="animate-spin" />
					) : (
						<RefreshCw data-icon="inline-start" />
					)}
					Sync All to Oracle
				</Button>
			</div>

			<div className="flex flex-col gap-3">
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by Emp Code or Name…"
						className="h-9 max-w-lg"
					/>
					<Button type="submit" variant="secondary" size="sm">
						Search
					</Button>
					{search && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setSearch("");
							}}
						>
							Clear
						</Button>
					)}
				</form>
			</div>

			{employeesQuery.isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : rows.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Camera />
						</EmptyMedia>
						<EmptyTitle>No employees found</EmptyTitle>
						<EmptyDescription>
							Try a different search term or check the database connection.
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
						paginationPageSize={30}
						headerHeight={36}
						rowHeight={42}
						enableCellTextSelection
						ensureDomOrder
					/>
				</div>
			)}

			<AlertDialog open={syncAllOpen} onOpenChange={setSyncAllOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Sync all photos to Oracle?</AlertDialogTitle>
						<AlertDialogDescription>
							This will update the EMP_PIC_PATH in Oracle for all employees that
							have a photo in MES. Employees without a photo will be skipped.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleSyncAll}>
							{syncAllMutation.isPending ? (
								<Loader2 data-icon="inline-start" className="animate-spin" />
							) : (
								<RefreshCw data-icon="inline-start" />
							)}
							Sync All
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
