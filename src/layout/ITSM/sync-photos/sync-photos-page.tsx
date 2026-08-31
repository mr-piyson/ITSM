"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GridApi, IDatasource } from "ag-grid-community";
import { Camera, Loader2, RefreshCw, Search } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
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
import type { SyncPhotoEmployee } from "@/server/routers/ITSM/sync-photos";
import { trpc } from "@/trpc/react";

import { SyncPhotosTable } from "./sync-photos-table";

const PAGE_SIZE = 30;

export function SyncPhotosPage() {
	const utils = trpc.useUtils();
	const [syncAllOpen, setSyncAllOpen] = useState(false);
	const [syncProgress, setSyncProgress] = useState(0);
	const [syncingId, setSyncingId] = useState<number | null>(null);

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

	useEffect(() => {
		setSearchInput(query);
	}, [query]);

	useEffect(() => {
		setTotal(null);
		setLoadError(null);
		setIsLoading(true);
	}, [query]);

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

	const datasource = useMemo<IDatasource>(
		() => ({
			getRows: async (params) => {
				const requestId = ++requestIdRef.current;
				const serverPage = Math.floor(params.startRow / PAGE_SIZE) + 1;
				setIsLoading(true);
				try {
					const data = await utils.syncPhotos.list.fetch({
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
		[query, utils],
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
		[syncOneMutation, utils],
	);

	const handleSyncAll = useCallback(async () => {
		try {
			const result = await syncAllMutation.mutateAsync();
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
	}, [syncAllMutation, utils]);

	const noResults = total === 0;
	const searching = query.trim().length > 0;

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						Employee Photo Sync
					</h1>
					<p className="text-xs text-muted-foreground">
						{total === null ? "…" : `${total} employee(s)`}
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

			<div className="relative w-full max-w-lg">
				<Search
					data-icon="inline-start"
					className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					placeholder="Search by Emp Code, name or department…"
					className="h-9 pl-8"
				/>
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
							{searching ? "No matching employees" : "No employees found"}
						</EmptyTitle>
						<EmptyDescription>
							{searching
								? "Try a different search term."
								: "Employees with a photo in MES will appear here."}
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
								? "Updating employee photos in Oracle..."
								: "This will update the EMP_PIC_PATH in Oracle for all employees that have a photo in MES. Employees without a photo will be skipped."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					{syncAllMutation.isPending ? (
						<Progress value={syncProgress} aria-label="Syncing employee photos">
							<ProgressLabel>Syncing employee photos</ProgressLabel>
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
