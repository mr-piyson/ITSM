"use client";

import Link from "next/link";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/routes";
import { useAcAccess } from "@/lib/ac/use-ac-access";

export function SettingsOverview() {
	const canAccessControl = useAcAccess();

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your workspace configuration, preferences and security.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{routes.settings.map(
					({ title, href, icon: Icon, description, requiresAc }) => {
						if (!href) return null;
						if (requiresAc && canAccessControl !== true) return null;
						return (
							<Link key={href} href={href} className="group">
								<Card className="h-full transition-colors group-hover:border-primary group-hover:bg-accent/40">
									<CardHeader>
										<div className="flex items-center gap-3">
											<span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
												<Icon className="size-5" />
											</span>
											<CardTitle className="text-base">{title}</CardTitle>
										</div>
										<CardDescription>{description}</CardDescription>
									</CardHeader>
								</Card>
							</Link>
						);
					},
				)}
			</div>
		</div>
	);
}
