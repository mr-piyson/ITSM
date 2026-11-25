import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function MisRequired() {
	return (
		<div className="min-h-screen bg-background px-4 py-8">
			<div className="mx-auto max-w-xl">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="size-5 text-destructive" />
							Your email is not in MIS
						</CardTitle>
						<CardDescription>
							Requests can only be submitted by an employee registered in MIS.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							href="/"
							className="inline-flex h-9 items-center justify-center border px-4 text-sm hover:bg-muted"
						>
							Back to home
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
