import type { employees } from "@prisma/client";
import { Search, User } from "lucide-react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getAllEmployees } from "@/server/employee";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const ITEM_HEIGHT = 64; // Height of each employee item in pixels
const VISIBLE_ITEMS = 8; // Number of items visible at once

const EmployeeItem = React.memo(
	({ employee, isSelected, onClick, onMouseEnter }) => (
		<div
			className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
				isSelected ? "bg-card border-l-4 border-primary" : "hover:bg-card/50"
			} ${employee.inActive ? "opacity-50" : ""}`}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			style={{ height: `${ITEM_HEIGHT}px` }}
		>
			<Avatar className="size-12">
				<AvatarFallback>
					<User className="w-6 h-6 text-gray-500" />
				</AvatarFallback>
				{employee.image && (
					<AvatarImage
						src={`http://iss.bfginternational.com/ISS/itemsImages/${employee.image}`}
					/>
				)}
			</Avatar>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<p className="font-medium text-sm truncate">{employee.name}</p>
					{employee.inActive && (
						<span className="text-xs bg-background text-destructive px-2 py-0.5 rounded">
							Inactive
						</span>
					)}
				</div>
				<p className="text-xs text-gray-500 truncate">
					ID: {employee.empID} • {employee.email}
				</p>
			</div>
		</div>
	),
);

EmployeeItem.displayName = "EmployeeItem";

type EmployeeSelectDialogProps = {
	onSelect?: (employee: employees) => void;
	children?: React.ReactNode;
};

export function EmployeeSelectDialog(props: EmployeeSelectDialogProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [deferredSearch, setDeferredSearch] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState<employees | null>(
		null,
	);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [isPending, startTransition] = useTransition();

	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const [employees, setEmployees] = useState<employees[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchEmployees() {
			try {
				const data = await getAllEmployees();
				setEmployees(data);
			} catch (error) {
				console.error("Failed to fetch employees:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchEmployees();
	}, []);

	// Debounce search with useTransition for non-blocking updates
	useEffect(() => {
		startTransition(() => {
			setDeferredSearch(search);
		});
	}, [search]);

	// Filter employees based on deferred search - memoized for performance
	const filteredEmployees = useMemo(() => {
		if (!deferredSearch) return employees;

		const searchLower = deferredSearch.toLowerCase();
		return employees.filter(
			(emp) =>
				emp.name.toLowerCase().includes(searchLower) ||
				emp.empID.toString().includes(deferredSearch) ||
				emp.email?.toLowerCase().includes(searchLower),
		);
	}, [deferredSearch, employees]);

	// Virtual scrolling calculations
	const { visibleItems, totalHeight, offsetY } = useMemo(() => {
		const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 1); // -1 for buffer above
		const end = Math.min(
			start + VISIBLE_ITEMS + 3, // +3 for buffer (1 above, 2 below)
			filteredEmployees.length,
		);

		return {
			visibleItems: filteredEmployees.slice(start, end).map((emp, idx) => ({
				employee: emp,
				index: start + idx,
			})),
			totalHeight: filteredEmployees.length * ITEM_HEIGHT,
			offsetY: start * ITEM_HEIGHT,
		};
	}, [filteredEmployees, scrollTop]);

	// Reset highlighted index when search changes
	useEffect(() => {
		setHighlightedIndex(0);
		setScrollTop(0);
		if (listRef.current) {
			listRef.current.scrollTop = 0;
		}
	}, [deferredSearch]);

	// Scroll highlighted item into view
	useEffect(() => {
		if (!open || !listRef.current) return;

		const itemTop = highlightedIndex * ITEM_HEIGHT;
		const itemBottom = itemTop + ITEM_HEIGHT;
		const viewportTop = listRef.current.scrollTop;
		const viewportBottom = viewportTop + ITEM_HEIGHT * VISIBLE_ITEMS;

		if (itemTop < viewportTop) {
			listRef.current.scrollTop = itemTop;
		} else if (itemBottom > viewportBottom) {
			listRef.current.scrollTop = itemBottom - ITEM_HEIGHT * VISIBLE_ITEMS;
		}
	}, [highlightedIndex, open]);

	// Focus search input when dialog opens
	useEffect(() => {
		if (open && searchInputRef.current && !isLoading) {
			setTimeout(() => searchInputRef.current?.focus(), 100);
		}
	}, [open, isLoading]);

	const handleSelect = useCallback((employee: employees) => {
		setSelectedEmployee(employee);
		setOpen(false);
		setSearch("");
		setDeferredSearch("");
		props.onSelect?.(employee);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (filteredEmployees.length === 0) return;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev < filteredEmployees.length - 1 ? prev + 1 : prev,
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
					break;
				case "Enter":
					e.preventDefault();
					if (filteredEmployees[highlightedIndex]) {
						handleSelect(filteredEmployees[highlightedIndex]);
						// Call onSelect prop if provided
					}
					break;
				case "Escape":
					setOpen(false);
					setSearch("");
					setDeferredSearch("");
					break;
			}
		},
		[filteredEmployees, highlightedIndex, handleSelect],
	);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const newScrollTop = e.currentTarget.scrollTop;
		setScrollTop(newScrollTop);
	}, []);

	const handleMouseEnter = useCallback((index: number) => {
		setHighlightedIndex(index);
	}, []);

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{props.children ?? (
						<Button variant="outline" className="w-full justify-start">
							Select Employee
						</Button>
					)}
				</DialogTrigger>
				<DialogContent className="max-w-2xl h-[80vh] p-0 flex flex-col overflow-hidden ">
					<DialogHeader className="p-6 pb-4 bg-card">
						<DialogTitle>Select Employee</DialogTitle>
					</DialogHeader>

					{/* Search Bar */}
					<div className="px-6 pb-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 " />
							<input
								ref={searchInputRef}
								type="text"
								placeholder="Search by name, ID, or email..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={handleKeyDown}
								className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoComplete="off"
								autoCorrect="off"
								autoFocus
							/>
						</div>
					</div>

					{/* Employee List with Virtual Scrolling */}
					<div
						ref={listRef}
						className="flex-1 overflow-y-auto border-t"
						style={{ height: `${ITEM_HEIGHT * VISIBLE_ITEMS}px` }}
						onScroll={handleScroll}
					>
						{isLoading ? (
							<div className="p-8 text-center text-gray-500">
								<p>Loading employees...</p>
							</div>
						) : filteredEmployees.length > 0 ? (
							<div style={{ height: `${totalHeight}px`, position: "relative" }}>
								<div
									style={{
										transform: `translateY(${offsetY}px)`,
									}}
								>
									{visibleItems.map(({ employee, index }) => (
										<EmployeeItem
											key={employee.id}
											employee={employee}
											isSelected={index === highlightedIndex}
											onClick={() => handleSelect(employee)}
											onMouseEnter={() => handleMouseEnter(index)}
										/>
									))}
								</div>
							</div>
						) : (
							<div className="p-8 text-center text-gray-500">
								<p>No employees found</p>
							</div>
						)}
					</div>

					{/* Footer Info */}
					<div className="p-4 border-t bg-card text-xs text-card-foreground">
						Use ↑↓ arrow keys to navigate, Enter to select, Esc to close
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
