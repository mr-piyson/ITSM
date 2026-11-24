"use client";

import { useRef, useState } from "react";

import type { LucideIcon } from "lucide-react";
import {
	Briefcase,
	Check,
	Copy,
	ExternalLink,
	HardHat,
	Wallet,
	Mail,
	Monitor,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmployeeAvatar } from "@/components/employee-avatar";
import { EmployeeRow as SharedEmployeeRow } from "@/components/employee-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	RecentAsset,
	RecentEmployee,
} from "@/server/routers/ITSM/dashboard";
import { Button } from "@/components/ui/button";

function ListCard({
	icon: Icon,
	title,
	header,
	children,
}: {
	icon: LucideIcon;
	title: string;
	header?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-1.5">
						<Icon className="size-4 text-muted-foreground" />
						{title}
					</CardTitle>
					{header}
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-0.5 p-1">
				{children}
			</CardContent>
		</Card>
	);
}

function EmptyRow() {
	return (
		<p className="py-6 text-center text-xs text-muted-foreground">
			Nothing yet
		</p>
	);
}

function EmployeeRow({
	employee,
	onClick,
}: {
	employee: RecentEmployee;
	onClick: () => void;
}) {
	return (
		<li
			className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick();
			}}
		>
			<SharedEmployeeRow
				employee={{
					code: employee.emplCode,
					name: employee.emplPname,
					email: employee.emailId,
					image: employee.empPicPath,
					type:
						employee.emplStaffWorkr === "S"
							? "Staff"
							: employee.emplStaffWorkr === "W"
								? "Worker"
								: null,
					onPayroll: employee.emplOnPayroll === "Y",
				}}
			/>
		</li>
	);
}

const TYPE_META = {
	S: { label: "Staff", icon: Briefcase },
	W: { label: "Worker", icon: HardHat },
} as const;

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function CopyButton({ value, label }: { value: string; label: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="size-6"
			aria-label={copied ? "Copied" : label}
			onClick={async () => {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
		>
			{copied ? (
				<Check className="size-3.5 text-emerald-600" />
			) : (
				<Copy className="size-3.5" />
			)}
		</Button>
	);
}

function DetailRow({
	icon: Icon,
	label,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4 px-3 py-2.5">
			<dt className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
				<Icon className="size-3.5" aria-hidden />
				{label}
			</dt>
			<dd className="min-w-0 text-right text-xs font-medium">{children}</dd>
		</div>
	);
}

function EmployeeDetailsDialog({
	employee,
	open,
	onOpenChange,
}: {
	employee: RecentEmployee | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	// Keep the last employee so content doesn't vanish during the close animation
	const last = useRef<RecentEmployee | null>(null);
	if (employee) last.current = employee;
	const data = employee ?? last.current;
	if (!data) return null;

	const name = data.emplPname ?? "Unknown";
	const onPayroll = data.emplOnPayroll === "Y";
	const type = TYPE_META[data.emplStaffWorkr as keyof typeof TYPE_META];
	const initials = getInitials(data.emplPname ?? data.emplCode);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Employee details</DialogTitle>
					<DialogDescription className="sr-only">
						Summary information for {name}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-4 py-2">
					{/* Identity */}
					<div className="flex flex-col items-center gap-3">
						<EmployeeAvatar
							image={data.empPicPath}
							name={data.emplPname}
							code={data.emplCode}
							className="size-24 ring-4 ring-border"
							fallbackClassName="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary"
							fallback={initials}
						/>
						<div className="space-y-1 text-center">
							<p className="text-base font-semibold leading-tight">{name}</p>
							<div className="flex items-center justify-center gap-1">
								<span className="font-mono text-xs text-muted-foreground">
									{data.emplCode}
								</span>
								<CopyButton value={data.emplCode} label="Copy employee code" />
							</div>
						</div>
					</div>

					{/* Details */}
					<dl className="w-full divide-y border">
						<DetailRow icon={type?.icon ?? Briefcase} label="Type">
							<Badge variant="outline" className="text-[11px]">
								{type?.label ?? data.emplStaffWorkr ?? "—"}
							</Badge>
						</DetailRow>

						<DetailRow icon={Mail} label="Email">
							{data.emailId ? (
								<a
									href={`mailto:${data.emailId}`}
									title={data.emailId}
									className="block max-w-[190px] truncate hover:underline focus-visible:underline"
								>
									{data.emailId}
								</a>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</DetailRow>

						<DetailRow icon={Wallet} label="Payroll">
							<Badge
								variant={onPayroll ? "default" : "secondary"}
								className={
									onPayroll
										? "gap-1.5 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
										: "gap-1.5"
								}
							>
								<span
									aria-hidden
									className={`size-1.5 rounded-full ${onPayroll ? "bg-emerald-500" : "bg-muted-foreground/50"}`}
								/>
								{onPayroll ? "On payroll" : "Not on payroll"}
							</Badge>
						</DetailRow>
					</dl>
				</div>

				<DialogFooter className="gap-2 sm:justify-between">
					<DialogClose>Close</DialogClose>
					<Button
						render={
							<Link href={`/app/employees/${data.emplCode}`}>
								View full profile
								<ExternalLink aria-hidden />
							</Link>
						}
					></Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function AssetRow({ asset }: { asset: RecentAsset }) {
	return (
		<li className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted/50">
			<Link href="/app/assets" className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="truncate text-sm font-medium leading-none">
					{asset.deviceName ?? asset.code}
				</span>
				<span className="truncate font-mono text-[11px] text-muted-foreground">
					{asset.code}
				</span>
			</Link>
			{asset.type && (
				<Badge
					variant="outline"
					className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
				>
					{asset.type}
				</Badge>
			)}
		</li>
	);
}

export function RecentLists({
	empLeft,
	newJoiners,
	recentAssets,
	employeeType,
	onEmployeeTypeChange,
	newJoinerType,
	onNewJoinerTypeChange,
}: {
	empLeft: RecentEmployee[];
	newJoiners: RecentEmployee[];
	recentAssets: RecentAsset[];
	employeeType: "S" | "W";
	onEmployeeTypeChange: (type: "S" | "W") => void;
	newJoinerType: "S" | "W";
	onNewJoinerTypeChange: (type: "S" | "W") => void;
}) {
	const [selectedEmpLeft, setSelectedEmpLeft] = useState<RecentEmployee | null>(
		null,
	);
	const [selectedNewJoiner, setSelectedNewJoiner] =
		useState<RecentEmployee | null>(null);

	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-3">
			<ListCard
				icon={UserPlus}
				title="New Joiners"
				header={
					<Tabs
						value={newJoinerType}
						onValueChange={(v) => onNewJoinerTypeChange(v as "S" | "W")}
					>
						<TabsList variant="line" className="h-7">
							<TabsTrigger value="S" className="text-[11px] px-2">
								Staff
							</TabsTrigger>
							<TabsTrigger value="W" className="text-[11px] px-2">
								Worker
							</TabsTrigger>
						</TabsList>
					</Tabs>
				}
			>
				{newJoiners.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{newJoiners.map((emp, idx) => (
							<EmployeeRow
								key={`nj-${emp.emplCode}-${idx}`}
								employee={emp}
								onClick={() => setSelectedNewJoiner(emp)}
							/>
						))}
					</ul>
				)}
			</ListCard>
			<ListCard
				icon={Users}
				title="Recently Left"
				header={
					<Tabs
						value={employeeType}
						onValueChange={(v) => onEmployeeTypeChange(v as "S" | "W")}
					>
						<TabsList variant="line" className="h-7">
							<TabsTrigger value="S" className="text-[11px] px-2">
								Staff
							</TabsTrigger>
							<TabsTrigger value="W" className="text-[11px] px-2">
								Worker
							</TabsTrigger>
						</TabsList>
					</Tabs>
				}
			>
				{empLeft.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{empLeft.map((emp, idx) => (
							<EmployeeRow
								key={`${emp.emplCode}-${idx}`}
								employee={emp}
								onClick={() => setSelectedEmpLeft(emp)}
							/>
						))}
					</ul>
				)}
			</ListCard>

			<ListCard icon={Monitor} title="Latest assets">
				{recentAssets.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentAssets.map((asset) => (
							<AssetRow key={asset.code} asset={asset} />
						))}
					</ul>
				)}
			</ListCard>

			<EmployeeDetailsDialog
				employee={selectedEmpLeft}
				open={!!selectedEmpLeft}
				onOpenChange={(open) => {
					if (!open) setSelectedEmpLeft(null);
				}}
			/>
			<EmployeeDetailsDialog
				employee={selectedNewJoiner}
				open={!!selectedNewJoiner}
				onOpenChange={(open) => {
					if (!open) setSelectedNewJoiner(null);
				}}
			/>
		</div>
	);
}
