"use client";

import { MarketingNavbar } from "@/layout/shell/marketing-navbar";

import { LandingCta } from "./landing-cta";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingHero } from "./landing-hero";
import { LandingTestimonials } from "./landing-testimonials";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<MarketingNavbar />
			<LandingHero />
			<LandingFeatures />
			<LandingTestimonials />
			<LandingCta />
			<LandingFooter />
		</div>
	);
}
