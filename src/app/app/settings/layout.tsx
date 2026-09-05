"use client";

import { SettingsSidebar } from "@/layout/ITSM/settings/settings-sidebar";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col md:flex-row">
			<SettingsSidebar />
			<main className="min-w-0 flex-1">{children}</main>
		</div>
	);
}
