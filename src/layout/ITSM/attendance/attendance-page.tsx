"use client";

import { useMemo, useState } from "react";

import { CalendarDays, Clock, Loader2, Search, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";

import { AttendanceTable } from "./attendance-table";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function formatMinutes(minutes: number): string {
	if (minutes === 0) {
		return "0m";
	}
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) {
		return `${h}h ${m}m`;
	}
	if (h > 0) {
		return `${h}h`;
	}
	return `${m}m`;
}

export function AttendancePage() {
	const now = new Date();
	const [empCodeInput, setEmpCodeInput] = useState("");
	const [empCode, setEmpCode] = useState<number | null>(null);
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());

	const { data: employee, isPending: employeePending } =
		trpc.attendance.employee.useQuery(
			{ empCode: empCode ?? 0 },
			{ enabled: empCode !== null },
		);

	const { data: summary, isPending: summaryPending } =
		trpc.attendance.summary.useQuery(
			{ personId: empCode ?? 0, month, year },
			{ enabled: empCode !== null },
		);

	const years = useMemo(() => {
		const current = now.getFullYear();
		return Array.from({ length: 5 }, (_, i) => current - i);
	}, []);

	const safeSide = useMemo(() => {
		if (!summary) return 0;
		return summary.totalLateMinutes - summary.totalExtraMinutes;
	}, [summary]);

	const handleSearch = () => {
		const parsed = Number.parseInt(empCodeInput, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			setEmpCode(parsed);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const isLoading = employeePending || summaryPending;
	const showResults = empCode !== null;

	const dateRangeLabel = useMemo(() => {
		const prevMonth = month === 1 ? 12 : month - 1;
		const prevYear = month === 1 ? year - 1 : year;
		const startLabel = new Date(prevYear, prevMonth - 1, 23).toLocaleDateString(
			"en-US",
			{ month: "short", day: "numeric" },
		);
		const endLabel = new Date(year, month - 1, 22).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		return `${startLabel} – ${endLabel}`;
	}, [month, year]);

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Attendance</h1>
						<p className="text-xs text-muted-foreground">
							{employee
								? `${employee.name} (ID: ${employee.empCode})`
								: "Enter an employee ID to view attendance"}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-end gap-3">
					<div className="flex items-center overflow-hidden rounded-none border bg-background px-2.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
						<Search
							data-icon="inline-start"
							className="size-4 shrink-0 text-muted-foreground"
						/>
						<Input
							type="number"
							value={empCodeInput}
							onChange={(e) => setEmpCodeInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Employee ID…"
							className="h-8 w-40 border-0 pl-0 shadow-none focus-visible:ring-0"
						/>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleSearch}
							disabled={!empCodeInput}
						>
							<Search className="size-4" />
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<Select
							value={String(month)}
							onValueChange={(v) => {
								if (v) setMonth(Number.parseInt(v, 10));
							}}
						>
							<SelectTrigger className="h-8 w-[130px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MONTHS.map((name, i) => (
									<SelectItem key={i + 1} value={String(i + 1)}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={String(year)}
							onValueChange={(v) => {
								if (v) setYear(Number.parseInt(v, 10));
							}}
						>
							<SelectTrigger className="h-8 w-[90px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{years.map((y) => (
									<SelectItem key={y} value={String(y)}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<p className="text-xs text-muted-foreground">{dateRangeLabel}</p>
				</div>
			</div>

			{!showResults ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
					<CalendarDays className="size-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Enter an employee ID to view attendance records
					</p>
				</div>
			) : isLoading ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : !summary ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
					<p className="text-sm text-muted-foreground">
						No data found for this employee
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-3 gap-2 md:grid-cols-5">
						<div className="flex items-center gap-2 rounded-none border p-2.5">
							<UserCheck className="size-4 text-muted-foreground" />
							<div>
								<p className="text-[10px] text-muted-foreground">Present</p>
								<p className="text-lg font-bold leading-tight">
									{summary.presentDays}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-none border p-2.5">
							<CalendarDays className="size-4 text-muted-foreground" />
							<div>
								<p className="text-[10px] text-muted-foreground">Absent</p>
								<p className="text-lg font-bold leading-tight text-red-600 dark:text-red-400">
									{summary.absentDays}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-none border p-2.5">
							<Clock className="size-4 text-muted-foreground" />
							<div>
								<p className="text-[10px] text-muted-foreground">Late</p>
								<p className="text-lg font-bold leading-tight text-amber-600 dark:text-amber-400">
									{formatMinutes(summary.totalLateMinutes)}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-none border p-2.5">
							<Clock className="size-4 text-muted-foreground" />
							<div>
								<p className="text-[10px] text-muted-foreground">Extra Hours</p>
								<p className="text-lg font-bold leading-tight text-emerald-600 dark:text-emerald-400">
									{formatMinutes(summary.totalExtraMinutes)}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-none border p-2.5">
							<Clock className="size-4 text-muted-foreground" />
							<div>
								<p className="text-[10px] text-muted-foreground">Safe Side</p>
								<p
									className={`text-lg font-bold leading-tight ${
										safeSide <= 0
											? "text-emerald-600 dark:text-emerald-400"
											: "text-red-600 dark:text-red-400"
									}`}
								>
									{formatMinutes(safeSide <= 0 ? 0 : safeSide)}
								</p>
							</div>
						</div>
					</div>

					{summary.days.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
							<p className="text-sm text-muted-foreground">
								No attendance records for this month
							</p>
						</div>
					) : (
						<AttendanceTable days={summary.days} />
					)}
				</>
			)}
		</div>
	);
}
