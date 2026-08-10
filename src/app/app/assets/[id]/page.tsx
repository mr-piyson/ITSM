"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AssetDetailsPage from "./AssetDetails";

interface Asset {
	id: number;
	code: string;
	type: string;
	deviceStatus: string;
	location: string;
	department: string;
	owner: string;
	empImg: string;
	purchaseDate: string;
	purchasePrice: string;
	deviceName: string;
	serialNumber: string;
	manufacturer: string;
	model: string;
	macAddress: string;
	ip: string;
	firmwareVer: string;
	warrantyDate: string;
	warrantyStatus: string;
	processor: string;
	os: string;
	memory: string;
	hdd: string;
	specification: string;
	image: string;
	verified: boolean;
	ownerChangeLogs: Array<{
		old: string;
		new: string;
		date: string;
		image: string;
	}>;
}

export default function AssetDetailPage() {
	const router = useRouter();
	const pathname = usePathname();
	const [asset, setAsset] = useState<Asset | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const id = pathname.split("/").pop();
		if (!id) {
			setError("Invalid asset ID");
			setLoading(false);
			return;
		}

		const fetchAsset = async () => {
			try {
				const response = await fetch(`/api/assets/${id}`);
				if (!response.ok) {
					if (response.status === 404) {
						setError("Asset not found");
					} else {
						setError("Failed to load asset");
					}
					return;
				}
				const data = await response.json();
				setAsset(data);
			} catch (err) {
				setError("Failed to load asset");
				console.error("Error fetching asset:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchAsset();
	}, [pathname]);

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold text-foreground">{error}</h2>
					<p className="text-gray-600 mt-2">
						{error === "Asset not found"
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

	return <AssetDetailsPage asset={asset!} />;
}
