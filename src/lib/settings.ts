import { CreditCard, User, Lock, Palette, CarFront } from "lucide-react";

export const settingsNavItems = [
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
    title: "Vehicles",
    href: "/app/settings/vehicles",
    icon: CarFront,
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
];
