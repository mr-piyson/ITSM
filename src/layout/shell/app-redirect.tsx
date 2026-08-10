"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/app/dashboard");
	}, [router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
		</div>
	);
}
