"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ChevronsUpDown, Warehouse } from "lucide-react";

import {
	EmployeeAvatar,
	getEmployeeInitials,
} from "@/components/employee-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { employeeImageUrl } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";

export type EmployeeOption = {
	emplCode: string;
	name: string;
	image: string | null;
};

const MAX_VISIBLE_RESULTS = 20;

/**
 * Base UI's AvatarImage preloads with `new Image()` on mount, which would fire
 * one request per row as soon as the popover opens. A plain lazy <img> keeps
 * those requests limited to the rows actually visible in the list.
 */
function PickerAvatar({ employee }: { employee: EmployeeOption }) {
	const src = employeeImageUrl(employee.image);
	const [failed, setFailed] = useState(false);

	return (
		<Avatar className="size-6 shrink-0">
			{src && !failed ? (
				// biome-ignore lint/performance/noImgElement: Base UI AvatarImage preloads every src eagerly; native lazy loading is required here.
				<img
					src={src}
					alt={employee.name}
					loading="lazy"
					decoding="async"
					fetchPriority="low"
					data-slot="avatar-image"
					className="aspect-square size-full rounded-full object-cover"
					onError={() => setFailed(true)}
				/>
			) : (
				<AvatarFallback className="text-[9px]">
					{getEmployeeInitials(employee.name, employee.emplCode)}
				</AvatarFallback>
			)}
		</Avatar>
	);
}

type EmployeeComboboxProps = {
	value: string | null;
	onSelect: (employee: EmployeeOption | null) => void;
	employees: EmployeeOption[];
	allowNone?: boolean;
	noneLabel?: string;
	noneHint?: string;
	placeholder?: string;
	className?: string;
	contentClassName?: string;
	disabled?: boolean;
};

export function EmployeeCombobox({
	value,
	onSelect,
	employees,
	allowNone = false,
	noneLabel = "None",
	noneHint,
	placeholder = "Search employee…",
	className,
	contentClassName,
	disabled,
}: EmployeeComboboxProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const selected = employees.find((employee) => employee.emplCode === value);

	const matches = useMemo(() => {
		const q = deferredSearch.trim().toLowerCase();
		if (!q) {
			return employees;
		}
		return employees.filter(
			(employee) =>
				employee.name.toLowerCase().includes(q) ||
				employee.emplCode.toLowerCase().includes(q),
		);
	}, [employees, deferredSearch]);

	const list = matches.slice(0, MAX_VISIBLE_RESULTS);

	const selectEmployee = (employee: EmployeeOption | null) => {
		onSelect(employee);
		setOpen(false);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) {
					setSearch("");
				}
			}}
		>
			<PopoverTrigger
				render={
					<Button
						variant="outline"
						disabled={disabled}
						className={cn("w-full justify-between", className)}
					/>
				}
			>
				{selected ? (
					<span className="flex min-w-0 items-center gap-2">
						<EmployeeAvatar
							image={selected.image}
							name={selected.name}
							code={selected.emplCode}
							className="size-5 shrink-0"
							fallbackClassName="text-[9px]"
						/>
						<span className="min-w-0 flex-1 truncate text-left">
							{selected.name}{" "}
							<span className="text-muted-foreground">
								({selected.emplCode})
							</span>
						</span>
					</span>
				) : value ? (
					<span className="min-w-0 flex-1 truncate text-left font-mono text-muted-foreground">
						{value}
					</span>
				) : allowNone ? (
					<span className="flex min-w-0 flex-1 items-center gap-2 text-left text-muted-foreground">
						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
							<Warehouse className="size-3" />
						</span>
						<span className="truncate">{noneLabel}</span>
					</span>
				) : (
					<span className="flex-1 truncate text-left text-muted-foreground">
						{placeholder}
					</span>
				)}
				<ChevronsUpDown className="size-4 shrink-0 opacity-50" />
			</PopoverTrigger>
			<PopoverContent className={cn("w-96 p-0", contentClassName)}>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search name / ID…"
						value={search}
						onValueChange={setSearch}
					/>
					{allowNone && (
						<CommandGroup className="border-b bg-popover">
							<CommandItem
								value="__none__"
								className="py-1.5"
								data-checked={!value}
								onSelect={() => selectEmployee(null)}
							>
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<Warehouse className="size-3.5" />
								</span>
								<span className="min-w-0 flex-1 truncate">{noneLabel}</span>
								{noneHint && (
									<span className="shrink-0 text-muted-foreground">
										{noneHint}
									</span>
								)}
							</CommandItem>
						</CommandGroup>
					)}
					<CommandList className="max-h-96">
						{list.length === 0 ? (
							<p className="py-6 text-center text-sm text-muted-foreground">
								No employee found
							</p>
						) : (
							<CommandGroup>
								{list.map((employee) => (
									<CommandItem
										key={employee.emplCode}
										value={employee.emplCode}
										className="py-1.5"
										data-checked={value === employee.emplCode}
										onSelect={() => selectEmployee(employee)}
									>
										<PickerAvatar employee={employee} />
										<span
											className="min-w-0 flex-1 truncate"
											title={employee.name}
										>
											{employee.name}
										</span>
										<span className="shrink-0 font-mono text-muted-foreground">
											{employee.emplCode}
										</span>
									</CommandItem>
								))}
								{matches.length > list.length && (
									<p className="px-2 py-1.5 text-[10px] text-muted-foreground">
										Showing first {MAX_VISIBLE_RESULTS} of {matches.length}—
										refine your search
									</p>
								)}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
