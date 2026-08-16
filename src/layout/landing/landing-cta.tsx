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
			</div>
		</section>
	);
}
