"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import Logo from "@/assets/icons/Logo";

const SPLASH_SHOWN_KEY = "itsm-splash-shown";
const MAX_LOAD_TIME = 10_000;

interface SplashScreenProps {
	children: React.ReactNode;
	minimumLoadingTime?: number;
}

export function SplashScreen({
	children,
	minimumLoadingTime = 1000,
}: SplashScreenProps) {
	const [visible, setVisible] = useState(true);
	const [progress, setProgress] = useState(0);
	const startTime = useRef(0);

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (sessionStorage.getItem(SPLASH_SHOWN_KEY)) {
			setVisible(false);
			return;
		}

		let rafId = 0;
		let finished = false;

		startTime.current = performance.now();

		const finish = () => {
			if (finished) return;
			finished = true;
			sessionStorage.setItem(SPLASH_SHOWN_KEY, "true");
			setProgress(100);
			setVisible(false);
		};

		// Never leave the user stuck behind the splash screen
		const safetyTimeout = setTimeout(finish, MAX_LOAD_TIME);

		const tick = () => {
			const elapsed = performance.now() - startTime.current;
			const timeProgress = Math.min(100, (elapsed / minimumLoadingTime) * 100);

			// Real resource load progress (entries are marked done once they
			// have a duration, otherwise they're still in flight)
			const resources = performance.getEntriesByType("resource");
			const completed = resources.filter(
				(resource) => resource.duration > 0,
			).length;
			const resourceProgress = Math.min(
				100,
				(completed / Math.max(resources.length, 1)) * 100,
			);

			// Never go backwards, drive the bar with the slower signal
			setProgress((prev) =>
				Math.max(prev, Math.floor(Math.max(timeProgress, resourceProgress))),
			);

			// Hide only when BOTH the animation finished and the page really
			// loaded, so the splash is never cut short by a fast load (or
			// removed before the whole app is ready).
			const pageLoaded = document.readyState === "complete";

			if (pageLoaded && elapsed >= minimumLoadingTime) {
				finish();
				return;
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			clearTimeout(safetyTimeout);
		};
	}, [minimumLoadingTime]);

	return (
		<>
			<AnimatePresence mode="wait">
				{visible ? (
					<motion.div
						key="splash"
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
						className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
					>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="flex w-full max-w-md flex-col items-center gap-4 px-4"
						>
							<Logo className="size-64" />
							<h1 className="text-2xl font-bold">Loading your application</h1>

							<div className=" space-y-2 w-[80%]">
								<div className="flex justify-between">
									<p className="text-sm text-muted-foreground">
										Loading resources...
									</p>
									<p className="text-sm font-medium">{progress}%</p>
								</div>
								<Progress value={progress} className="h-2 w-full " />
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<AnimatePresence>
				{!visible && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="h-full"
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
