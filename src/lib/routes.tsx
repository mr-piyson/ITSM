import {
	BarChart3,
	Boxes,
	CalendarDays,
	ClipboardList,
	CreditCard,
	Database,
	DraftingCompass,
	FileSignature,
	FileText,
	Keyboard,
	LayoutDashboard,
	Lock,
	Monitor,
	Mouse,
	PackageCheck,
	Printer,
	Server,
	ShoppingCart,
	Store,
	User,
	UserCheck,
	Wrench,
	type LucideIcon,
} from "lucide-react";

export type RouteItem = {
	title: string;
	href?: string;
	icon: LucideIcon; // Component type instead of string
	dev?: boolean;
	children?: RouteItem[];
};

export type RouteGroup = {
	label?: string;
	items: RouteItem[];
};

export const routes: {
	appSidebar: RouteGroup[];
	settings: RouteItem[];
	landingPage: RouteItem[];
} = {
	appSidebar: [
		{
			items: [
				{
					title: "Dashboard",
					href: "/app/dashboard",
					icon: LayoutDashboard,
				},
			],
		},
		{
			label: "Operations",
			items: [
				{
					title: "Assets",
					href: "/app/assets",
					icon: Monitor,
				},
				{
					title: "Booking",
					href: "/app/booking",
					icon: CalendarDays,
				},
				{
					title: "Provide",
					href: "/app/provide",
					icon: PackageCheck,
				},
			],
		},
		{
			label: "Procurement",
			items: [
				{
					title: "Purchase / Service",
					href: "/app/purchases",
					icon: ShoppingCart,
				},
			],
		},
		{
			label: "Infrastructure",
			items: [
				{
					title: "Printers",
					href: "/app/printers",
					icon: Printer,
				},
				{
					title: "Servers",
					href: "/app/servers",
					icon: Server,
				},
				{
					title: "Backup Tapes",
					href: "/app/tapes",
					icon: Database,
				},
			],
		},
		{
			label: "Inventory",
			items: [
				{
					title: "Stock",
					href: "/app/stock",
					icon: Boxes,
				},
			],
		},
		{
			label: "Directory",
			items: [
				{
					title: "Employees",
					href: "/app/employees",
					icon: UserCheck,
				},
				{
					title: "Vendors",
					href: "/app/vendors",
					icon: Store,
				},
				{
					title: "Contracts",
					href: "/app/contracts",
					icon: FileSignature,
				},
			],
		},
		{
			label: "Reports & Requests",
			items: [
				{
					title: "Reports",
					href: "/app/reports",
					icon: BarChart3,
				},
				{
					title: "Requests",
					href: "/app/requests",
					icon: ClipboardList,
				},
			],
		},
	],
	settings: [
		{
			title: "Profile",
			href: "/app/settings/profile",
			icon: User,
		},
		{
			title: "Account",
			href: "/app/settings/account",
			icon: CreditCard,
		},
		{
			title: "Security",
			href: "/app/settings/security",
			icon: Lock,
		},
	],
	landingPage: [
		{
			title: "Documents",
			icon: FileText,
			children: [
				{
					title: "IT Request From",
					href: "/documents/it-request",
					icon: FileText,
				},
				{
					title: "Pity Cash Form",
					href: "/",
					icon: FileText,
				},
				{
					title: "HR Leave Request Form",
					href: "/",
					icon: FileText,
				},
			],
		},
		{
			title: "Tools",
			icon: Wrench,
			href: "downloads/keyboard Tester.exe",
			children: [
				{
					title: "Keyboard Tester Tool",
					icon: Keyboard,
					href: "downloads/keyboard Tester.exe",
				},
				{
					title: "Mouse Tester Tool",
					icon: Mouse,
					href: "/tools/mouse-tester",
				},
			],
		},
		{
			title: "MES Reports",
			href: "http://172.18.1.140:3000/reports",
			icon: BarChart3,
		},
		{
			title: "Engineering",
			icon: DraftingCompass,
		},
	],
};
