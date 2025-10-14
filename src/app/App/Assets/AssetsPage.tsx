"use client";

import {
	Building,
	Camera,
	ChevronDown,
	Filter,
	Grid3X3,
	HardDrive,
	Laptop,
	ListIcon,
	Monitor,
	Phone,
	Plus,
	Projector,
	Router,
	Search,
	Server,
	Shield,
	Tablet,
	Tv,
	Wifi,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const getColorClasses = (color: string) => {
	const colorMap = {
		blue: {
			bg: "bg-blue-500",
			bgHover: "hover:bg-blue-600",
			bgGradientFrom: "from-blue-100",
			bgGradientTo: "to-blue-200",
			bgGradientFromDark: "dark:from-blue-900/20",
			bgGradientToDark: "dark:to-blue-800/20",
			text: "text-blue-600",
			textDark: "dark:text-blue-400",
		},
		slate: {
			bg: "bg-slate-500",
			bgHover: "hover:bg-slate-600",
			bgGradientFrom: "from-slate-100",
			bgGradientTo: "to-slate-200",
			bgGradientFromDark: "dark:from-slate-900/20",
			bgGradientToDark: "dark:to-slate-800/20",
			text: "text-slate-600",
			textDark: "dark:text-slate-400",
		},
		pink: {
			bg: "bg-pink-500",
			bgHover: "hover:bg-pink-600",
			bgGradientFrom: "from-pink-100",
			bgGradientTo: "to-pink-200",
			bgGradientFromDark: "dark:from-pink-900/20",
			bgGradientToDark: "dark:to-pink-800/20",
			text: "text-pink-600",
			textDark: "dark:text-pink-400",
		},
		amber: {
			bg: "bg-amber-500",
			bgHover: "hover:bg-amber-600",
			bgGradientFrom: "from-amber-100",
			bgGradientTo: "to-amber-200",
			bgGradientFromDark: "dark:from-amber-900/20",
			bgGradientToDark: "dark:to-amber-800/20",
			text: "text-amber-600",
			textDark: "dark:text-amber-400",
		},
		violet: {
			bg: "bg-violet-500",
			bgHover: "hover:bg-violet-600",
			bgGradientFrom: "from-violet-100",
			bgGradientTo: "to-violet-200",
			bgGradientFromDark: "dark:from-violet-900/20",
			bgGradientToDark: "dark:to-violet-800/20",
			text: "text-violet-600",
			textDark: "dark:text-violet-400",
		},
		sky: {
			bg: "bg-sky-500",
			bgHover: "hover:bg-sky-600",
			bgGradientFrom: "from-sky-100",
			bgGradientTo: "to-sky-200",
			bgGradientFromDark: "dark:from-sky-900/20",
			bgGradientToDark: "dark:to-sky-800/20",
			text: "text-sky-600",
			textDark: "dark:text-sky-400",
		},
		purple: {
			bg: "bg-purple-500",
			bgHover: "hover:bg-purple-600",
			bgGradientFrom: "from-purple-100",
			bgGradientTo: "to-purple-200",
			bgGradientFromDark: "dark:from-purple-900/20",
			bgGradientToDark: "dark:to-purple-800/20",
			text: "text-purple-600",
			textDark: "dark:text-purple-400",
		},
		green: {
			bg: "bg-green-500",
			bgHover: "hover:bg-green-600",
			bgGradientFrom: "from-green-100",
			bgGradientTo: "to-green-200",
			bgGradientFromDark: "dark:from-green-900/20",
			bgGradientToDark: "dark:to-green-800/20",
			text: "text-green-600",
			textDark: "dark:text-green-400",
		},
		red: {
			bg: "bg-red-500",
			bgHover: "hover:bg-red-600",
			bgGradientFrom: "from-red-100",
			bgGradientTo: "to-red-200",
			bgGradientFromDark: "dark:from-red-900/20",
			bgGradientToDark: "dark:to-red-800/20",
			text: "text-red-600",
			textDark: "dark:text-red-400",
		},
		cyan: {
			bg: "bg-cyan-500",
			bgHover: "hover:bg-cyan-600",
			bgGradientFrom: "from-cyan-100",
			bgGradientTo: "to-cyan-200",
			bgGradientFromDark: "dark:from-cyan-900/20",
			bgGradientToDark: "dark:to-cyan-800/20",
			text: "text-cyan-600",
			textDark: "dark:text-cyan-400",
		},
		indigo: {
			bg: "bg-indigo-500",
			bgHover: "hover:bg-indigo-600",
			bgGradientFrom: "from-indigo-100",
			bgGradientTo: "to-indigo-200",
			bgGradientFromDark: "dark:from-indigo-900/20",
			bgGradientToDark: "dark:to-indigo-800/20",
			text: "text-indigo-600",
			textDark: "dark:text-indigo-400",
		},
		stone: {
			bg: "bg-stone-500",
			bgHover: "hover:bg-stone-600",
			bgGradientFrom: "from-stone-100",
			bgGradientTo: "to-stone-200",
			bgGradientFromDark: "dark:from-stone-900/20",
			bgGradientToDark: "dark:to-stone-800/20",
			text: "text-stone-600",
			textDark: "dark:text-stone-400",
		},
		lime: {
			bg: "bg-lime-500",
			bgHover: "hover:bg-lime-600",
			bgGradientFrom: "from-lime-100",
			bgGradientTo: "to-lime-200",
			bgGradientFromDark: "dark:from-lime-900/20",
			bgGradientToDark: "dark:to-lime-800/20",
			text: "text-lime-600",
			textDark: "dark:text-lime-400",
		},
		teal: {
			bg: "bg-teal-500",
			bgHover: "hover:bg-teal-600",
			bgGradientFrom: "from-teal-100",
			bgGradientTo: "to-teal-200",
			bgGradientFromDark: "dark:from-teal-900/20",
			bgGradientToDark: "dark:to-teal-800/20",
			text: "text-teal-600",
			textDark: "dark:text-teal-400",
		},
		yellow: {
			bg: "bg-yellow-500",
			bgHover: "hover:bg-yellow-600",
			bgGradientFrom: "from-yellow-100",
			bgGradientTo: "to-yellow-200",
			bgGradientFromDark: "dark:from-yellow-900/20",
			bgGradientToDark: "dark:to-yellow-800/20",
			text: "text-yellow-600",
			textDark: "dark:text-yellow-400",
		},
		orange: {
			bg: "bg-orange-500",
			bgHover: "hover:bg-orange-600",
			bgGradientFrom: "from-orange-100",
			bgGradientTo: "to-orange-200",
			bgGradientFromDark: "dark:from-orange-900/20",
			bgGradientToDark: "dark:to-orange-800/20",
			text: "text-orange-600",
			textDark: "dark:text-orange-400",
		},
		emerald: {
			bg: "bg-emerald-500",
			bgHover: "hover:bg-emerald-600",
			bgGradientFrom: "from-emerald-100",
			bgGradientTo: "to-emerald-200",
			bgGradientFromDark: "dark:from-emerald-900/20",
			bgGradientToDark: "dark:to-emerald-800/20",
			text: "text-emerald-600",
			textDark: "dark:text-emerald-400",
		},
		rose: {
			bg: "bg-rose-500",
			bgHover: "hover:bg-rose-600",
			bgGradientFrom: "from-rose-100",
			bgGradientTo: "to-rose-200",
			bgGradientFromDark: "dark:from-rose-900/20",
			bgGradientToDark: "dark:to-rose-800/20",
			text: "text-rose-600",
			textDark: "dark:text-rose-400",
		},
	} as const;

	return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const getAssetTypeConfig = (type: string) => {
	for (const category of Object.values(assetCategories)) {
		const found = category.find((t) => t.name === type);
		if (found) return found;
	}
	return { name: type, icon: Monitor, color: "default" as const };
};

import Link from "next/link";
import type { Asset } from "@/app/api/Assets/route";
import { assetCategories } from "@/lib/AssetsCategories";

export default function AssetsPage({ assets }: { assets: Asset[] }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const [displayCount, setDisplayCount] = useState(20);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const filteredAssets = useMemo(() => {
		let filtered = assets || [];

		if (selectedTypes.length > 0) {
			filtered = filtered.filter((asset) =>
				selectedTypes.includes(asset?.type ?? ""),
			);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(asset) =>
					asset.deviceName?.toLowerCase().includes(query) ||
					asset.manufacturer?.toLowerCase().includes(query) ||
					asset.code?.toLowerCase().includes(query) ||
					asset.serialNumber?.toLowerCase().includes(query) ||
					asset.owner?.toLowerCase().includes(query) ||
					asset.model?.toLowerCase().includes(query) ||
					`${asset.location} ${asset.department}`.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [assets, searchQuery, selectedTypes]);

	const displayedAssets = useMemo(() => {
		return filteredAssets.slice(0, displayCount);
	}, [filteredAssets, displayCount]);

	const toggleAssetType = useCallback((type: string) => {
		setSelectedTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
		);
	}, []);

	const clearAllFilters = useCallback(() => {
		setSelectedTypes([]);
		setSearchQuery("");
	}, []);

	const handleScroll = useCallback(() => {
		if (!scrollContainerRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } =
			scrollContainerRef.current;
		const isNearBottom = scrollTop + clientHeight >= scrollHeight - 1000;

		if (
			isNearBottom &&
			!isLoadingMore &&
			displayCount < filteredAssets.length
		) {
			setIsLoadingMore(true);
			setTimeout(() => {
				setDisplayCount((prev) => Math.min(prev + 20, filteredAssets.length));
				setIsLoadingMore(false);
			}, 100);
		}
	}, [displayCount, filteredAssets.length, isLoadingMore]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}
	}, [handleScroll]);

	useEffect(() => {
		setDisplayCount(20);
	}, []);

	return (
		<div className="container mx-auto p-6 space-y-6" ref={scrollContainerRef}>
			{/* Search and Controls */}
			<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background border-b border-border py-2">
				<div>
					{/* Search Bar, View Controls, and Add New Asset Button */}
					<div className="flex flex-wrap flex-row gap-4">
						<Button>
							<Plus className="h-4 w-4 " />
							<span className="max-sm:hidden">Add New Asset</span>
						</Button>

						<div className="relative flex-1 ">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name, code, serial, owner..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<div className="flex items-center gap-2 max-sm:hidden">
							<Popover
								open={categoryDropdownOpen}
								onOpenChange={setCategoryDropdownOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="gap-2 min-w-[120px] justify-between bg-transparent"
									>
										<div className="flex items-center gap-2">
											<Filter className="h-4 w-4" />
											<span>Categories</span>
											{selectedTypes.length > 0 && (
												<Badge
													variant="secondary"
													className="h-5 w-5 p-0 text-xs"
												>
													{selectedTypes.length}
												</Badge>
											)}
										</div>
										<ChevronDown className="h-4 w-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-0" align="start">
									<div className="p-4 border-b">
										<div className="flex items-center justify-between">
											<h4 className="font-medium">Filter by Asset Type</h4>
											{selectedTypes.length > 0 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={clearAllFilters}
													className="h-auto p-1 text-xs"
												>
													Clear All
												</Button>
											)}
										</div>
									</div>
									<div className="max-h-80 overflow-y-auto">
										{Object.entries(assetCategories).map(
											([category, types]) => (
												<div key={category} className="p-2">
													<div className="px-2 py-1 text-sm font-medium text-muted-foreground">
														{category}
													</div>
													<div className="space-y-1">
														{types.map((type) => {
															const Icon = type.icon;
															const isSelected = selectedTypes.includes(
																type.name,
															);
															const count = assets?.filter(
																(asset) => asset.type === type.name,
															).length;
															const colorClasses = getColorClasses(type.color);

															return (
																<div
																	key={type.name}
																	className="flex items-center space-x-3 px-2 py-2 hover:bg-muted/50 rounded-sm cursor-pointer"
																	onClick={() => toggleAssetType(type.name)}
																>
																	<Checkbox
																		checked={isSelected}
																		onChange={() => toggleAssetType(type.name)}
																		className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
																	/>
																	<div className="flex items-center gap-2 flex-1">
																		<Icon
																			className={`h-4 w-4 ${colorClasses.text} ${colorClasses.textDark}`}
																		/>
																		<span className="text-sm">{type.name}</span>
																	</div>
																	<Badge
																		variant="secondary"
																		className="h-5 px-2 text-xs"
																	>
																		{count}
																	</Badge>
																</div>
															);
														})}
													</div>
												</div>
											),
										)}
									</div>
								</PopoverContent>
							</Popover>

							<Separator orientation="vertical" className="h-6" />

							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("grid")}
							>
								<Grid3X3 className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "table" ? "default" : "outline"}
								size="sm"
								onClick={() => setViewMode("table")}
							>
								<ListIcon className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{(selectedTypes.length > 0 || searchQuery) && (
						<div className="flex flex-wrap items-center gap-2 mt-2">
							<span className="text-sm text-muted-foreground">
								Active filters:
							</span>
							{searchQuery && (
								<Badge variant="secondary" className="gap-1">
									Search: "{searchQuery}"
									<i
										onClick={() => setSearchQuery("")}
										className="icon-[proicons--cancel] size-3  cursor-pointer  rounded-sm"
									/>
								</Badge>
							)}
							{selectedTypes.map((type) => {
								const config = getAssetTypeConfig(type);
								const Icon = config.icon;
								return (
									<Badge key={type} variant="secondary" className="gap-1">
										<Icon className="h-3 w-3" />
										{type}
										<i
											className="icon-[proicons--cancel] size-3  cursor-pointer  rounded-sm"
											onClick={() => toggleAssetType(type)}
										/>
									</Badge>
								);
							})}
							<Button
								variant="ghost"
								size="sm"
								onClick={clearAllFilters}
								className="h-6 px-2 text-xs"
							>
								Clear all
							</Button>
						</div>
					)}

					<div className="flex items-center justify-between max-sm:hidden mt-2">
						<p className="text-sm text-muted-foreground">
							Showing {displayedAssets.length} of {filteredAssets.length} assets
							{selectedTypes.length > 0 &&
								` • ${selectedTypes.length} filter${
									selectedTypes.length > 1 ? "s" : ""
								} applied`}
						</p>
					</div>
				</div>
			</div>

			{/* Assets Display */}
			{viewMode === "grid" ? (
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{displayedAssets.map((asset) => (
							<AssetCard key={asset.id} asset={asset} />
						))}
					</div>

					{displayCount < filteredAssets.length && (
						<div className="flex justify-center py-8">
							{isLoadingMore ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									<span className="text-sm text-muted-foreground">
										Loading more assets...
									</span>
								</div>
							) : (
								<Button
									variant="outline"
									onClick={() =>
										setDisplayCount((prev) =>
											Math.min(prev + 20, filteredAssets.length),
										)
									}
								>
									Load More ({filteredAssets.length - displayCount} remaining)
								</Button>
							)}
						</div>
					)}
				</div>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Image</TableHead>
								<TableHead>Code</TableHead>
								<TableHead>Serial Number</TableHead>
								<TableHead>Device Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Owner</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayedAssets.map((asset) => {
								const typeConfig = getAssetTypeConfig(asset?.type ?? "");
								const Icon = typeConfig.icon;
								return (
									<TableRow key={asset.id}>
										<TableCell>
											{asset.image ? (
												<Avatar className="h-10 w-10">
													<AvatarFallback>
														<Icon className="h-5 w-5" />
													</AvatarFallback>
												</Avatar>
											) : (
												<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
													<Icon className="h-5 w-5" />
												</div>
											)}
										</TableCell>
										<TableCell className="font-medium">{asset.code}</TableCell>
										<TableCell>{asset.serialNumber}</TableCell>
										<TableCell>{asset.deviceName}</TableCell>
										<TableCell>
											<Badge variant="secondary" className="text-xs">
												<Icon className="h-3 w-3 mr-1" />
												{asset.type}
											</Badge>
										</TableCell>
										<TableCell>{asset.owner}</TableCell>
										<TableCell>
											<Button variant="link" size="sm">
												Details
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>

					{displayCount < filteredAssets.length && (
						<div className="p-4 border-t">
							<div className="flex justify-center">
								<Button
									variant="outline"
									onClick={() =>
										setDisplayCount((prev) =>
											Math.min(prev + 20, filteredAssets.length),
										)
									}
									disabled={isLoadingMore}
								>
									{isLoadingMore ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
											Loading...
										</>
									) : (
										`Load More (${
											filteredAssets.length - displayCount
										} remaining)`
									)}
								</Button>
							</div>
						</div>
					)}
				</Card>
			)}

			{filteredAssets.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No assets found matching your criteria.
					</p>
					{(selectedTypes.length > 0 || searchQuery) && (
						<Button
							variant="outline"
							className="mt-4 bg-transparent"
							onClick={clearAllFilters}
						>
							Clear all filters
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

function AssetCard({ asset }: { asset: Asset }) {
	const typeConfig = getAssetTypeConfig(asset?.type ?? "");
	const Icon = typeConfig.icon;
	const colorClasses = getColorClasses(typeConfig.color);

	return (
		<Card className="pt-0 h-full group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50 hover:border-primary overflow-hidden flex flex-col ">
			<div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
				{asset.image ? (
					<Image
						width={300}
						height={200}
						src={
							"http://iss.bfginternational.com/ISS/itemsImages/" + asset.image
						}
						alt={asset.deviceName ?? "Asset Image"}
						className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
						loading="lazy"
					/>
				) : (
					<div
						className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorClasses.bgGradientFrom} ${colorClasses.bgGradientTo} ${colorClasses.bgGradientFromDark} ${colorClasses.bgGradientToDark}`}
					>
						<Icon
							className={`h-16 w-16 ${colorClasses.text} ${colorClasses.textDark}`}
						/>
					</div>
				)}

				<div className="absolute bottom-3 left-3">
					<Badge
						className={`${colorClasses.bg} ${colorClasses.bgHover} text-white border-0 shadow-lg`}
					>
						<Icon className="h-3 w-3 mr-1" />
						{asset.type}
					</Badge>
				</div>
			</div>

			<CardHeader className="pb-3">
				<div className="space-y-2">
					<h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
						{asset.deviceName || "Unnamed Device"}
					</h3>
					<div className="flex items-center justify-between">
						<span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
							{asset.code}
						</span>
						<span className="text-xs text-muted-foreground">
							S/N: {asset.serialNumber || "Not specified"}
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0 flex-1 flex flex-col">
				<div className="space-y-4 flex-1">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={`http://iss.bfginternational.com/ISS/itemsImages/${asset.empImg}`}
										alt={asset.owner?.charAt(0) ?? "U"}
										className="object-cover"
									/>
									<AvatarFallback>
										{asset.owner?.charAt(0).toUpperCase() ?? "U"}
									</AvatarFallback>
								</Avatar>
								<span className="text-foreground">
									{asset.owner ?? "Unknown"}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Building className="h-4 w-4" />
								<span>{asset.location}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<span className="text-sm">🏢</span>
								<span>{asset.department}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
					<div className="flex flex-wrap gap-1">
						<Badge variant="secondary" className="text-xs">
							{asset.manufacturer}
						</Badge>
						{asset.ip && (
							<Badge variant="outline" className="text-xs font-mono">
								{asset.ip}
							</Badge>
						)}
					</div>
					<Link
						href={`/App/Assets/${asset.id}`}
						className="group"
						passHref
					>
						<Button
							size="sm"
							// on Button hover make the icon go forwared a bit
							className=" bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
						>
							View Details
							<i className="icon-[ep--arrow-right-bold] size-4 text-white hover:translate-x-0.5  transition-all duration-200" />
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
