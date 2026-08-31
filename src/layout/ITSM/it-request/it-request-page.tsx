"use client";

import { RequestForm } from "./request-form";

export function ITRequestPage() {
	return (
		<div className="min-h-screen bg-background py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<RequestForm />
			</div>
		</div>
	);
}
