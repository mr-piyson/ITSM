"use client";

import { usePathname, useRouter } from "next/navigation";

import { trpc } from "@/trpc/react";

import AssetDetailsPage from "./AssetDetails";

export default function AssetDetailPage() {
	const router = useRouter();
	const pathname = usePathname();

	const idParam = pathname.split("/").pop();
	const id = idParam ? Number(idParam) : NaN;

	const {
		data: asset,
		isLoading,
		isError,
	} = trpc.assets.byId.useQuery(
		{ id },
		{ enabled: Number.isInteger(id) && id > 0 },
	);

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			</div>
		);
	}

	if (isError || !asset) {
		const notFound = !asset && !isError;
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold text-foreground">
						{isError ? "Failed to load asset" : "Asset not found"}
					</h2>
					<p className="text-gray-600 mt-2">
						{notFound
							? "The requested asset could not be found."
							: "Please try again later."}
					</p>
					<button
						onClick={() => router.back()}
						className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return <AssetDetailsPage asset={asset} />;
}
