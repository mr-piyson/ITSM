import { AlertCircle, FileText, Monitor } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const REQUEST_KINDS = [
	{
		title: "Problem Request",
		description: "Report a software or hardware issue you are facing.",
		href: "/documents/requests/problem",
		icon: AlertCircle,
	},
	{
		title: "Assets Request",
		description: "Ask for a device, item or other asset you need for work.",
		href: "/documents/requests/asset",
		icon: Monitor,
	},
	{
		title: "IT Request Form",
		description: "Request access to software, hardware or shared files.",
		href: "/documents/it-request",
		icon: FileText,
	},
] as const;

export function RequestKindsPage() {
	return (
		<div className="min-h-screen bg-background px-4 py-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="space-y-1 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
					<p className="text-sm text-muted-foreground">
						Choose the kind of request you want to submit.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{REQUEST_KINDS.map(({ title, description, href, icon: Icon }) => (
						<Link key={href} href={href as Route} className="group">
							<Card className="h-full transition-colors group-hover:border-primary">
								<CardHeader>
									<span className="mb-2 flex size-10 items-center justify-center border bg-muted/50">
										<Icon className="size-5 text-muted-foreground" />
									</span>
									<CardTitle>{title}</CardTitle>
									<CardDescription>{description}</CardDescription>
								</CardHeader>
								<CardContent className="text-xs text-muted-foreground">
									Open form →
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
