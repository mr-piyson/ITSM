"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
	{
		name: "Sarah Johnson",
		role: "IT Director",
		company: "TechCorp Solutions",
		content:
			"This ITSM platform transformed our IT operations. Response times improved by 60% and user satisfaction is at an all-time high.",
		rating: 5,
	},
	{
		name: "Michael Chen",
		role: "CTO",
		company: "Innovation Labs",
		content:
			"The automation features saved us countless hours. The ROI was evident within the first quarter of implementation.",
		rating: 5,
	},
	{
		name: "Emily Rodriguez",
		role: "Operations Manager",
		company: "Global Enterprises",
		content:
			"User-friendly interface and powerful features. Our team adopted it quickly with minimal training required.",
		rating: 5,
	},
];

export function LandingTestimonials() {
	return (
		<section className="py-20 bg-muted/50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<Badge variant="secondary" className="mb-4">
						Customer Success
					</Badge>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Trusted by IT Leaders Worldwide
					</h2>
					<p className="text-xl text-muted-foreground">
						See what our customers say about their experience
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{testimonials.map((testimonial, index) => (
						<Card key={index} className="border-border/50">
							<CardHeader>
								<div className="flex mb-2">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star
											key={i}
											className="w-4 h-4 text-yellow-400 fill-current"
										/>
									))}
								</div>
							</CardHeader>
							<CardContent>
								<blockquote className="text-muted-foreground mb-4 italic">
									&quot;{testimonial.content}&quot;
								</blockquote>
								<div>
									<div className="font-semibold text-foreground">
										{testimonial.name}
									</div>
									<div className="text-sm text-muted-foreground">
										{testimonial.role} at {testimonial.company}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
