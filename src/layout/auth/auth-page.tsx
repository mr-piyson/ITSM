"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketingNavbar } from "@/layout/shell/marketing-navbar";
import { trpc } from "@/trpc/react";

import { SignInForm } from "./sign-in-form";

export function AuthPage() {
	const router = useRouter();
	const { data: user, isLoading } = trpc.auth.me.useQuery();

	useEffect(() => {
		if (user) {
			router.replace("/app");
		}
	}, [user, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background text-card-foreground">
			<MarketingNavbar hideSignIn />
			<div className="flex w-full flex-1 items-center justify-center p-10 max-sm:p-4">
				<Tabs
					defaultValue="Sign-In"
					className="max-sm:w-full max-sm:p-2 sm:w-[420px]"
				>
					<TabsList className="grid w-full grid-cols-1">
						<TabsTrigger value="Sign-In">Sign In</TabsTrigger>
					</TabsList>
					<TabsContent value="Sign-In">
						<SignInForm />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
