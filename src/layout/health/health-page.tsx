"use client";

import { Database, RefreshCw, Server, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/trpc/react";

type DbStatus = { ok: boolean; latency: number; error?: string };

const DBS: {
	key: "mes" | "iss" | "erp";
	label: string;
	type: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ key: "mes", label: "MES Database", type: "MySQL", icon: Database },
	{ key: "iss", label: "ISS Database", type: "MySQL", icon: Database },
	{ key: "erp", label: "ERP Database", type: "MSSQL", icon: Server },
];

function StatusCard({ db, status }: { db: (typeof DBS)[number]; status?: DbStatus }) {
	const Icon = db.icon;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Icon className="size-4 text-muted-foreground" />
					{db.label}
				</CardTitle>
				<Badge variant={status ? (status.ok ? "secondary" : "destructive") : "outline"}>
					{status ? (status.ok ? "Connected" : "Error") : "Pending"}
				</Badge>
			</CardHeader>
			<CardContent>
				{status ? (
					<div className="flex flex-col gap-1">
						<p className="text-muted-foreground">
							{db.type} &middot; {status.latency}ms
						</p>
						{status.error && (
							<p className="text-destructive">{status.error}</p>
						)}
					</div>
				) : (
					<p className="text-muted-foreground">Checking&hellip;</p>
				)}
			</CardContent>
		</Card>
	);
}

export function HealthPage() {
	const { data, isPending, refetch, isRefetching } =
		trpc.health.dbStatus.useQuery();

	const loading = isPending || isRefetching;

	return (
		<div className="flex h-full min-h-0 flex-col gap-4 p-4 md:p-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						System Health
					</h1>
					<p className="text-xs text-muted-foreground">
						Database connection status
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => refetch()}
					disabled={loading}
				>
					{loading ? (
						<Spinner className="mr-1.5" />
					) : (
						<RefreshCw className="mr-1.5 size-3" />
					)}
					Refresh
				</Button>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				{DBS.map((db) => (
					<StatusCard
						key={db.key}
						db={db}
						status={data?.[db.key]}
					/>
				))}
			</div>

			{data && (
				<p className="text-xs text-muted-foreground">
					<Zap className="mr-1 inline size-3" />
					Last checked: {new Date().toLocaleTimeString()}
				</p>
			)}
		</div>
	);
}
