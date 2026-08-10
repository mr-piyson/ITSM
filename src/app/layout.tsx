"use client";

import { Geist, Geist_Mono, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
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

export default function RootLayout(props: any) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("font-sans", inter.variable)}
		>
			<head>
				<title>ITSM - IT Service Management</title>
				<meta name="description" content="Best CRM system for your business to manage transactions" />
				<link rel="icon" href="/favicon.ico" />
			</head>
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
				<Toaster />
			</body>
		</html>
	);
}
