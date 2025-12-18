export const routes = {
  appSidebar: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: "icon-[solar--chart-square-linear]",
    },
    {
      title: "Tasks",
      url: "/app/tasks",
      icon: "icon-[solar--ticket-linear]",
    },
    {
      title: "Assets",
      url: "/app/assets",
      icon: "icon-[streamline--computer-pc-desktop]",
    },
    {
      title: "Printers",
      url: "/app/printers",
      icon: "icon-[streamline-plump--printer]",
    },
    {
      title: "Employees",
      url: "/app/employees",
      icon: "icon-[solar--user-circle-linear]",
    },
    {
      title: "Notifications",
      url: "/app/notifications",
      icon: "icon-[hugeicons--notification-01]",
    },
    {
      title: "Contracts",
      url: `/app/contracts`,
      icon: "icon-[hugeicons--contracts]",
    },
    {
      title: "Accounts",
      url: "/app/accounts",
      icon: "icon-[hugeicons--user-account]",
    },
    {
      title: "Stock",
      url: "/app/stock",
      icon: "icon-[solar--box-outline]",
    },
    {
      title: "Vendors",
      url: "/app/vendors",
      icon: "icon-[icon-park-outline--weixin-market]",
    },
    {
      title: "Reports",
      url: "/app/reports",
      icon: "icon-[iconoir--reports]",
    },
    {
      title: "Settings",
      url: "/app/settings",
      icon: "icon-[solar--settings-linear]",
    },
  ],
  settings: [
    {
      title: "Profile",
      url: "/app/settings/profile",
      icon: "icon-[lucide--user]",
    },
    {
      title: "Account",
      url: "/app/settings/account",
      icon: "icon-[lucide--credit-card]",
    },
    {
      title: "Security",
      url: "/app/settings/security",
      icon: "icon-[lucide--lock]",
    },
    {
      title: "Appearance",
      url: "/app/settings/appearance",
      icon: "icon-[lucide--palette]",
    },
  ],
  mesReports: [
    {
      title: "Panel",
      url: "/reports/panels",
      icon: "icon-[mingcute--board-line]",
    },
    {
      title: "Packages",
      url: "/reports/packages",
      icon: "icon-[solar--box-outline]",
    },
    {
      title: "Inspection Routes",
      url: "/reports/inspection-routes",
      icon: "icon-[lucide--route]",
    },
    {
      title: "Inspection Results",
      url: "/reports/inspection-results",
      icon: "icon-[fluent--screen-search-24-regular]",
    },
    {
      title: "Panel Traceability",
      url: "/reports/time-out",
      icon: "icon-[famicons--log-out-outline]",
      dev: true,
    },
    {
      title: "Shipments",
      url: "/reports/shipments",
      icon: "icon-[ph--shipping-container]",
      dev: true,
    },
  ],
} as const;
