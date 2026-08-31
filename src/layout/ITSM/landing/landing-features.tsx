"use client";

import {
	Headphones,
	Monitor,
	Shield,
	Smartphone,
	Users,
	Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const features = [
	{
		icon: <Monitor className="w-8 h-8" />,
		title: "IT Request Portal",
		description:
			"Submit and track IT requests with automated workflows and approval processes.",
	},
	{
		icon: <Smartphone className="w-8 h-8" />,
		title: "Device Management",
		description:
			"Comprehensive device lifecycle management from procurement to retirement.",
	},
	{
		icon: <Headphones className="w-8 h-8" />,
		title: "24/7 Help Desk",
		description:
			"Round-the-clock support with intelligent ticket routing and escalation.",
	},
	{
		icon: <Shield className="w-8 h-8" />,
		title: "Security & Compliance",
		description:
			"Maintain security standards and compliance with automated reporting.",
	},
	{
		icon: <Zap className="w-8 h-8" />,
		title: "Workflow Automation",
		description:
			"Streamline processes with intelligent automation and custom workflows.",
	},
	{
		icon: <Users className="w-8 h-8" />,
		title: "Team Collaboration",
		description: "Enhanced collaboration tools for IT teams and stakeholders.",
	},
];

export function LandingFeatures() {
	return (
		<section className="py-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<Badge variant="secondary" className="mb-4">
						Comprehensive Features
					</Badge>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Complete IT Service Management Suite
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Everything you need to deliver exceptional IT services and support
						to your organization
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
						>
							<CardHeader>
								<div className="text-primary mb-2">{feature.icon}</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base leading-relaxed">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
