import {
	BarChart3,
	Boxes,
	CalendarDays,
	Camera,
	ClipboardList,
	CreditCard,
	Clock,
	Database,
	FileSignature,
	FileText,
	HandHelping,
	Keyboard,
	LayoutDashboard,
	Lock,
	Mail,
	Monitor,
	Mouse,
	Printer,
	Server,
	ShoppingCart,
	Store,
	User,
	UserCheck,
	Users,
	Wrench,
	Zap,
	type LucideIcon,
} from "lucide-react";

export type RouteItem = {
	title: string;
	href?: string;
	icon: LucideIcon; // Component type instead of string
	description?: string;
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
					icon: HandHelping,
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
			label: "HR",
			items: [
				{
					title: "Attendance",
					href: "/app/attendance",
					icon: Clock,
				},
				{
					title: "Photo Sync",
					href: "/app/sync-photos",
					icon: Camera,
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
		{
			label: "Settings",
			items: [
				{
					title: "Settings",
					href: "/app/settings",
					icon: Mail,
				},
			],
		},
	],
	settings: [
		{
			title: "Mail",
			href: "/app/settings/mail",
			icon: Mail,
			description: "SMTP server, sender, recipients and notifications",
		},
		{
			title: "Profile",
			href: "/app/settings/profile",
			icon: User,
			description: "Your personal details and preferences",
		},
		{
			title: "Account",
			href: "/app/settings/account",
			icon: CreditCard,
			description: "Account and billing information",
		},
		{
			title: "Users",
			href: "/app/settings/users",
			icon: Users,
			description: "Manage system users and access",
		},
		{
			title: "Security",
			href: "/app/settings/security",
			icon: Lock,
			description: "Password, sign-in and security options",
		},
		{
			title: "Health",
			href: "/app/settings/health",
			icon: Zap,
			description: "Database connection and system status",
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
			href: "downloads/keyboard-tester.exe",
			children: [
				{
					title: "Keyboard Tester Tool",
					icon: Keyboard,
					href: "downloads/keyboard-tester.exe",
				},
				{
					title: "Mouse Tester Tool",
					icon: Mouse,
					href: "/tools/mouse-tester",
				},
			],
		},
	],
};
