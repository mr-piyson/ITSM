import { Lock } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SecuritySettingsPage() {
	return (
		<div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Security</h1>
				<p className="text-sm text-muted-foreground">
					Manage your password, sign-in and security options.
				</p>
			</div>
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Lock className="size-4" />
						Security
					</CardTitle>
					<CardDescription>Coming soon.</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Security settings are not implemented yet.
				</CardContent>
			</Card>
		</div>
	);
}
