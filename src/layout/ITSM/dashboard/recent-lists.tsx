"use client";

import { useState } from "react";

import {
	Mail,
	Monitor,
	UserCheck,
	UserPlus,
	UserX,
	Users,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmployeeRow as SharedEmployeeRow } from "@/components/employee-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	RecentAsset,
	RecentEmployee,
} from "@/server/routers/ITSM/dashboard";

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
					type:
						employee.emplStaffWorkr === "S"
							? "Staff"
							: employee.emplStaffWorkr === "W"
								? "Worker"
								: null,
					onPayroll: employee.emplOnPayroll === "Y",
					image: employee.empPicPath,
				}}
			/>
		</li>
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
	if (!employee) return null;

	const initials = (employee.emplPname ?? employee.emplCode)
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Employee Details</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4 py-2">
					<div className="relative">
						{employee.empPicPath ? (
							<img
								src={employee.empPicPath}
								alt={employee.emplPname ?? ""}
								className="size-24 rounded-full object-cover ring-4 ring-border"
							/>
						) : (
							<div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary ring-4 ring-border">
								{initials}
							</div>
						)}
						<span
							className={`absolute bottom-1 right-1 size-3.5 rounded-full ring-2 ring-card ${employee.emplOnPayroll === "Y" ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
						/>
					</div>
					<div className="w-full space-y-2 text-center">
						<p className="text-base font-semibold">
							{employee.emplPname ?? "Unknown"}
						</p>
						<p className="font-mono text-xs text-muted-foreground">
							{employee.emplCode}
						</p>
					</div>
					<div className="w-full space-y-0 rounded-none border">
						<div className="flex items-center justify-between border-b px-3 py-2">
							<span className="flex items-center gap-2 text-xs text-muted-foreground">
								{employee.emplStaffWorkr === "S" ? (
									<UserCheck className="size-3.5" />
								) : (
									<UserX className="size-3.5" />
								)}
								Type
							</span>
							<Badge variant="outline" className="text-[11px]">
								{employee.emplStaffWorkr === "S"
									? "Staff"
									: employee.emplStaffWorkr === "W"
										? "Worker"
										: (employee.emplStaffWorkr ?? "-")}
							</Badge>
						</div>
						<div className="flex items-center justify-between border-b px-3 py-2">
							<span className="flex items-center gap-2 text-xs text-muted-foreground">
								<Mail className="size-3.5" />
								Email
							</span>
							<span className="max-w-[180px] truncate text-right text-xs font-medium">
								{employee.emailId || "-"}
							</span>
						</div>
						<div className="flex items-center justify-between px-3 py-2">
							<span className="text-xs text-muted-foreground">Payroll</span>
							<Badge
								variant={
									employee.emplOnPayroll === "Y" ? "default" : "secondary"
								}
								className={
									employee.emplOnPayroll === "Y"
										? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
										: ""
								}
							>
								{employee.emplOnPayroll === "Y"
									? "In Payroll"
									: "Not in Payroll"}
							</Badge>
						</div>
					</div>
				</div>
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
