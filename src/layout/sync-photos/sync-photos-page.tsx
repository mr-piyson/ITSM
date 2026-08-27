"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Camera, Loader2, RefreshCw, Search } from "lucide-react";

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
import type { SyncPhotoEmployee } from "@/server/routers/sync-photos";
import { trpc } from "@/trpc/react";

import { SyncPhotosTable } from "./sync-photos-table";

export function SyncPhotosPage() {
	const utils = trpc.useUtils();
	const [search, setSearch] = useState("");
	const [syncAllOpen, setSyncAllOpen] = useState(false);
	const [syncingId, setSyncingId] = useState<number | null>(null);

	const employeesQuery = trpc.syncPhotos.list.useQuery({ q: "" });
	const syncOneMutation = trpc.syncPhotos.syncOne.useMutation();
	const syncAllMutation = trpc.syncPhotos.syncAll.useMutation();

	const employees = employeesQuery.data ?? [];

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return employees;
		}
		return employees.filter((emp) =>
			[emp.empCode, emp.name, emp.department].some((value) =>
				value?.toLowerCase().includes(q),
			),
		);
	}, [employees, search]);

	const outOfSyncCount = useMemo(
		() =>
			employees.reduce(
				(acc, emp) =>
					acc +
					(emp.syncStatus === "different" || emp.syncStatus === "not_in_oracle"
						? 1
						: 0),
				0,
			),
		[employees],
	);

	const handleSyncOne = useCallback(
		async (emp: SyncPhotoEmployee) => {
			setSyncingId(emp.id);
			try {
				await syncOneMutation.mutateAsync({
					empCode: emp.empCode,
					imageUrl: emp.imageUrl,
				});
				toast.success(`Photo synced for ${emp.empCode}`);
				await utils.syncPhotos.list.invalidate();
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
		setSyncAllOpen(false);
		try {
			const result = await syncAllMutation.mutateAsync();
			toast.success(
				result.failed > 0
					? `Synced ${result.succeeded}/${result.total} (${result.failed} failed)`
					: `Synced ${result.succeeded} photo(s)`,
			);
			await utils.syncPhotos.list.invalidate();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Sync all failed");
		}
	}, [syncAllMutation, utils]);

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						Employee Photo Sync
					</h1>
					<p className="text-xs text-muted-foreground">
						{employeesQuery.isPending
							? "…"
							: `${employees.length} employee(s)${outOfSyncCount > 0 ? ` · ${outOfSyncCount} out of sync` : ""}`}
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSyncAllOpen(true)}
					disabled={syncAllMutation.isPending || filtered.length === 0}
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
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by Emp Code, name or department…"
					className="h-9 pl-8"
				/>
			</div>

			{employeesQuery.isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : employeesQuery.isError ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Camera />
						</EmptyMedia>
						<EmptyTitle>Could not load photos</EmptyTitle>
						<EmptyDescription>
							{employeesQuery.error?.message ??
								"Check the database connection and try again."}
						</EmptyDescription>
					</EmptyHeader>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => void employeesQuery.refetch()}
					>
						<RefreshCw data-icon="inline-start" />
						Retry
					</Button>
				</Empty>
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Camera />
						</EmptyMedia>
						<EmptyTitle>
							{employees.length === 0
								? "No employees found"
								: "No matching employees"}
						</EmptyTitle>
						<EmptyDescription>
							{employees.length === 0
								? "Employees with a photo in MES will appear here."
								: "Try a different search term."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<SyncPhotosTable
					rows={filtered}
					syncingId={syncingId}
					onSyncOne={handleSyncOne}
				/>
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
