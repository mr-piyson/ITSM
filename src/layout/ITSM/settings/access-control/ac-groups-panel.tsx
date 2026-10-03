"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Loader2, Search, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	parseAsBoolean,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
	useQueryStates,
} from "nuqs";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AC_DEFAULT_PAGE_SIZE, AC_MAX_PAGE_SIZE } from "@/lib/ac/constants";
import { AC_GROUP_SEARCH_FIELD_LABELS } from "@/lib/ac/labels";
import { AC_GROUP_SEARCH_FIELDS } from "@/lib/ac/types";
import { trpc } from "@/trpc/react";

import { AcGroupDetailDialog } from "./ac-group-detail-dialog";
import { AcGroupsTable } from "./ac-groups-table";
import { AcPager } from "./ac-pager";

export function AcGroupsPanel() {
	const [{ q, searchIn, page, perPage, includeDeleted }, setState] =
		useQueryStates({
			q: parseAsString.withDefault("").withOptions({ history: "replace" }),
			searchIn: parseAsStringEnum([...AC_GROUP_SEARCH_FIELDS, "all"])
				.withDefault("all")
				.withOptions({ history: "replace" }),
			page: parseAsInteger.withDefault(1).withOptions({ history: "replace" }),
			perPage: parseAsInteger
				.withDefault(AC_DEFAULT_PAGE_SIZE)
				.withOptions({ history: "replace" }),
			includeDeleted: parseAsBoolean
				.withDefault(false)
				.withOptions({ history: "replace" }),
		});

	const [groupId, setGroupId] = useQueryState("gid", parseAsInteger);
	const [searchDraft, setSearchDraft] = useState(q);

	useEffect(() => {
		setSearchDraft(q);
	}, [q]);

	useEffect(() => {
		if (searchDraft === q) return;
		const timer = setTimeout(() => {
			setState({ q: searchDraft || null, page: 1 });
		}, 300);
		return () => clearTimeout(timer);
	}, [searchDraft, q, setState]);

	const effectivePerPage = Math.min(Math.max(perPage, 1), AC_MAX_PAGE_SIZE);

	const input = useMemo(
		() => ({
			page,
			perPage: effectivePerPage,
			q: q || undefined,
			searchIn,
			includeDeleted,
		}),
		[page, effectivePerPage, q, searchIn, includeDeleted],
	);

	const { data, isPending, isFetching } = trpc.ac.groups.useQuery(input, {
		placeholderData: keepPreviousData,
	});

	const rows = data?.rows ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="flex min-h-0 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative min-w-56 flex-1 sm:max-w-sm">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={searchDraft}
						onChange={(event) => setSearchDraft(event.target.value)}
						placeholder="Search group name or ID…"
						className="h-8 pl-8"
					/>
				</div>

				<Select
					value={searchIn}
					onValueChange={(value) =>
						setState({ searchIn: value as typeof searchIn, page: 1 })
					}
				>
					<SelectTrigger size="sm" className="w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(AC_GROUP_SEARCH_FIELD_LABELS).map(
							([value, label]) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>

				<Label className="flex cursor-pointer items-center gap-2 text-xs">
					<Switch
						checked={includeDeleted}
						onCheckedChange={(checked) =>
							setState({ includeDeleted: checked, page: 1 })
						}
					/>
					Include deleted
				</Label>
			</div>

			<div className="min-h-0 overflow-hidden border">
				{isPending ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : rows.length === 0 ? (
					<Empty className="border-0 py-12">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<UsersRound />
							</EmptyMedia>
							<EmptyTitle>
								{q ? "No groups match" : "No groups found"}
							</EmptyTitle>
							<EmptyDescription>
								{q
									? "Try a different search term."
									: includeDeleted
										? "No groups exist yet."
										: "Every group is soft deleted."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<AcGroupsTable
						groups={rows}
						selectedGroupId={groupId}
						onSelect={(id) => setGroupId(id, { history: "replace" })}
					/>
				)}

				{total > 0 && (
					<AcPager
						page={page}
						perPage={effectivePerPage}
						total={total}
						pageCount={data?.pageCount ?? 0}
						pending={isFetching}
						onPageChange={(next) => setState({ page: next })}
						onPerPageChange={(next) => setState({ perPage: next, page: 1 })}
					/>
				)}
			</div>

			<AcGroupDetailDialog
				groupId={groupId}
				onClose={() => setGroupId(null, { history: "replace" })}
			/>
		</div>
	);
}
