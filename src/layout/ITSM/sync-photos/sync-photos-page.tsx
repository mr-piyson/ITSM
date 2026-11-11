"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GridApi, IDatasource } from "ag-grid-community";
import {
	Camera,
	HardHat,
	Loader2,
	RefreshCw,
	Search,
	Users,
} from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	PHOTO_SYNC_SOURCE_VALUES,
	SYNC_STATUS_FILTER_LABELS,
	SYNC_STATUS_FILTER_VALUES,
	type SyncStatusFilter,
} from "@/lib/sync-photos";
import type {
	PhotoSyncSource,
	SyncPhotoEmployee,
} from "@/server/routers/ITSM/sync-photos";
import { trpc } from "@/trpc/react";

import { SyncPhotosTable } from "./sync-photos-table";

const PAGE_SIZE = 30;

type SourceMeta = {
	title: string;
	unitLabel: string;
	searchPlaceholder: string;
	codeHeader: string;
	emptyTitle: string;
	emptySearchTitle: string;
	emptyDescription: string;
	dialogPendingDescription: string;
	dialogDescription: string;
	progressLabel: string;
};

const SOURCE_META: Record<PhotoSyncSource, SourceMeta> = {
	employee: {
		title: "Employee Photo Sync",
		unitLabel: "employee(s)",
		searchPlaceholder: "Search by Emp Code, name or department…",
		codeHeader: "Emp Code",
		emptyTitle: "No employees found",
		emptySearchTitle: "No matching employees",
		emptyDescription: "Employees with a photo in MES will appear here.",
		dialogPendingDescription: "Updating employee photos in Oracle...",
		dialogDescription:
			"This will update the EMP_PIC_PATH in Oracle for all employees that have a photo in MES. Employees without a photo will be skipped.",
		progressLabel: "Syncing employee photos",
	},
	subcontract: {
		title: "Subcontractor Photo Sync",
		unitLabel: "subcontractor(s)",
		searchPlaceholder: "Search by SC Code or name…",
		codeHeader: "SC Code",
		emptyTitle: "No subcontractors found",
		emptySearchTitle: "No matching subcontractors",
		emptyDescription:
			"Subcontract workers with a photo in MES will appear here.",
		dialogPendingDescription: "Updating subcontractor photos in Oracle...",
		dialogDescription:
			"This will update the EMP_PIC_PATH in T690_SUB_CONTR_MAST for all subcontract workers that have a photo in MES. Workers without a photo will be skipped.",
		progressLabel: "Syncing subcontractor photos",
	},
};

export function SyncPhotosPage() {
	const utils = trpc.useUtils();
	const [syncAllOpen, setSyncAllOpen] = useState(false);
	const [syncProgress, setSyncProgress] = useState(0);
	const [syncingId, setSyncingId] = useState<number | null>(null);

	const [source, setSource] = useQueryState(
		"source",
		parseAsStringEnum([...PHOTO_SYNC_SOURCE_VALUES])
			.withDefault("employee")
			.withOptions({ history: "replace" }),
	);
	const [status, setStatus] = useQueryState(
		"status",
		parseAsStringEnum([...SYNC_STATUS_FILTER_VALUES])
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [page, setPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(0).withOptions({ history: "replace" }),
	);

	const [searchInput, setSearchInput] = useState(query);
	const [total, setTotal] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	const gridApiRef = useRef<GridApi<SyncPhotoEmployee> | null>(null);
	const requestIdRef = useRef(0);

	const syncOneMutation = trpc.syncPhotos.syncOne.useMutation();
	const syncAllMutation = trpc.syncPhotos.syncAll.useMutation();

	const meta = SOURCE_META[source];

	useEffect(() => {
		setSearchInput(query);
	}, [query]);

	useEffect(() => {
		setTotal(null);
		setLoadError(null);
		setIsLoading(true);
	}, [query, source, status]);

	useEffect(() => {
		const value = searchInput.trim();
		const timer = setTimeout(() => {
			if (value !== query) {
				setQuery(value);
				setPage(0);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput, query, setQuery, setPage]);

	useEffect(() => {
		if (!syncAllMutation.isPending) {
			setSyncProgress(0);
			return;
		}

		setSyncProgress(8);
		const timer = setInterval(() => {
			setSyncProgress((progress) => (progress >= 90 ? 8 : progress + 7));
		}, 700);
		return () => clearInterval(timer);
	}, [syncAllMutation.isPending]);

	const handleSourceChange = useCallback(
		(value: string) => {
			if ((PHOTO_SYNC_SOURCE_VALUES as readonly string[]).includes(value)) {
				setSource(value as PhotoSyncSource);
				setPage(0);
			}
		},
		[setSource, setPage],
	);

	const handleStatusChange = useCallback(
		(value: string) => {
			if ((SYNC_STATUS_FILTER_VALUES as readonly string[]).includes(value)) {
				setStatus(value as SyncStatusFilter);
				setPage(0);
			}
		},
		[setStatus, setPage],
	);

	const datasource = useMemo<IDatasource>(
		() => ({
			getRows: async (params) => {
				const requestId = ++requestIdRef.current;
				const serverPage = Math.floor(params.startRow / PAGE_SIZE) + 1;
				setIsLoading(true);
				try {
					const data = await utils.syncPhotos.list.fetch({
						source,
						status,
						q: query,
						page: serverPage,
						pageSize: PAGE_SIZE,
					});
					if (requestId !== requestIdRef.current) {
						return;
					}
					setTotal(data.total);
					setIsLoading(false);
					params.successCallback(data.rows, data.total);
				} catch (error) {
					if (requestId !== requestIdRef.current) {
						return;
					}
					setIsLoading(false);
					setLoadError(
						error instanceof Error ? error.message : "Failed to load photos",
					);
					params.failCallback();
				}
			},
		}),
		[query, source, status, utils],
	);

	const handleReady = useCallback((api: GridApi<SyncPhotoEmployee>) => {
		gridApiRef.current = api;
	}, []);

	const handlePageChange = useCallback(
		(next: number) => {
			setPage(next);
		},
		[setPage],
	);

	const handleRetry = useCallback(() => {
		setLoadError(null);
		setRetryKey((key) => key + 1);
		setPage(0);
	}, [setPage]);

	const handleSyncOne = useCallback(
		async (emp: SyncPhotoEmployee) => {
			setSyncingId(emp.id);
			try {
				await syncOneMutation.mutateAsync({
					source,
					empCode: emp.empCode,
					imageUrl: emp.imageUrl,
				});
				toast.success(`Photo synced for ${emp.empCode}`);
				void utils.syncPhotos.list.invalidate();
				gridApiRef.current?.refreshInfiniteCache();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Sync request failed",
				);
			} finally {
				setSyncingId(null);
			}
		},
		[syncOneMutation, source, utils],
	);

	const handleSyncAll = useCallback(async () => {
		try {
			const result = await syncAllMutation.mutateAsync({ source });
			toast.success(
				result.failed > 0
					? `Synced ${result.succeeded}/${result.total} (${result.failed} failed)`
					: result.skipped > 0
						? `Synced ${result.succeeded} · ${result.skipped} already in sync`
						: `Synced ${result.succeeded} photo(s)`,
			);
			void utils.syncPhotos.list.invalidate();
			gridApiRef.current?.refreshInfiniteCache();
			setSyncAllOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Sync all failed");
		}
	}, [syncAllMutation, source, utils]);

	const noResults = total === 0;
	const searching = query.trim().length > 0;
	const statusFiltered = status !== "all";
	const filtered = searching || statusFiltered;

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
					<p className="text-xs text-muted-foreground">
						{total === null ? "…" : `${total} ${meta.unitLabel}`}
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSyncAllOpen(true)}
					disabled={syncAllMutation.isPending || noResults}
				>
					{syncAllMutation.isPending ? (
						<Loader2 data-icon="inline-start" className="animate-spin" />
					) : (
						<RefreshCw data-icon="inline-start" />
					)}
					Sync All to Oracle
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Tabs value={source} onValueChange={handleSourceChange}>
					<TabsList>
						<TabsTrigger value="employee">
							<Users />
							Employees
						</TabsTrigger>
						<TabsTrigger value="subcontract">
							<HardHat />
							Subcontractors
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Select
					value={status}
					onValueChange={(value) => {
						if (value) handleStatusChange(value);
					}}
				>
					<SelectTrigger className="h-9 w-[170px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						{SYNC_STATUS_FILTER_VALUES.map((value) => (
							<SelectItem key={value} value={value}>
								{SYNC_STATUS_FILTER_LABELS[value]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="relative min-w-0 flex-1 md:max-w-lg">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder={meta.searchPlaceholder}
						className="h-9 pl-8"
					/>
				</div>
			</div>

			{loadError ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Camera />
						</EmptyMedia>
						<EmptyTitle>Could not load photos</EmptyTitle>
						<EmptyDescription>{loadError}</EmptyDescription>
					</EmptyHeader>
					<Button size="sm" variant="secondary" onClick={handleRetry}>
						<RefreshCw data-icon="inline-start" />
						Retry
					</Button>
				</Empty>
			) : noResults ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Camera />
						</EmptyMedia>
						<EmptyTitle>
							{filtered ? meta.emptySearchTitle : meta.emptyTitle}
						</EmptyTitle>
						<EmptyDescription>
							{filtered
								? "Try a different search term or filter."
								: meta.emptyDescription}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<SyncPhotosTable
					key={retryKey}
					datasource={datasource}
					pageSize={PAGE_SIZE}
					page={page}
					loading={isLoading}
					syncingId={syncingId}
					codeHeader={meta.codeHeader}
					onSyncOne={handleSyncOne}
					onPageChange={handlePageChange}
					onReady={handleReady}
				/>
			)}

			<AlertDialog open={syncAllOpen} onOpenChange={setSyncAllOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Sync all photos to Oracle?</AlertDialogTitle>
						<AlertDialogDescription>
							{syncAllMutation.isPending
								? meta.dialogPendingDescription
								: meta.dialogDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					{syncAllMutation.isPending ? (
						<Progress value={syncProgress} aria-label={meta.progressLabel}>
							<ProgressLabel>{meta.progressLabel}</ProgressLabel>
						</Progress>
					) : null}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={syncAllMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleSyncAll}
							disabled={syncAllMutation.isPending}
						>
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
