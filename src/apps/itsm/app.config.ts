import type { AppDefinition } from "../types";

/**
 * ITSM app manifest. One entry per module folder under apps/itsm/.
 * `npm run gen:routes` derives Next.js page wrappers and tRPC wiring from this.
 */
export const itsmApp: AppDefinition = {
	id: "itsm",
	label: "IT Service Management",
	/** URL metadata only — Next's deployment-wide basePath stays in next.config.ts. */
	urlPrefix: "/itsm",
	modules: [
		// ── Sidebar ────────────────────────────────────────────────────────────
		{ id: "dashboard", title: "Dashboard", icon: "LayoutDashboard", section: "sidebar" },
		{ id: "assets", title: "Assets", icon: "Monitor", group: "Operations", section: "sidebar" },
		{ id: "booking", title: "Booking", icon: "CalendarDays", group: "Operations", section: "sidebar" },
		{ id: "provide", title: "Provide", icon: "HandHelping", group: "Operations", section: "sidebar" },
		{ id: "purchases", title: "Purchase / Service", icon: "ShoppingCart", group: "Procurement", section: "sidebar" },
		{ id: "printers", title: "Printers", icon: "Printer", group: "Infrastructure", section: "sidebar" },
		{ id: "servers", title: "Servers", icon: "Server", group: "Infrastructure", section: "sidebar" },
		{ id: "dccs", title: "DCCs", icon: "RadioTower", group: "Infrastructure", section: "sidebar" },
		{ id: "tapes", title: "Backup Tapes", icon: "Database", group: "Infrastructure", section: "sidebar" },
		{ id: "stock", title: "Stock", icon: "Boxes", group: "Inventory", section: "sidebar" },
		{ id: "employees", title: "Employees", icon: "UserCheck", group: "Directory", section: "sidebar" },
		{ id: "vendors", title: "Vendors", icon: "Store", group: "Directory", section: "sidebar" },
		{ id: "contracts", title: "Contracts", icon: "FileSignature", group: "Directory", section: "sidebar" },
		{ id: "attendance", title: "Attendance", icon: "Clock", group: "HR", section: "sidebar" },
		{ id: "sync-photos", title: "Photo Sync", icon: "Camera", group: "HR", section: "sidebar" },
		{ id: "reports", title: "Reports", icon: "BarChart3", group: "Reports & Requests", section: "sidebar" },
		{ id: "requests", title: "Requests", icon: "ClipboardList", group: "Reports & Requests", section: "sidebar" },
		{ id: "settings", title: "Settings", icon: "Mail", group: "Settings", section: "sidebar", hasRouter: false },

		// ── Settings ───────────────────────────────────────────────────────────
		{
			id: "mail", title: "Mail", icon: "Mail", section: "settings",
			segment: "settings/mail", routerKey: "mail",
			description: "SMTP server, sender, recipients and notifications",
		},
		{
			id: "profile", title: "Profile", icon: "User", section: "settings",
			segment: "settings/profile", hasRouter: false,
			description: "Your personal details and preferences",
		},
		{
			id: "users", title: "Users", icon: "Users", section: "settings",
			segment: "settings/users",
			description: "Manage system users and access",
		},
		{
			id: "access-control", title: "Access Control", icon: "ShieldCheck", section: "settings",
			segment: "settings/access-control", routerKey: "ac", requiresAc: true,
			description: "Hikvision users, groups and devices",
		},
		{
			id: "security", title: "Security", icon: "Lock", section: "settings",
			segment: "settings/security", hasRouter: false,
			description: "Password, sign-in and security options",
		},
		{
			id: "health", title: "Health", icon: "Zap", section: "settings",
			segment: "settings/health",
			description: "Database connection and system status",
		},

		// ── Landing page ───────────────────────────────────────────────────────
		{
			id: "requests-landing", title: "Requests", icon: "ClipboardList", section: "landing",
			href: "/documents/requests", hasPage: false, hasRouter: false,
		},
		{
			id: "documents", title: "Documents", icon: "FileText", section: "landing",
			hasPage: false, hasRouter: false,
			children: [
				/** Public form — deliberately stays outside the authenticated app shell. */
				{ id: "it-request", title: "IT Request Form", icon: "FileText", section: "landing", href: "/documents/it-request", hasPage: false, hasRouter: false },
				{ id: "pity-cash", title: "Pity Cash Form", icon: "FileText", section: "landing", href: "/", hasPage: false, hasRouter: false },
				{ id: "hr-leave", title: "HR Leave Request Form", icon: "FileText", section: "landing", href: "/", hasPage: false, hasRouter: false },
			],
		},
		{
			id: "tools", title: "Tools", icon: "Wrench", section: "landing",
			hasPage: false, hasRouter: false,
			children: [
				{ id: "keyboard-tester", title: "Keyboard Tester Tool", icon: "Keyboard", section: "landing", href: "downloads/keyboard-tester.exe", hasPage: false, hasRouter: false },
				{ id: "mouse-tester", title: "Mouse Tester Tool", icon: "Mouse", section: "landing", href: "/tools/mouse-tester", hasPage: false, hasRouter: false },
				{
					id: "asset-collector", title: "Asset Collector", icon: "Download", section: "landing",
					hasPage: false, hasRouter: false,
					children: [
						{ id: "collector-windows", title: "Asset Collector — Windows", icon: "Monitor", section: "landing", href: "downloads/ITSM-AssetCollector-Go.exe", hasPage: false, hasRouter: false },
						{ id: "collector-macos", title: "Asset Collector — macOS", icon: "MacIcon", section: "landing", href: "downloads/itsm-asset-collector-go-macos-arm64", hasPage: false, hasRouter: false },
						{ id: "collector-linux", title: "Asset Collector — Linux", icon: "LinuxIcon", section: "landing", href: "downloads/itsm-asset-collector-go-linux-x64", hasPage: false, hasRouter: false },
					],
				},
			],
		},

		// ── Pages without nav entries ──────────────────────────────────────────
		{ id: "home", title: "Home", icon: "LayoutDashboard", segment: "", hasRouter: false },
		{ id: "dccs-realtime", title: "DCC Realtime", icon: "RadioTower", segment: "dccs/realtime", hasPage: true, hasRouter: false },
		{ id: "employees-detail", title: "Employee", icon: "UserCheck", segment: "employees/[id]", hasRouter: false },
		{ id: "reports-assets", title: "Asset Report", icon: "Monitor", segment: "reports/assets", hasRouter: false },
		{ id: "reports-printers", title: "Printer Report", icon: "Printer", segment: "reports/printers", hasRouter: false },
		{ id: "reports-stock", title: "Stock Report", icon: "Boxes", segment: "reports/stock", hasRouter: false },
		{ id: "it-request-preview", title: "IT Request Preview", icon: "FileText", href: "/documents/it-request/preview", hasPage: false, hasRouter: false },
		{ id: "secret-attendance", title: "Attendance Log", icon: "ClipboardList", segment: "secret/attendance", hasRouter: false },

		// ── Routers without pages ──────────────────────────────────────────────
		{ id: "auth", title: "Auth", icon: "Lock", hasPage: false },
		{ id: "daily-report", title: "Daily Report", icon: "FileText", hasPage: false, routerKey: "dailyReport" },
		{ id: "shell", title: "Shell", icon: "LayoutDashboard", hasPage: false, hasRouter: false },
		{ id: "landing", title: "Landing", icon: "FileText", hasPage: false, hasRouter: false },
		{ id: "workbench", title: "Workbench", icon: "Wrench", hasPage: false, hasRouter: false },
	],
};
