import { Geist, Geist_Mono, Inter } from "next/font/google";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { cn } from "@/lib/utils";

import { RootProviders } from "@/layout/ITSM/shell/root-providers";

import "./globals.css";

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
				<meta
					name="description"
					content="Best CRM system for your business to manage transactions"
				/>
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<RootProviders>{props.children}</RootProviders>
			</body>
		</html>
	);
}
