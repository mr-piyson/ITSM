"use client";

import { Loader2, ShieldAlert, Users, UsersRound, Network } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AC_DEFAULT_PAGE_SIZE } from "@/lib/ac/constants";
import { formatAcNumber } from "@/lib/ac/format";
import { useAcAccess } from "@/lib/ac/use-ac-access";
import { trpc } from "@/trpc/react";

import { AcDevicesPanel } from "./ac-devices-panel";
import { AcGroupsPanel } from "./ac-groups-panel";
import { AcUsersPanel } from "./ac-users-panel";

const TAB_VALUES = ["users", "groups", "devices"] as const;

export function AccessControlPage() {
	const canAccessControl = useAcAccess();
	const [tab, setTab] = useQueryState(
		"tab",
		parseAsStringEnum([...TAB_VALUES])
			.withDefault("users")
			.withOptions({ history: "replace" }),
	);

	const { data: userList } = trpc.ac.users.useQuery(
		{ page: 1, perPage: AC_DEFAULT_PAGE_SIZE },
		{ enabled: canAccessControl === true && tab === "users" },
	);
	const { data: groupList } = trpc.ac.groups.useQuery(
		{ page: 1, perPage: AC_DEFAULT_PAGE_SIZE },
		{ enabled: canAccessControl === true && tab === "groups" },
	);
	const { data: devices } = trpc.ac.devices.useQuery(
		{ activeOnly: true },
		{ enabled: canAccessControl === true && tab === "devices" },
	);

	const counts = {
		users: userList ? formatAcNumber(userList.total) : null,
		groups: groupList ? formatAcNumber(groupList.total) : null,
		devices: devices ? formatAcNumber(devices.length) : null,
	};

	return (
		<div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col space-y-4 overflow-auto p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Access Control</h1>
				<p className="text-xs text-muted-foreground">
					Read-only view of the Hikvision access control data held in MES.
				</p>
			</div>

			{canAccessControl === undefined ? (
				<div className="flex flex-1 items-center justify-center py-16">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : !canAccessControl ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ShieldAlert />
						</EmptyMedia>
						<EmptyTitle>Access control permission required</EmptyTitle>
						<EmptyDescription>
							Your account does not have the access control role, so this
							section stays hidden.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<Tabs
					value={tab}
					onValueChange={(value) => setTab(value as typeof tab)}
					className="min-h-0 flex-1"
				>
					<TabsList variant="line" className="w-full justify-start">
						<TabsTrigger value="users" className="flex-none">
							<Users />
							Users
							{counts.users && (
								<span className="text-muted-foreground">({counts.users})</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="groups" className="flex-none">
							<UsersRound />
							Groups
							{counts.groups && (
								<span className="text-muted-foreground">({counts.groups})</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="devices" className="flex-none">
							<Network />
							Devices
							{counts.devices && (
								<span className="text-muted-foreground">
									({counts.devices})
								</span>
							)}
						</TabsTrigger>
					</TabsList>

					{tab === "users" && <AcUsersPanel />}
					{tab === "groups" && <AcGroupsPanel />}
					{tab === "devices" && <AcDevicesPanel />}
				</Tabs>
			)}
		</div>
	);
}
