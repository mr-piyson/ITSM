"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EmblaCarousel = () => {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);

	const slides = [
		{
			title: "Streamline IT Operations",
			description:
				"Manage incidents, requests, and changes from a single, intuitive dashboard with powerful automation.",
			image:
				"https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
			features: [
				"24/7 Monitoring",
				"Automated Workflows",
				"Real-time Analytics",
			],
		},
		{
			title: "Smart Ticket Management",
			description:
				"AI-powered ticket routing and intelligent prioritization for faster resolution times.",
			image:
				"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
			features: ["AI Classification", "Smart Routing", "SLA Management"],
		},
		{
			title: "Self-Service Portal",
			description:
				"Empower your users with an intuitive self-service portal and comprehensive knowledge base.",
			image:
				"https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop",
			features: ["Knowledge Base", "Request Forms", "Status Tracking"],
		},
	];

	const nextSlide = useCallback(() => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	}, [slides.length]);

	const prevSlide = useCallback(() => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	}, [slides.length]);

	useEffect(() => {
		if (!isAutoPlaying) return;
		const interval = setInterval(nextSlide, 5000);
		return () => clearInterval(interval);
	}, [nextSlide, isAutoPlaying]);

	const handleMouseEnter = () => setIsAutoPlaying(false);
	const handleMouseLeave = () => setIsAutoPlaying(true);

	return (
		<Card className="relative w-full h-96 md:h-125 overflow-hidden border-0 p-0 shadow-2xl">
			<div
				className="relative w-full h-full"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div
					className="flex transition-transform duration-700 ease-in-out h-full"
					style={{ transform: `translateX(-${currentSlide * 100}%)` }}
				>
					{slides.map((slide, index) => (
						<div key={index} className="w-full shrink-0 relative">
							<div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/60 z-10" />
							<img
								src={slide.image}
								alt={slide.title}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 z-20 flex items-center justify-center text-primary-foreground p-8">
								<div className="text-center max-w-2xl">
									<h2 className="text-3xl md:text-5xl font-bold mb-4">
										{slide.title}
									</h2>
									<p className="text-lg md:text-xl mb-6 opacity-90">
										{slide.description}
									</p>
									<div className="flex flex-wrap justify-center gap-2 mb-8">
										{slide.features.map((feature, idx) => (
											<Badge
												key={idx}
												variant="secondary"
												className="bg-white/20 text-white border-white/30"
											>
												{feature}
											</Badge>
										))}
									</div>
									<Button
										size="lg"
										className="bg-white text-primary hover:bg-white/90"
									>
										Get Started Today
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={prevSlide}
					className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
				>
					<ChevronLeft className="w-6 h-6" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={nextSlide}
					className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white"
				>
					<ChevronRight className="w-6 h-6" />
				</Button>

				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
					{slides.map((_, index) => (
						<Button
							key={index}
							variant="ghost"
							size="sm"
							onClick={() => setCurrentSlide(index)}
							className={`w-3 h-3 p-0 rounded-full transition-all duration-300 ${
								index === currentSlide
									? "bg-white scale-125"
									: "bg-white/50 hover:bg-white/75"
							}`}
						/>
					))}
				</div>
			</div>
		</Card>
	);
};

export function LandingHero() {
	return (
		<section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<Badge variant="secondary" className="mb-6">
						Next-Generation ITSM Platform
					</Badge>
					<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
						Transform Your
						<span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
							{" "}
							IT Operations
						</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
						Revolutionize your IT service management with intelligent
						automation, seamless workflows, and exceptional user experience.
						Designed for modern enterprises.
					</p>
				</div>

				<div className="mb-20">
					<EmblaCarousel />
				</div>
			</div>
		</section>
	);
}
