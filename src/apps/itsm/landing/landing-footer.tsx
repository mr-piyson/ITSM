"use client";

import { Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
	return (
		<footer className="bg-background border-t py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					<div>
						<div className="flex items-center mb-4">
							<div className="w-8 h-8 bg-linear-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
								<Monitor className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="ml-2 text-lg font-bold">ITSM</span>
						</div>
						<p className="text-muted-foreground">
							The next-generation ITSM platform for modern enterprises.
						</p>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Platform</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Features
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Integrations
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									API
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Security
								</Button>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Resources</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Documentation
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Help Center
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Blog
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Community
								</Button>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4">Company</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									About
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Careers
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Contact
								</Button>
							</li>
							<li>
								<Button
									variant="link"
									className="p-0 h-auto text-muted-foreground"
								>
									Privacy
								</Button>
							</li>
						</ul>
					</div>
				</div>

				<Separator className="my-8" />

				<div className="text-center text-muted-foreground">
					<p>&copy; 2025 ITSM. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
