"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExportButtonsProps = {
	onCsv: () => void;
	onPdf: () => void;
	disabled?: boolean;
};

export function ExportButtons({ onCsv, onPdf, disabled }: ExportButtonsProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={disabled}
				onClick={onCsv}
				title="Export as CSV"
			>
				<FileSpreadsheet data-icon="inline-start" />
				CSV
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={disabled}
				onClick={onPdf}
				title="Export as PDF"
			>
				<FileDown data-icon="inline-start" />
				PDF
			</Button>
		</div>
	);
}
