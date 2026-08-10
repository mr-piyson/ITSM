import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/ui/";
import { Toaster } from "@/components/ui/toast";

// @ts-expect-error
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ITSM - IT Service Management",
	description: "Best CRM system for your business to manage transactions",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
};

export default async function RootLayout(props: any) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("font-sans", inter.variable)}
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute={"class"}
					defaultTheme={"system"}
					enableSystem={true}
					storageKey={"theme"}
				>
					{props.children}
				</ThemeProvider>
				<Toaster
					position="top-center"
					toastOptions={{
						style: {
							background: "var(--normal-bg)",
							color: "var(--normal-text)",
							border: "1px solid var(--normal-border)",
						},
					}}
				/>
			</body>
		</html>
	);
}
