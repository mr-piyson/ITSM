"use client";

import { Boxes, Monitor, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	RecentAsset,
	RecentEmployee,
	RecentItem,
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
			<CardContent className="flex flex-col gap-0.5 p-1">{children}</CardContent>
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

function EmployeeRow({ employee }: { employee: RecentEmployee }) {
	const initials = (employee.emplPname ?? employee.emplCode)
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<li className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50">
			<div className="relative size-9 shrink-0">
				{employee.empPicPath ? (
					<img
						src={employee.empPicPath}
						alt={employee.emplPname ?? ""}
						className="size-9 rounded-full object-cover ring-2 ring-border"
					/>
				) : (
					<div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary ring-2 ring-border">
						{initials}
					</div>
				)}
				<span
					className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card ${employee.emplOnPayroll === "Y" ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
				/>
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="truncate text-sm font-medium leading-none">
						{employee.emplPname ?? employee.emplCode}
					</span>
					{employee.emplOnPayroll === "Y" && (
						<Badge
							variant="default"
							className="shrink-0 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 px-1.5 py-0 text-[10px] leading-normal"
						>
							Payroll
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					{employee.emplStaffWorkr === "S" ? (
						<Badge
							variant="outline"
							className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
						>
							Staff
						</Badge>
					) : employee.emplStaffWorkr === "W" ? (
						<Badge
							variant="outline"
							className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
						>
							Worker
						</Badge>
					) : null}
					{employee.emailId && (
						<span className="truncate text-[11px] text-muted-foreground">
							{employee.emailId}
						</span>
					)}
				</div>
			</div>
		</li>
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
				<Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] leading-normal">
					{asset.type}
				</Badge>
			)}
		</li>
	);
}

function ItemRow({ item }: { item: RecentItem }) {
	return (
		<li className="group flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted/50">
			<Link href="/app/stock" className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="truncate text-sm font-medium leading-none">
					{item.name}
				</span>
				<span className="truncate text-[11px] text-muted-foreground">
					{item.category}
				</span>
			</Link>
			<Badge
				variant={item.stock === 0 ? "destructive" : "outline"}
				className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
			>
				{item.stock}
			</Badge>
		</li>
	);
}

export function RecentLists({
	recentEmployees,
	recentAssets,
	recentItems,
	employeeType,
	onEmployeeTypeChange,
}: {
	recentEmployees: RecentEmployee[];
	recentAssets: RecentAsset[];
	recentItems: RecentItem[];
	employeeType: "S" | "W";
	onEmployeeTypeChange: (type: "S" | "W") => void;
}) {
	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-3">
			<ListCard
				icon={Users}
				title="Latest Employees Update"
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
				{recentEmployees.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentEmployees.map((emp, idx) => (
							<EmployeeRow key={`${emp.emplCode}-${idx}`} employee={emp} />
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
			<ListCard icon={Boxes} title="Latest items">
				{recentItems.length === 0 ? (
					<EmptyRow />
				) : (
					<ul>
						{recentItems.map((item) => (
							<ItemRow key={item.id} item={item} />
						))}
					</ul>
				)}
			</ListCard>
		</div>
	);
}
