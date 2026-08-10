"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingCta() {
	return (
		<section className="py-20 bg-primary text-primary-foreground">
			<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
				<h2 className="text-3xl md:text-4xl font-bold mb-6">
					Ready to Transform Your IT Operations?
				</h2>
				<p className="text-xl opacity-90 mb-8">
					Join thousands of organizations that have modernized their IT service
					management
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button size="lg" variant="secondary" className="text-lg">
						<span className="flex items-center">
							Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
						</span>
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
					>
						Schedule Demo
					</Button>
				</div>
			</div>
		</section>
	);
}
