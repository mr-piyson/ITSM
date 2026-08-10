"use client";

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
			<TRPCProvider>{children}</TRPCProvider>
			<Toaster />
		</ThemeProvider>
	);
}
