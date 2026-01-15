export type RouteItem = {
  title: string;
  href?: string;
  icon: string;
  children?: RouteItem[];
};

export const routes = {
  appSidebar: [
    {
      title: "Dashboard",
      href: "/app/dashboard",
      icon: "icon-[solar--chart-square-linear]",
    },
    {
      title: "Tasks",
      href: "/app/tasks",
      icon: "icon-[solar--ticket-linear]",
    },
    {
      title: "Assets",
      href: "/app/assets",
      icon: "icon-[streamline--computer-pc-desktop]",
    },
    {
      title: "Printers",
      href: "/app/printers",
      icon: "icon-[streamline-plump--printer]",
    },
    {
      title: "Employees",
      href: "/app/employees",
      icon: "icon-[solar--user-circle-linear]",
    },
    {
      title: "Notifications",
      href: "/app/notifications",
      icon: "icon-[hugeicons--notification-01]",
    },
    {
      title: "Contracts",
      href: `/app/contracts`,
      icon: "icon-[hugeicons--contracts]",
    },
    {
      title: "Accounts",
      href: "/app/accounts",
      icon: "icon-[hugeicons--user-account]",
    },
    {
      title: "Stock",
      href: "/app/stock",
      icon: "icon-[solar--box-outline]",
    },
    {
      title: "Vendors",
      href: "/app/vendors",
      icon: "icon-[icon-park-outline--weixin-market]",
    },
    {
      title: "Reports",
      href: "/app/reports",
      icon: "icon-[iconoir--reports]",
    },
    {
      title: "Settings",
      href: "/app/settings",
      icon: "icon-[solar--settings-linear]",
    },
  ],
  settings: [
    {
      title: "Profile",
      href: "/app/settings/profile",
      icon: "icon-[lucide--user]",
    },
    {
      title: "Account",
      href: "/app/settings/account",
      icon: "icon-[lucide--credit-card]",
    },
    {
      title: "Security",
      href: "/app/settings/security",
      icon: "icon-[lucide--lock]",
    },
    {
      title: "Appearance",
      href: "/app/settings/appearance",
      icon: "icon-[lucide--palette]",
    },
  ],
  mesReports: [
    {
      title: "Panel",
      href: "/reports/panels",
      icon: "icon-[mingcute--board-line]",
    },
    {
      title: "Packages",
      href: "/reports/packages",
      icon: "icon-[solar--box-outline]",
    },
    {
      title: "Inspection Routes",
      href: "/reports/inspection-routes",
      icon: "icon-[lucide--route]",
    },
    {
      title: "Inspection Results",
      href: "/reports/inspection-results",
      icon: "icon-[fluent--screen-search-24-regular]",
    },
    {
      title: "Panel Time Out",
      href: "/reports/time-out",
      icon: "icon-[famicons--log-out-outline]",
      dev: true,
    },
    {
      title: "Shipments",
      href: "/reports/shipments",
      icon: "icon-[ph--shipping-container]",
      dev: true,
    },
    {
      title: "Jobs",
      href: "/reports/jobs",
      icon: "icon-[solar--suitcase-outline]",
      dev: true,
    },
  ],
  landingPage: [
    {
      title: "Documents",
      icon: "icon-[lucide--file-text]",
      children: [
        {
          title: "IT Request From",
          href: "/documents/IT-Request",
          icon: "icon-[lucide--file-text]",
        },
        {
          title: "Pity Cash Form",
          href: "/",
          icon: "icon-[lucide--file-text]",
        },
        {
          title: "HR Leave Request Form",
          href: "/",
          icon: "icon-[lucide--file-text]",
        },
      ],
    },
    {
      title: "Tools",
      icon: "icon-[lucide--file-text]",
    },
    {
      title: "MES Reports",
      href: "/reports",
      icon: "icon-[lucide--chart-bar-big]",
    },
  ],
} as Record<string, RouteItem[]>;
