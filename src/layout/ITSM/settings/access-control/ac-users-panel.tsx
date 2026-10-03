"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Loader2, Search, UserRoundSearch, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
	useQueryStates,
} from "nuqs";

import { Button } from "@/components/ui/button";
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
import {
	AC_EXCLUSIVE_FILTERS,
	AC_USER_FILTER_LABELS,
	AC_USER_SEARCH_FIELD_LABELS,
} from "@/lib/ac/labels";
import {
	AC_USER_FILTERS,
	AC_USER_SEARCH_FIELDS,
	type AcUserFilter,
	type AcUserSearchField,
} from "@/lib/ac/types";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

import { AcPager } from "./ac-pager";
import { AcUserDetailDialog } from "./ac-user-detail-dialog";
import { AcUsersTable } from "./ac-users-table";

const searchInParser = parseAsStringEnum([
	...AC_USER_SEARCH_FIELDS,
	"all",
] as const).withDefault("all" satisfies AcUserSearchField);

const filtersParser = parseAsArrayOf(
	parseAsStringEnum([...AC_USER_FILTERS] as [AcUserFilter, ...AcUserFilter[]]),
).withDefault([]);

const pageParser = parseAsInteger.withDefault(1);
const perPageParser = parseAsInteger
	.withDefault(AC_DEFAULT_PAGE_SIZE)
	.withOptions({ history: "replace" });

export function AcUsersPanel() {
	const [{ q, searchIn, filters, page, perPage }, setState] = useQueryStates({
		q: parseAsString.withDefault("").withOptions({ history: "replace" }),
		searchIn: searchInParser.withOptions({ history: "replace" }),
		filters: filtersParser.withOptions({ history: "replace" }),
		page: pageParser.withOptions({ history: "replace" }),
		perPage: perPageParser,
	});

	const [personId, setPersonId] = useQueryState("id", parseAsString);
	const [searchDraft, setSearchDraft] = useState(q);

	// Keep the input responsive while the URL (and therefore the query) waits.
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
			filters,
		}),
		[page, effectivePerPage, q, searchIn, filters],
	);

	const { data, isPending, isFetching } = trpc.ac.users.useQuery(input, {
		placeholderData: keepPreviousData,
	});

	const rows = data?.rows ?? [];
	const pageCount = data?.pageCount ?? 0;
	const total = data?.total ?? 0;

	const toggleFilter = (filter: AcUserFilter) => {
		const active = filters.includes(filter);
		const partner = AC_EXCLUSIVE_FILTERS.find((pair) =>
			(pair as readonly string[]).includes(filter),
		);
		const kept = filters.filter(
			(item) =>
				item !== filter &&
				// Picking one half of an exclusive pair clears the other.
				!(active === false && partner?.includes(item)),
		);
		setState({
			filters: active ? kept : [...kept, filter],
			page: 1,
		});
	};

	const hasCriteria = q.length > 0 || filters.length > 0;

	return (
		<div className="flex min-h-0 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative min-w-56 flex-1 sm:max-w-sm">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={searchDraft}
						onChange={(event) => setSearchDraft(event.target.value)}
						placeholder="Search person ID, name, device…"
						className="h-8 pl-8"
					/>
				</div>

				<Select
					value={searchIn}
					onValueChange={(value) =>
						setState({
							searchIn: value as typeof searchIn,
							page: 1,
						})
					}
				>
					<SelectTrigger size="sm" className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(AC_USER_SEARCH_FIELD_LABELS).map(
							([value, label]) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>

				{hasCriteria && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setState({ q: null, filters: [], page: 1 })}
					>
						<X data-icon="inline-start" />
						Clear
					</Button>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				{AC_USER_FILTERS.map((filter) => {
					const active = filters.includes(filter);
					return (
						<Button
							key={filter}
							variant={active ? "default" : "outline"}
							size="sm"
							className={cn("h-7", !active && "text-muted-foreground")}
							onClick={() => toggleFilter(filter)}
						>
							{AC_USER_FILTER_LABELS[filter]}
						</Button>
					);
				})}
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
								<UserRoundSearch />
							</EmptyMedia>
							<EmptyTitle>
								{hasCriteria ? "No users match" : "No users found"}
							</EmptyTitle>
							<EmptyDescription>
								{hasCriteria
									? "Try a different search term or clear the filters."
									: "No live access control users exist yet."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<AcUsersTable
						users={rows}
						groups={data?.groups ?? []}
						selectedPersonId={personId}
						onSelect={(id) => setPersonId(id, { history: "replace" })}
					/>
				)}

				{total > 0 && (
					<AcPager
						page={page}
						perPage={effectivePerPage}
						total={total}
						pageCount={pageCount}
						pending={isFetching}
						onPageChange={(next) => setState({ page: next })}
						onPerPageChange={(next) => setState({ perPage: next, page: 1 })}
					/>
				)}
			</div>

			<AcUserDetailDialog
				personId={personId}
				onClose={() => setPersonId(null, { history: "replace" })}
			/>
		</div>
	);
}
