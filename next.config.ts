import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	async redirects() {
		return [
			{ source: "/app/:path*", destination: "/itsm/:path*", permanent: false },
			{ source: "/reports/:path*", destination: "/mes/:path*", permanent: false },
		];
	},
	async rewrites() {
		return {
			beforeFiles: [
			{ source: "/uploads/:path*", destination: "/api/files/:path*" },
			],
		};
	},
	serverExternalPackages: ["oracledb"],
	distDir: process.env.NEXT_DIST_DIR || ".next",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "iss.bfginternational.com",
				pathname: "**",
			},
			{
				protocol: "http",
				hostname: "intranet.bfginternational.com",
				pathname: "**",
			},
		],
	},
};

export default nextConfig;
