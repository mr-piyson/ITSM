"use client";

import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { employeeImageUrl, employeeStaffLabel } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

type EmployeesTableProps = {
	employees: EmployeeItem[];
};

function cellStyle(getSize: () => number, grow: boolean): CSSProperties {
	if (grow) {
		return { flex: 1, minWidth: 0 };
	}
	return { width: getSize(), flexShrink: 0 };
}

function EmployeeAvatar({ employee }: { employee: EmployeeItem }) {
	const imageUrl = employeeImageUrl(employee.picPath);
	return (
		<Avatar>
			{imageUrl && <AvatarImage src={imageUrl} alt={employee.name ?? ""} />}
			<AvatarFallback>{employee.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
		</Avatar>
	);
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
	const columns = useMemo<ColumnDef<EmployeeItem>[]>(
		() => [
			{
				id: "avatar",
				header: "",
				size: 44,
				cell: ({ row }) => <EmployeeAvatar employee={row.original} />,
			},
			{
				accessorKey: "emplCode",
				header: "ID",
				size: 100,
				cell: ({ getValue }) => (
					<span className="font-medium font-mono">{String(getValue())}</span>
				),
			},
			{
				accessorKey: "name",
				header: "Name",
				size: 220,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate font-medium">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "email",
				header: "Email",
				size: 220,
				cell: ({ getValue }) => (
					<span className="block min-w-0 truncate text-muted-foreground">
						{String(getValue() ?? "-")}
					</span>
				),
			},
			{
				accessorKey: "staffType",
				header: "Type",
				size: 110,
				cell: ({ getValue }) => {
					const type = getValue() as "S" | "W";
					const label = employeeStaffLabel(type);
					return (
						<span
							className={cn(
								"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
								type === "S"
									? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
									: "bg-muted text-muted-foreground",
							)}
						>
							{label}
						</span>
					);
				},
			},
			{
				accessorKey: "leftDate",
				header: "Status",
				size: 100,
				cell: ({ getValue }) => {
					const left = getValue();
					return (
						<span
							className={cn(
								"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
								left
									? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
									: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
							)}
						>
							{left ? "Left" : "Active"}
						</span>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: employees,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const parentRef = useRef<HTMLDivElement>(null);
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 52,
		overscan: 10,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border"
		>
			<table className="w-full min-w-[760px] caption-bottom text-xs">
				<TableHeader className="sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="flex w-full bg-muted hover:bg-muted"
							style={{ alignItems: "center" }}
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="flex items-center overflow-hidden border-r px-2 text-xs font-semibold last:border-r-0"
									style={cellStyle(
										() => header.getSize(),
										headerGroup.headers[headerGroup.headers.length - 1].id ===
											header.id,
									)}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						position: "relative",
						display: "block",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const row = rows[virtualRow.index];
						return (
							<TableRow
								key={row.id}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								className="flex"
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									height: `${virtualRow.size}px`,
									alignItems: "center",
								}}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className="flex items-center overflow-hidden border-r px-2 last:border-r-0"
										style={cellStyle(
											cell.column.getSize,
											row.getVisibleCells()[row.getVisibleCells().length - 1]
												.id === cell.id,
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						);
					})}
				</TableBody>
			</table>
		</div>
	);
}
