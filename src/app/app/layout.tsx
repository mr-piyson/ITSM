"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "@/trpc/react";

import App from "./App";

export default function Activity_Layout(props: any) {
	const router = useRouter();
	const { data: user, isPending } = trpc.auth.me.useQuery();

	useEffect(() => {
		if (!isPending && !user) {
			router.replace("/auth");
		}
	}, [isPending, user, router]);

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return <App>{props.children}</App>;
}
