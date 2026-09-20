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
	rewrites: async () => [
		{
			source: "/api/image-proxy",
			destination: "/api/image-proxy",
		},
	],
};

export default nextConfig;
