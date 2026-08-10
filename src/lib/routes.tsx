import {
	LayoutDashboard,
	Monitor,
	Printer,
	UserCheck,
	Table,
	User,
	CreditCard,
	Lock,
	Palette,
	Layout,
	Package,
	Route as RouteIcon,
	Search,
	LogOut,
	Container,
	Briefcase,
	FileText,
	Wrench,
	Keyboard,
	Mouse,
	BarChart3,
	DraftingCompass,
	type LucideIcon,
} from "lucide-react";

export type RouteItem = {
	title: string;
	href?: string;
	icon: LucideIcon; // Component type instead of string
	dev?: boolean;
	children?: RouteItem[];
};

export const routes: Record<string, RouteItem[]> = {
	appSidebar: [
		{
			title: "Dashboard",
			href: "/app/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Assets",
			href: "/app/assets",
			icon: Monitor,
		},
		{
			title: "Printers",
			href: "/app/printers",
			icon: Printer,
		},
		{
			title: "Employees",
			href: "/app/employees",
			icon: UserCheck,
		},
		{
			title: "Attendance",
			href: "/app/attendance",
			icon: Table,
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
		{
			title: "Appearance",
			href: "/app/settings/appearance",
			icon: Palette,
		},
	],
	landingPage: [
		{
			title: "Documents",
			icon: FileText,
			children: [
				{
					title: "IT Request From",
					href: "/documents/IT-Request",
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
