"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import App from "./App";

export default function Activity_Layout(props: any) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch("/api/auth/me");
				if (!res.ok) {
					router.replace("/auth");
					return;
				}
			} catch {
				router.replace("/auth");
				return;
			}
			setLoading(false);
		};
		checkAuth();
	}, [router]);

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return <App>{props.children}</App>;
}
