"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { acValidityState } from "@/lib/ac/format";
import { acCardTypeLabel, acVerifyModeLabel } from "@/lib/ac/labels";
import type { AcGroupSummary } from "@/lib/ac/types";

/** `hikvision.users.access`: 1 = granted, 0 = inactive. */
export function AccessBadge({ access }: { access: number }) {
	return access === 1 ? (
		<Badge variant="secondary">
			<ShieldCheck data-icon="inline-start" />
			Active
		</Badge>
	) : (
		<Badge variant="outline" className="text-muted-foreground">
			<ShieldOff data-icon="inline-start" />
			Inactive
		</Badge>
	);
}

export function AdminBadge() {
	return (
		<Badge>
			<ShieldCheck data-icon="inline-start" />
			Admin
		</Badge>
	);
}

/**
 * Validity window derived from `end_time`. Live rows all leave `begin_time` and
 * `end_time` NULL, so this renders "Open" until the legacy sync starts writing
 * them again.
 */
export function ValidityBadge({ endTime }: { endTime: string | null }) {
	const state = acValidityState(endTime);
	if (state === "expired") {
		return <Badge variant="destructive">Expired</Badge>;
	}
	if (state === "open") {
		return (
			<Badge variant="outline" className="text-muted-foreground">
				Open ended
			</Badge>
		);
	}
	return <Badge variant="secondary">In date</Badge>;
}

export function VerifyModeBadge({ mode }: { mode: string | null }) {
	const label = acVerifyModeLabel(mode);
	if (label === "Device default") {
		return (
			<Badge variant="outline" className="text-muted-foreground">
				{label}
			</Badge>
		);
	}
	return <Badge variant="secondary">{label}</Badge>;
}

export function CardTypeBadge({ type }: { type: string }) {
	const label = acCardTypeLabel(type);
	if (label === "Normal") {
		return (
			<Badge variant="outline" className="text-muted-foreground">
				{label}
			</Badge>
		);
	}
	return <Badge variant="secondary">{label}</Badge>;
}

export function DeletedBadge() {
	return <Badge variant="destructive">Deleted</Badge>;
}

/** `hikvision.groups.current_activated`. */
export function ActivatedBadge({ activated }: { activated: number }) {
	return activated === 1 ? (
		<Badge variant="secondary">Activated</Badge>
	) : (
		<Badge variant="outline" className="text-muted-foreground">
			Not activated
		</Badge>
	);
}

/** `mes.peripherals.ac_direction`; most rows leave it NULL. */
export function DirectionBadge({
	direction,
}: {
	direction: "In" | "Out" | null;
}) {
	if (!direction) {
		return <span className="text-xs text-muted-foreground">—</span>;
	}
	return (
		<Badge variant={direction === "In" ? "secondary" : "outline"}>
			{direction}
		</Badge>
	);
}

/** Terminal reachability as tracked by the legacy sync. */
export function DeviceStatusBadge({
	active,
	failed,
}: {
	active: number;
	failed: number;
}) {
	if (failed === 1) {
		return <Badge variant="destructive">Unreachable</Badge>;
	}
	return active === 1 ? (
		<Badge variant="secondary">Active</Badge>
	) : (
		<Badge variant="outline" className="text-muted-foreground">
			Inactive
		</Badge>
	);
}

/** Group ids resolved against the page-level summaries. */
export function GroupBadges({
	ids,
	groups,
	max = 3,
}: {
	ids: number[];
	groups: AcGroupSummary[];
	max?: number;
}) {
	if (ids.length === 0) {
		return <span className="text-xs text-muted-foreground">No group</span>;
	}
	const byId = new Map(groups.map((group) => [group.id, group.name]));
	const shown = ids.slice(0, max);
	const rest = ids.length - shown.length;
	return (
		<span className="flex flex-wrap items-center gap-1">
			{shown.map((id) => (
				<Badge key={id} variant="outline" title={byId.get(id) ?? `Group ${id}`}>
					{byId.get(id) ?? `#${id}`}
				</Badge>
			))}
			{rest > 0 && (
				<Badge variant="outline" className="text-muted-foreground">
					+{rest}
				</Badge>
			)}
		</span>
	);
}
