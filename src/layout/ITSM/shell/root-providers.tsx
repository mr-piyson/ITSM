"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster as SonnerToaster } from "sonner";

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
				<SonnerToaster
					richColors
					position="top-right"
					toastOptions={{
						style: {
							zIndex: 100000,
						},
					}}
					style={{ zIndex: 100000 }}
				/>
			</NuqsAdapter>
		</ThemeProvider>
	);
}
