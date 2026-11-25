"use client";

import { AlertCircle, ClipboardList, Plus, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	kindLabel,
	REQUEST_KINDS,
	REQUEST_STATUSES,
	statusLabel,
	type RequestStatus,
} from "@/lib/request-constants";
import { cn } from "@/lib/utils";
import type { RequestItem } from "@/apps/itsm/requests/router";
import { trpc } from "@/trpc/react";

import { RequestDetailsDialog } from "./request-details-dialog";
import { RequestsTable } from "./requests-table";

const STATUS_FILTERS = ["all", ...REQUEST_STATUSES] as const;
const STATUS_FILTER_VALUES = [...STATUS_FILTERS] as unknown as string[];
const KIND_FILTERS = ["all", ...REQUEST_KINDS] as const;
const KIND_FILTER_VALUES = [...KIND_FILTERS] as unknown as string[];

const newRequestLink = "/documents/requests" as Route;

export function RequestsPage() {
	const utils = trpc.useUtils();
	const meQuery = trpc.auth.me.useQuery();
	const requesterQuery = trpc.requests.requester.useQuery();

	const [statusParam, setStatusParam] = useQueryState(
		"status",
		parseAsStringLiteral(STATUS_FILTER_VALUES).withDefault("all"),
	);
	const [kindParam, setKindParam] = useQueryState(
		"kind",
		parseAsStringLiteral(KIND_FILTER_VALUES).withDefault("all"),
	);
	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [idParam, setIdParam] = useQueryState("id", {
		defaultValue: "",
		history: "replace",
	});

	const { data: requests = [], isPending } = trpc.requests.list.useQuery({
		status: statusParam as "all" | RequestStatus,
		kind: kindParam as "all" | (typeof REQUEST_KINDS)[number],
	});

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return requests;
		}
		return requests.filter((request) => {
			const parts = [
				request.id,
				request.userName,
				request.requesterEmplCode,
				kindLabel(request.kind),
				request.slctname,
				request.otherpg,
				request.newpg,
				request.descrip,
				request.payload,
				request.status,
				request.requestPrio,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [requests, query]);

	const detailsRequest = useMemo(
		() => requests.find((r) => String(r.id) === idParam) ?? null,
		[requests, idParam],
	);

	const closeDetails = () => setIdParam("", { history: "replace" });

	const handleChanged = () => {
		utils.requests.list.invalidate();
	};

	const misError =
		requesterQuery.error?.message === "Your email is not in MIS"
			? requesterQuery.error.message
			: null;

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Requests</h1>
						<p className="text-xs text-muted-foreground">
							All request kinds ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button
						size="default"
						render={<Link href={newRequestLink} />}
						nativeButton={false}
					>
						<Plus data-icon="inline-start" />
						New Request
					</Button>
				</div>

				{misError && (
					<div className="flex items-center gap-2 border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
						<AlertCircle className="size-4 shrink-0" />
						{misError}. Please contact IT to register your email in MIS.
					</div>
				)}

				<div className="relative w-full max-w-lg">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search by ID, requester, type, description…"
						className="h-9 pl-8"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<div
						className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
						role="group"
						aria-label="Filter by type"
					>
						{KIND_FILTERS.map((kind) => (
							<button
								key={kind}
								type="button"
								aria-pressed={kindParam === kind}
								onClick={() => setKindParam(kind)}
								className={cn(
									"shrink-0 whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
									kindParam === kind
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{kind === "all" ? "All Types" : kindLabel(kind)}
							</button>
						))}
					</div>

					<div
						className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
						role="group"
						aria-label="Filter by status"
					>
						{STATUS_FILTERS.map((status) => (
							<button
								key={status}
								type="button"
								aria-pressed={statusParam === status}
								onClick={() => setStatusParam(status)}
								className={cn(
									"shrink-0 whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
									statusParam === status
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								{status === "all" ? "All" : statusLabel(status)}
							</button>
						))}
					</div>
				</div>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<ClipboardList className="size-6 animate-pulse text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ClipboardList />
						</EmptyMedia>
						<EmptyTitle>
							{requests.length === 0 ? "No requests yet" : "No requests found"}
						</EmptyTitle>
						<EmptyDescription>
							{requests.length === 0
								? meQuery.data?.type === "admin"
									? "Requests submitted by users will appear here."
									: "Submit a request to report a problem or ask for an asset."
								: "Try adjusting your search or filters."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{requests.length === 0 && (
							<Button
								size="sm"
								render={<Link href={newRequestLink} />}
								nativeButton={false}
							>
								<Plus data-icon="inline-start" />
								Submit the first request
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<RequestsTable
					requests={filtered}
					onDetails={(request: RequestItem) => setIdParam(String(request.id))}
				/>
			)}

			<RequestDetailsDialog
				request={detailsRequest}
				onOpenChange={closeDetails}
				onChanged={handleChanged}
			/>
		</div>
	);
}
