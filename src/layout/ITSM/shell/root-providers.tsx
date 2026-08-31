"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/toast";
import { TRPCProvider } from "@/trpc/provider";

import { ThemeProvider } from "./theme-provider";

export function RootProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute={"class"}
			defaultTheme={"system"}
			enableSystem={true}
			storageKey={"theme"}
		>
			<NuqsAdapter>
				<TRPCProvider>{children}</TRPCProvider>
				<Toaster />
			</NuqsAdapter>
		</ThemeProvider>
	);
}
