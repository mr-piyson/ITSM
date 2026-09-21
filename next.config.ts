import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["oracledb"],
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
