import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
