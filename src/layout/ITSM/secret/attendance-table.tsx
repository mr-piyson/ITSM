"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
	type ICellRendererParams,
	type RowStyle,
} from "ag-grid-community";
import { toast } from "sonner";
import { Clock, Loader2, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	AttendanceLog,
	DailyAttendance,
} from "@/server/routers/ITSM/attendance";
import { useTableTheme } from "@/hooks/use-table-theme";
import { trpc } from "@/trpc/react";

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
	days: DailyAttendance[];
	personId: number;
	logs: (Omit<AttendanceLog, "datetime"> & { datetime: Date | string })[];
	onAdded: () => void;
};

type ActiveSide = "in" | "out" | "both";

function formatMinutes(minutes: number): string {
	if (minutes === 0) return "-";
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h > 0 && m > 0) return `${h}h ${m}m`;
	if (h > 0) return `${h}h`;
	return `${m}m`;
}

function StatusBadge({ status }: { status: DailyAttendance["status"] }) {
	if (status === "absent")
		return (
			<Badge
				variant="destructive"
				className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
			>
				Absent
			</Badge>
		);
	if (status === "late")
		return (
			<Badge
				variant="secondary"
				className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
			>
				Late
			</Badge>
		);
	if (status === "weekend")
		return (
			<Badge
				variant="secondary"
				className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
			>
				Weekend
			</Badge>
		);
	if (status === "future")
		return (
			<Badge
				variant="secondary"
				className="bg-blue-50 text-blue-400 dark:bg-blue-950 dark:text-blue-300"
			>
				Upcoming
			</Badge>
		);
	return (
		<Badge
			variant="secondary"
			className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
		>
			On Time
		</Badge>
	);
}

function getWeekday(dateStr: string): string {
	const [y, m, d] = dateStr.split("-");
	const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
	return dateObj.toLocaleDateString("en-US", { weekday: "long" });
}

function toLocalHHmm(date: Date | string): string {
	const dt = date instanceof Date ? date : new Date(date);
	const shifted = new Date(dt.getTime() + 3 * 60 * 60 * 1000);
	const h = String(shifted.getUTCHours()).padStart(2, "0");
	const m = String(shifted.getUTCMinutes()).padStart(2, "0");
	return `${h}:${m}`;
}

export function getDayPunches(dayLogs: Props["logs"]) {
	if (!dayLogs || dayLogs.length === 0) {
		return { inLog: null, outLog: null };
	}
	if (dayLogs.length === 1) {
		const single = dayLogs[0];
		if (single.deviceIp?.includes("172.18.1.80")) {
			return { inLog: null, outLog: single };
		}
		return { inLog: single, outLog: null };
	}
	// 2 or more punches
	const inLog =
		dayLogs.find((l) => l.deviceIp?.includes("172.18.1.82")) ?? dayLogs[0];
	const outCandidates = dayLogs.filter((l) => l.id !== inLog.id);
	const outLog =
		outCandidates
			.slice()
			.reverse()
			.find((l) => l.deviceIp?.includes("172.18.1.80")) ??
		outCandidates[outCandidates.length - 1] ??
		null;
	return { inLog, outLog };
}

export function SecretAttendanceTable({
	days,
	personId,
	logs,
	onAdded,
}: Props) {
	const tableTheme = useTableTheme();
	const saveLog = trpc.attendance.saveLog.useMutation();

	const [dialogDate, setDialogDate] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<ActiveSide>("in");
	const [inTime, setInTime] = useState("");
	const [outTime, setOutTime] = useState("");
	const [inLogId, setInLogId] = useState<number | null>(null);
	const [outLogId, setOutLogId] = useState<number | null>(null);
	const [deviceIp, setDeviceIp] = useState("");
	const [extraJson, setExtraJson] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const logsByDate = useMemo(() => {
		const map = new Map<string, Props["logs"]>();
		for (const log of logs) {
			const dt =
				log.datetime instanceof Date ? log.datetime : new Date(log.datetime);
			const d = new Date(dt.getTime() + 3 * 60 * 60 * 1000);
			const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
			const arr = map.get(key) ?? [];
			arr.push(log);
			map.set(key, arr);
		}
		// sort each day ascending
		for (const arr of map.values()) {
			arr.sort((a, b) => {
				const da =
					a.datetime instanceof Date ? a.datetime : new Date(a.datetime);
				const db =
					b.datetime instanceof Date ? b.datetime : new Date(b.datetime);
				return da.getTime() - db.getTime();
			});
		}
		return map;
	}, [logs]);

	const currentDayLogs = useMemo(() => {
		if (!dialogDate) return [];
		return logsByDate.get(dialogDate) ?? [];
	}, [dialogDate, logsByDate]);

	const currentDayPunches = useMemo(() => {
		return getDayPunches(currentDayLogs);
	}, [currentDayLogs]);

	const openDialog = (date: string, side: ActiveSide) => {
		const dayLogs = logsByDate.get(date) ?? [];
		const { inLog, outLog } = getDayPunches(dayLogs);

		setDialogDate(date);
		setActiveTab(side);
		setInTime(inLog ? toLocalHHmm(inLog.datetime) : "");
		setOutTime(outLog ? toLocalHHmm(outLog.datetime) : "");
		setInLogId(inLog ? inLog.id : null);
		setOutLogId(outLog ? outLog.id : null);

		if (side === "in") {
			setDeviceIp(inLog?.deviceIp ?? (inLog ? "" : "172.18.1.82:80"));
		} else if (side === "out") {
			setDeviceIp(outLog?.deviceIp ?? (outLog ? "" : "172.18.1.80:80"));
		} else {
			setDeviceIp("");
		}

		setExtraJson("");
		setError(null);
	};

	const handleTabChange = (side: ActiveSide) => {
		setActiveTab(side);
		setError(null);
		const { inLog, outLog } = currentDayPunches;
		if (side === "in") {
			setDeviceIp(inLog?.deviceIp ?? (inLog ? "" : "172.18.1.82:80"));
		} else if (side === "out") {
			setDeviceIp(outLog?.deviceIp ?? (outLog ? "" : "172.18.1.80:80"));
		} else {
			setDeviceIp("");
		}
	};

	const handleSubmit = async () => {
		if (!dialogDate) return;
		let extra: Parameters<typeof saveLog.mutateAsync>[0]["extra"];
		if (extraJson.trim()) {
			try {
				extra = JSON.parse(extraJson);
			} catch {
				setError("Advanced JSON is invalid.");
				return;
			}
		}

		setSubmitting(true);
		setError(null);
		try {
			const requests: Promise<unknown>[] = [];

			if (activeTab === "in") {
				if (!inTime.trim()) {
					setError("Please enter a check-in time.");
					setSubmitting(false);
					return;
				}
				const localDateTime = `${dialogDate}T${inTime.length === 5 ? `${inTime}:00` : inTime}`;
				if (inLogId) {
					requests.push(
						saveLog.mutateAsync({ id: inLogId, localDateTime, extra }),
					);
				} else {
					requests.push(
						saveLog.mutateAsync({
							personId,
							localDateTime,
							direction: "in",
							deviceIp: deviceIp.trim() || undefined,
							extra,
						}),
					);
				}
			} else if (activeTab === "out") {
				if (!outTime.trim()) {
					setError("Please enter a check-out time.");
					setSubmitting(false);
					return;
				}
				const localDateTime = `${dialogDate}T${outTime.length === 5 ? `${outTime}:00` : outTime}`;
				if (outLogId) {
					requests.push(
						saveLog.mutateAsync({ id: outLogId, localDateTime, extra }),
					);
				} else {
					requests.push(
						saveLog.mutateAsync({
							personId,
							localDateTime,
							direction: "out",
							deviceIp: deviceIp.trim() || undefined,
							extra,
						}),
					);
				}
			} else {
				// "both" tab
				if (inTime.trim()) {
					const localDateTime = `${dialogDate}T${inTime.length === 5 ? `${inTime}:00` : inTime}`;
					if (inLogId) {
						requests.push(
							saveLog.mutateAsync({ id: inLogId, localDateTime, extra }),
						);
					} else {
						requests.push(
							saveLog.mutateAsync({
								personId,
								localDateTime,
								direction: "in",
								deviceIp: deviceIp.trim() || undefined,
								extra,
							}),
						);
					}
				}

				if (outTime.trim()) {
					const localDateTime = `${dialogDate}T${outTime.length === 5 ? `${outTime}:00` : outTime}`;
					if (outLogId) {
						requests.push(
							saveLog.mutateAsync({ id: outLogId, localDateTime, extra }),
						);
					} else {
						requests.push(
							saveLog.mutateAsync({
								personId,
								localDateTime,
								direction: "out",
								deviceIp: deviceIp.trim() || undefined,
								extra,
							}),
						);
					}
				}

				if (requests.length === 0) {
					setError("Enter at least one time.");
					setSubmitting(false);
					return;
				}
			}

			await Promise.all(requests);

			const successMessage =
				activeTab === "in"
					? inLogId
						? "Check-in log updated"
						: "Check-in log added"
					: activeTab === "out"
						? outLogId
							? "Check-out log updated"
							: "Check-out log added"
						: "Attendance logs saved";

			toast.success(successMessage);
			setDialogDate(null);
			onAdded();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Network error");
		} finally {
			setSubmitting(false);
		}
	};

	const columnDefs = useMemo<ColDef<DailyAttendance>[]>(
		() => [
			{
				headerName: "Day",
				valueGetter: (p) => (p.data ? getWeekday(p.data.date) : ""),
				width: 105,
				sortable: false,
				filter: false,
			},
			{
				headerName: "Date",
				field: "date",
				width: 110,
				sortable: false,
				filter: false,
				cellClass: "font-mono text-xs",
			},
			{
				headerName: "Check In",
				field: "checkIn",
				width: 105,
				sortable: false,
				filter: false,
				cellRenderer: (p: ICellRendererParams<DailyAttendance>) => {
					if (!p.data) return null;
					const { inLog } = getDayPunches(logsByDate.get(p.data.date) ?? []);
					const val = p.data.checkIn;
					return (
						<button
							type="button"
							onClick={() => openDialog(p.data!.date, "in")}
							className="group flex h-full w-full cursor-pointer items-center text-left font-mono text-xs hover:underline"
							title={inLog ? `Edit Check-in (ID: ${inLog.id})` : "Add Check-in"}
						>
							<span
								className={
									val
										? "font-semibold text-foreground"
										: "text-muted-foreground"
								}
							>
								{val ?? "-"}
							</span>
						</button>
					);
				},
			},
			{
				headerName: "Check Out",
				field: "checkOut",
				width: 105,
				sortable: false,
				filter: false,
				cellRenderer: (p: ICellRendererParams<DailyAttendance>) => {
					if (!p.data) return null;
					const { outLog } = getDayPunches(logsByDate.get(p.data.date) ?? []);
					const val = p.data.checkOut;
					return (
						<button
							type="button"
							onClick={() => openDialog(p.data!.date, "out")}
							className="group flex h-full w-full cursor-pointer items-center text-left font-mono text-xs hover:underline"
							title={
								outLog ? `Edit Check-out (ID: ${outLog.id})` : "Add Check-out"
							}
						>
							<span
								className={
									val
										? "font-semibold text-foreground"
										: "text-muted-foreground"
								}
							>
								{val ?? "-"}
							</span>
						</button>
					);
				},
			},
			{
				headerName: "Status",
				field: "status",
				width: 105,
				sortable: false,
				filter: false,
				cellRenderer: (p: ICellRendererParams<DailyAttendance>) =>
					p.data ? <StatusBadge status={p.data.status} /> : null,
			},
			{
				headerName: "Late",
				field: "lateMinutes",
				width: 95,
				sortable: false,
				filter: false,
				cellClass: (p) =>
					p.value > 0
						? "font-mono text-xs text-red-600 dark:text-red-400"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (p) => formatMinutes(p.value),
			},
			{
				headerName: "Extra Hours",
				field: "extraMinutes",
				width: 110,
				sortable: false,
				filter: false,
				cellClass: (p) =>
					p.value > 0
						? "font-mono text-xs text-emerald-600 dark:text-emerald-400"
						: "font-mono text-xs text-muted-foreground",
				valueFormatter: (p) => formatMinutes(p.value),
			},
			{
				headerName: "Actions",
				width: 200,
				sortable: false,
				filter: false,
				cellRenderer: (p: ICellRendererParams<DailyAttendance>) => {
					if (!p.data) return null;
					const dayLogs = logsByDate.get(p.data.date) ?? [];
					const { inLog, outLog } = getDayPunches(dayLogs);
					const hasIn = Boolean(inLog);
					const hasOut = Boolean(outLog);

					return (
						<div className="flex h-full items-center gap-1.5">
							<Button
								size="sm"
								variant="outline"
								className={`h-7 px-2 text-xs flex items-center gap-1 ${
									hasIn
										? "border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60"
										: "border-dashed text-muted-foreground hover:text-foreground hover:border-solid"
								}`}
								onClick={() => openDialog(p.data!.date, "in")}
								title={hasIn ? "Edit check-in log" : "Add check-in log"}
							>
								{hasIn ? (
									<>
										<Pencil className="size-3" />
										<span>Edit In</span>
									</>
								) : (
									<>
										<Plus className="size-3" />
										<span>Add In</span>
									</>
								)}
							</Button>

							<Button
								size="sm"
								variant="outline"
								className={`h-7 px-2 text-xs flex items-center gap-1 ${
									hasOut
										? "border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/60"
										: "border-dashed text-muted-foreground hover:text-foreground hover:border-solid"
								}`}
								onClick={() => openDialog(p.data!.date, "out")}
								title={hasOut ? "Edit check-out log" : "Add check-out log"}
							>
								{hasOut ? (
									<>
										<Pencil className="size-3" />
										<span>Edit Out</span>
									</>
								) : (
									<>
										<Plus className="size-3" />
										<span>Add Out</span>
									</>
								)}
							</Button>
						</div>
					);
				},
			},
		],
		[logsByDate],
	);

	const formattedDialogDate = useMemo(() => {
		if (!dialogDate) return "";
		const [y, m, d] = dialogDate.split("-");
		return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
			"en-US",
			{
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
			},
		);
	}, [dialogDate]);

	const { inLog: activeInLog, outLog: activeOutLog } = currentDayPunches;

	return (
		<>
			<div
				className="ag-theme-alpine flex-1 min-h-0 rounded-none border"
				style={{ height: "100%" }}
			>
				<AgGridReact
					theme={tableTheme}
					rowData={days}
					columnDefs={columnDefs}
					getRowId={(params) => params.data.date}
					getRowStyle={(params): RowStyle | undefined => {
						if (params.data?.weekend) {
							return {
								background: "hsl(var(--muted) / 0.5)",
								color: "hsl(var(--muted-foreground))",
							};
						}
						return undefined;
					}}
					headerHeight={36}
					rowHeight={40}
					suppressRowHoverHighlight={false}
				/>
			</div>

			<Dialog
				open={dialogDate !== null}
				onOpenChange={(open) => !open && setDialogDate(null)}
			>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<Clock className="size-4 text-muted-foreground" />
							<span>Attendance Log — {formattedDialogDate}</span>
						</DialogTitle>
					</DialogHeader>

					<Tabs
						value={activeTab}
						onValueChange={(val) => handleTabChange(val as ActiveSide)}
					>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="in" className="flex items-center gap-1">
								{activeInLog ? (
									<Pencil className="size-3 text-blue-600 dark:text-blue-400" />
								) : (
									<Plus className="size-3 text-muted-foreground" />
								)}
								<span>{activeInLog ? "Edit In" : "Add In"}</span>
							</TabsTrigger>
							<TabsTrigger value="out" className="flex items-center gap-1">
								{activeOutLog ? (
									<Pencil className="size-3 text-amber-600 dark:text-amber-400" />
								) : (
									<Plus className="size-3 text-muted-foreground" />
								)}
								<span>{activeOutLog ? "Edit Out" : "Add Out"}</span>
							</TabsTrigger>
							<TabsTrigger value="both">Both (In & Out)</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="grid gap-3 pt-1">
						{activeTab === "in" && (
							<>
								{activeInLog ? (
									<div className="rounded-none border border-blue-200 bg-blue-50/60 p-2 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
										Editing existing check-in punch (ID:{" "}
										<span className="font-mono font-bold">
											{activeInLog.id}
										</span>
										). Logged at{" "}
										<span className="font-mono font-bold">
											{toLocalHHmm(activeInLog.datetime)}
										</span>
										.
									</div>
								) : (
									<div className="rounded-none border border-dashed border-muted-foreground/30 bg-muted/20 p-2 text-xs text-muted-foreground">
										No check-in punch found for this date. Enter time to add a
										new check-in record.
									</div>
								)}

								<div className="space-y-1">
									<Label htmlFor="in-time">Check-in time (HH:mm)</Label>
									<Input
										id="in-time"
										type="time"
										step="1"
										value={inTime}
										onChange={(e) => setInTime(e.target.value)}
										autoFocus
									/>
								</div>
							</>
						)}

						{activeTab === "out" && (
							<>
								{activeOutLog ? (
									<div className="rounded-none border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
										Editing existing check-out punch (ID:{" "}
										<span className="font-mono font-bold">
											{activeOutLog.id}
										</span>
										). Logged at{" "}
										<span className="font-mono font-bold">
											{toLocalHHmm(activeOutLog.datetime)}
										</span>
										.
									</div>
								) : (
									<div className="rounded-none border border-dashed border-muted-foreground/30 bg-muted/20 p-2 text-xs text-muted-foreground">
										No check-out punch found for this date. Enter time to add a
										new check-out record.
									</div>
								)}

								<div className="space-y-1">
									<Label htmlFor="out-time">Check-out time (HH:mm)</Label>
									<Input
										id="out-time"
										type="time"
										step="1"
										value={outTime}
										onChange={(e) => setOutTime(e.target.value)}
										autoFocus
									/>
								</div>
							</>
						)}

						{activeTab === "both" && (
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1">
									<Label htmlFor="in-time" className="text-xs">
										Check-in time {inLogId ? "(Edit)" : "(New)"}
									</Label>
									<Input
										id="in-time"
										type="time"
										step="1"
										value={inTime}
										onChange={(e) => setInTime(e.target.value)}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="out-time" className="text-xs">
										Check-out time {outLogId ? "(Edit)" : "(New)"}
									</Label>
									<Input
										id="out-time"
										type="time"
										step="1"
										value={outTime}
										onChange={(e) => setOutTime(e.target.value)}
									/>
								</div>
							</div>
						)}

						<div className="space-y-1">
							<Label htmlFor="punch-device" className="text-xs">
								Device IP (optional)
							</Label>
							<Input
								id="punch-device"
								value={deviceIp}
								onChange={(e) => setDeviceIp(e.target.value)}
								placeholder={
									activeTab === "out"
										? "172.18.1.80:80 (Check-out device)"
										: "172.18.1.82:80 (Check-in device)"
								}
								className="font-mono text-xs"
							/>
						</div>

						<div className="space-y-1">
							<Label htmlFor="punch-extra" className="text-xs">
								Advanced (JSON, optional)
							</Label>
							<textarea
								id="punch-extra"
								value={extraJson}
								onChange={(e) => setExtraJson(e.target.value)}
								rows={2}
								className="w-full rounded-none border bg-background p-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								placeholder='{"major": 5, "minor": 75}'
							/>
						</div>

						{currentDayLogs.length > 0 && (
							<div className="space-y-1 rounded-none border bg-muted/20 p-2">
								<p className="text-[11px] font-medium text-muted-foreground">
									Punches recorded for this day ({currentDayLogs.length}):
								</p>
								<div className="max-h-24 space-y-1 overflow-y-auto pr-1">
									{currentDayLogs.map((l) => {
										const isIn = l.id === activeInLog?.id;
										const isOut = l.id === activeOutLog?.id;
										return (
											<div
												key={l.id}
												className="flex items-center justify-between text-[11px] font-mono text-muted-foreground"
											>
												<span className="font-semibold text-foreground">
													{toLocalHHmm(l.datetime)}
													{isIn ? " (In)" : isOut ? " (Out)" : ""}
												</span>
												<span>{l.deviceIp || "manual"}</span>
												<span className="text-muted-foreground/70">
													#{l.id}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{error ? (
							<p className="text-sm font-medium text-red-600 dark:text-red-400">
								{error}
							</p>
						) : null}
					</div>

					<DialogFooter className="pt-2">
						<Button
							variant="outline"
							onClick={() => setDialogDate(null)}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Saving...
								</>
							) : activeTab === "in" ? (
								inLogId ? (
									"Update Check-in"
								) : (
									"Add Check-in"
								)
							) : activeTab === "out" ? (
								outLogId ? (
									"Update Check-out"
								) : (
									"Add Check-out"
								)
							) : (
								"Save All Changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
