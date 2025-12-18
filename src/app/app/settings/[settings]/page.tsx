"use client";

import { useParams } from "next/navigation";

import { AccountSettings } from "@/app/app/settings/Account-settings";
import { AppearanceSettings } from "@/app/app/settings/Appearance-settings";
import { ProfileSettings } from "@/app/app/settings/profile/Profile-settings";
import { SecuritySettings } from "@/app/app/settings/Security-settings";

export default function SettingsTab() {
  const pathname = useParams();
  switch (pathname.settings) {
    case "Account":
      return <AccountSettings />;
    case "Security":
      return <SecuritySettings />;
    case "Appearance":
      return <AppearanceSettings />;
    case "Profile":
      return <ProfileSettings />;
    default:
      return <ProfileSettings />;
  }
}
