import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { LoginDestination } from "@/lib/auth-destinations";

/** Microsoft-only sign-in used by the public request pages. */
export function RequestLogin({ next }: { next: LoginDestination }) {
	const microsoftHref = `/api/auth/microsoft?next=${encodeURIComponent(next)}` as Route;

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-10">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Sign in to submit a request
					</CardTitle>
					<CardDescription>
						Request forms are available only to Microsoft accounts registered in
						ISS and MIS.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						className="w-full font-bold"
						nativeButton={false}
						render={<Link href={microsoftHref} className="w-full justify-center" />}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="size-4">
							<path fill="#f35325" d="M1 1h10v10H1z" />
							<path fill="#81bc06" d="M12 1h10v10H12z" />
							<path fill="#05a6f0" d="M1 12h10v10H1z" />
							<path fill="#ffba08" d="M12 12h10v10H12z" />
						</svg>
						Sign in with Microsoft
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
