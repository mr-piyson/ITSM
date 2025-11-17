export const Activities = (role: string | undefined | null) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return [
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
      ];
    default:
      return [
        {
          title: "Dashboard",
          url: "/app/dashboard",
          icon: "icon-[solar--chart-square-linear]",
        },
      ];
  }
};
