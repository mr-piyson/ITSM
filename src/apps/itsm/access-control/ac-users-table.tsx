"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { parseCsvInts, readCards } from "@/lib/ac/csv";
import { formatAcDate } from "@/lib/ac/format";
import { acEmpSourceLabel } from "@/lib/ac/labels";
import type { AcGroupSummary, AcUserRecord } from "@/lib/ac/types";

import { AcUserPhoto } from "./ac-photo";
import {
	AccessBadge,
	AdminBadge,
	GroupBadges,
	ValidityBadge,
	VerifyModeBadge,
} from "./ac-badges";

export function AcUsersTable({
	users,
	groups,
	selectedPersonId,
	onSelect,
}: {
	users: AcUserRecord[];
	groups: AcGroupSummary[];
	selectedPersonId: string | null;
	onSelect: (personId: string) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>User</TableHead>
					<TableHead>Person ID</TableHead>
					<TableHead>Groups</TableHead>
					<TableHead>Cards</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Validity</TableHead>
					<TableHead>Verify</TableHead>
					<TableHead>Device IP</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => {
					const cards = readCards(user.cards);
					const groupIds = parseCsvInts(user.accessGroup);
					const selected = selectedPersonId === user.personId;
					return (
						<TableRow
							key={user.personId}
							data-state={selected ? "selected" : undefined}
							className="cursor-pointer"
							onClick={() => onSelect(user.personId)}
						>
							<TableCell>
								<div className="flex items-center gap-2">
									<AcUserPhoto
										name={user.name}
										personId={user.personId}
										className="size-8"
										size="sm"
									/>
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium">
											{user.name ?? "—"}
										</span>
										<span className="text-xs text-muted-foreground">
											{acEmpSourceLabel(user.empSource)}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell className="font-mono text-xs">
								{user.personId}
							</TableCell>
							<TableCell>
								<GroupBadges ids={groupIds} groups={groups} />
							</TableCell>
							<TableCell className="text-xs">
								{cards.length === 0 ? (
									<span className="text-muted-foreground">—</span>
								) : (
									cards.length
								)}
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap items-center gap-1">
									<AccessBadge access={user.access} />
									{user.isAdmin === 1 && <AdminBadge />}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-col gap-1">
									<span className="text-xs text-muted-foreground">
										{user.beginTime || user.endTime
											? `${formatAcDate(user.beginTime)} – ${formatAcDate(user.endTime)}`
											: "No validity window"}
									</span>
									<ValidityBadge endTime={user.endTime} />
								</div>
							</TableCell>
							<TableCell>
								<VerifyModeBadge mode={user.verifyMode} />
							</TableCell>
							<TableCell className="font-mono text-xs">
								{user.deviceIp ?? "—"}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
