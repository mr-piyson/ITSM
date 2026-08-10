"use client";

import { format, subWeeks } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface TaskRow {
	GroupID: string;
	Description: string;
	TaskID: string;
	Name: string;
	CompleteDate: Date | null;
	taskStartDate: Date | null;
}

interface GroupedEco {
	GroupID: string;
	tasks: Record<string, TaskRow>;
}

function EngineerWorkbenchContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const defaultFromDate = format(subWeeks(new Date(), 1), "yyyy-MM-dd");
	const fromDate = searchParams.get("fromDate") || defaultFromDate;
	const groupName = searchParams.get("groupName") || "";

	const [groupedData, setGroupedData] = useState<GroupedEco[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(
		searchParams.get("fromDate") !== null || searchParams.get("groupName") !== null,
	);

	const [fromDateInput, setFromDateInput] = useState(fromDate);
	const [groupNameInput, setGroupNameInput] = useState(groupName);

	useEffect(() => {
		if (!hasSearched) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams();
				if (fromDate) params.set("fromDate", fromDate);
				if (groupName) params.set("groupName", groupName);

				const res = await fetch(`/api/engineer-workbench?${params.toString()}`);
				if (res.ok) {
					const data = await res.json();
					setGroupedData(data.groupedData || []);
				}
			} catch (error) {
				console.error("Failed to fetch engineer workbench data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [hasSearched, fromDate, groupName]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams();
		if (fromDateInput) params.set("fromDate", fromDateInput);
		if (groupNameInput) params.set("groupName", groupNameInput);
		router.push(`/tools/engineerWorkbench?${params.toString()}`);
		setHasSearched(true);
	};

	const renderTaskCell = (task?: TaskRow) => {
		if (!task)
			return (
				<TableCell className="border-x text-center text-muted-foreground">
					-
				</TableCell>
			);

		const isComplete = !!task.CompleteDate;

		return (
			<TableCell
				className={`border-x text-xs ${!isComplete ? "bg-red-300/30" : "bg-green-300/30"}`}
			>
				<div className="flex flex-col gap-1">
					<span>
						<span className="font-semibold">Assigned to:</span>{" "}
						{task.Name || "Unassigned"}
					</span>
					<span>
						<span className="font-semibold">Assigned date:</span>{" "}
						{task.taskStartDate
							? format(new Date(task.taskStartDate), "yyyy-MM-dd")
							: "N/A"}
					</span>
					<span>
						<span className="font-semibold">Complete date:</span>{" "}
						{isComplete
							? format(new Date(task.CompleteDate!), "yyyy-MM-dd")
							: "Pending"}
					</span>
				</div>
			</TableCell>
		);
	};

	return (
		<div className="">
			<Card className="bg-bfg text-white border-none border-t-0! shadow-md">
				<CardHeader>
					<CardTitle className="text-3xl font-bold tracking-tight">
						BFG INTERNATIONAL
					</CardTitle>
				</CardHeader>
			</Card>

			<div className="space-y-6 p-8">
				<h3 className="text-xl font-semibold ">
					Search for All Engineer Workbench Groups by Date/Group ID
				</h3>

				<form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6 pb-6">
					<div className="grid w-full max-w-sm items-center gap-2">
						<Label htmlFor="fromDate">Date From</Label>
						<Input
							type="date"
							id="fromDate"
							value={fromDateInput}
							onChange={(e) => setFromDateInput(e.target.value)}
						/>
					</div>

					<div className="grid w-full max-w-sm items-center gap-2">
						<Label htmlFor="groupName">Search by Group ID</Label>
						<Input
							type="text"
							id="groupName"
							placeholder="Enter Group ID..."
							value={groupNameInput}
							onChange={(e) => setGroupNameInput(e.target.value)}
						/>
					</div>

					<Button type="submit" size="lg" disabled={loading}>
						{loading ? "Searching..." : "SEARCH"}
					</Button>
				</form>

				{hasSearched && (
					<div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
							</div>
						) : groupedData.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-100">
										<TableHead className="w-37.5 font-bold text-slate-900 border-x">
											Group ID
										</TableHead>
										<TableHead className="text-center font-bold text-slate-900 border-x">
											Engineering Corrections
										</TableHead>
										<TableHead className="text-center font-bold text-slate-900 border-x">
											Review & Validate-Eng. Team
										</TableHead>
										<TableHead className="text-center font-bold text-slate-900 border-x">
											Review & Validate-Kitting Team
										</TableHead>
										<TableHead className="text-center font-bold text-slate-900 border-x">
											Review & Validate-Planning
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{groupedData.map((group) => (
										<TableRow key={group.GroupID}>
											<TableCell className="font-medium bg-background  border-x">
												{group.GroupID}
											</TableCell>
											{renderTaskCell(group.tasks["TS39"])}
											{renderTaskCell(group.tasks["TS40"])}
											{renderTaskCell(group.tasks["TS41"])}
											{renderTaskCell(group.tasks["TS42"])}
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="p-8 text-center text-red-500 font-medium text-lg">
								No Result!
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default function EngineerWorkbench() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			}
		>
			<EngineerWorkbenchContent />
		</Suspense>
	);
}
