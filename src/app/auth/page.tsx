"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AppLogo from "@/assets/icons/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/react";

import SignInTab from "./SignIn";

export default function Auth() {
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
		<div className=" relative items-center justify-center ">
			<div className=" max-md:hidden flex justify-between relative h-full flex-col bg-muted-foreground p-10 text-card-foreground lg:flex dark:border-r sm:hidden">
				<div className=" absolute inset-0 bg-muted " />
				<div className=" relative  flex items-center text-3xl font-medium gap-2">
					<AppLogo className="w-12 h-12" />
					<span>ITSM</span>
				</div>
				<div className="relative "></div>
			</div>
			<div className="w-full h-full flex flex-col justify-center items-center ">
				<Tabs
					defaultValue="Sign-In"
					className="max-sm:w-full max-sm:p-2 sm:w-[420px]"
				>
					<TabsList className="grid w-full grid-cols-1">
						<TabsTrigger value="Sign-In">Sign In</TabsTrigger>
					</TabsList>
					<TabsContent value="Sign-In">
						<SignInTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
