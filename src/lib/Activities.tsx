export const Activities = (role: string | undefined | null) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return [
        {
          title: "Dashboard",
          url: "/App/Dashboard",
          icon: "icon-[solar--chart-square-linear]",
        },
        {
          title: "Tasks",
          url: "/App/Tasks",
          icon: "icon-[solar--ticket-linear]",
        },
        {
          title: "Assets",
          url: "/App/Assets",
          icon: "icon-[streamline--computer-pc-desktop]",
        },
        {
          title: "Printers",
          url: "/App/Printers",
          icon: "icon-[streamline-plump--printer]",
        },
        {
          title: "Employees",
          url: "/App/Employees",
          icon: "icon-[solar--user-circle-linear]",
        },
        {
          title: "Notifications",
          url: "/App/Notifications",
          icon: "icon-[hugeicons--notification-01]",
        },
        {
          title: "Contracts",
          url: `/App/Contracts`,
          icon: "icon-[hugeicons--contracts]",
        },
        {
          title: "Accounts",
          url: "/App/Accounts",
          icon: "icon-[hugeicons--user-account]",
        },
        {
          title: "Stock",
          url: "/App/Stock",
          icon: "icon-[solar--box-outline]",
        },
        {
          title: "Vendors",
          url: "/App/Vendors",
          icon: "icon-[icon-park-outline--weixin-market]",
        },
        {
          title: "Reports",
          url: "/App/Reports",
          icon: "icon-[iconoir--reports]",
        },
        {
          title: "Settings",
          url: "/App/Settings",
          icon: "icon-[solar--settings-linear]",
        },
      ];
    case "User":
      return [
        {
          title: "Job Cards",
          url: "/App/JobCards",
          icon: "icon-[fluent--card-ui-24-regular]",
        },
      ];
    default:
      return [
        {
          title: "Dashboard",
          url: "/App/Dashboard",
          icon: "icon-[solar--chart-square-linear]",
        },
      ];
  }
};
