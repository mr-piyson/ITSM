"use client";

import { useParams } from "next/navigation";

import { AccountSettings } from "@/app/App/Settings/Account-settings";
import { AppearanceSettings } from "@/app/App/Settings/Appearance-settings";
import { ProfileSettings } from "@/app/App/Settings/Profile/Profile-settings";
import { SecuritySettings } from "@/app/App/Settings/Security-settings";

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
