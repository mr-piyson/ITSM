"use client";

import type { ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type ResponsiveOverlayProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
};

export function ResponsiveOverlay({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
}: ResponsiveOverlayProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent
					side="bottom"
					className="flex max-h-[92dvh] flex-col gap-0 p-0"
				>
					<SheetHeader className="border-b pr-10 pb-3">
						<SheetTitle>{title}</SheetTitle>
						{description ? (
							<SheetDescription className="truncate">
								{description}
							</SheetDescription>
						) : null}
					</SheetHeader>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
						{children}
					</div>
					{footer ? (
						<SheetFooter className="border-t pt-3">{footer}</SheetFooter>
					) : null}
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
				<DialogHeader className="border-b pr-10 pt-4 pb-3 pl-5">
					<DialogTitle>{title}</DialogTitle>
					{description ? (
						<DialogDescription className="truncate">
							{description}
						</DialogDescription>
					) : null}
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
					{children}
				</div>
				{footer ? (
					<DialogFooter className="border-t pt-3 pb-3 pl-5 pr-5">
						{footer}
					</DialogFooter>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
