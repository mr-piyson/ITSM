"use client";

import { SettingsSidebar } from "@/layout/ITSM/settings/settings-sidebar";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-full min-h-0 w-full flex-col md:flex-row">
			<SettingsSidebar />
			<main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
