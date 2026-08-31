import { jsPDF } from "jspdf";

export type PdfColumn<T> = {
	header: string;
	widthWeight?: number;
	getValue: (row: T) => string;
};

const PAGE_MARGIN = 10;
const ROW_PADDING = 2;

/**
 * Renders an array of rows as a simple paginated table inside a landscape
 * A4 PDF and triggers a download. Used by the report pages since ag-grid's
 * built-in PDF export is an Enterprise feature.
 */
export function exportRowsToPdf<T>(options: {
	fileName: string;
	title: string;
	subtitle?: string;
	columns: PdfColumn<T>[];
	rows: T[];
}): void {
	const { fileName, title, subtitle, columns, rows } = options;

	const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const usableWidth = pageWidth - PAGE_MARGIN * 2;

	const totalWeight = columns.reduce(
		(sum, column) => sum + (column.widthWeight ?? 1),
		0,
	);
	const widths = columns.map(
		(column) => ((column.widthWeight ?? 1) / totalWeight) * usableWidth,
	);

	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.text(title, PAGE_MARGIN, PAGE_MARGIN + 2);

	let y = PAGE_MARGIN + 8;
	if (subtitle) {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(9);
		doc.text(subtitle, PAGE_MARGIN, y);
		y += 5;
	}

	y += 2;

	const drawHeader = () => {
		doc.setFont("helvetica", "bold");
		doc.setFontSize(8);
		doc.setFillColor(18, 140, 174);
		doc.rect(PAGE_MARGIN, y, usableWidth, 6, "F");
		doc.setTextColor(255, 255, 255);
		let x = PAGE_MARGIN;
		columns.forEach((column, index) => {
			doc.text(column.header, x + ROW_PADDING, y + 4, {
				maxWidth: widths[index] - ROW_PADDING * 2,
			});
			x += widths[index];
		});
		doc.setTextColor(0, 0, 0);
		y += 6;
	};

	drawHeader();

	doc.setFont("helvetica", "normal");
	doc.setFontSize(7.5);

	for (const row of rows) {
		const cellLines = columns.map((column) =>
			doc.splitTextToSize(
				column.getValue(row) ?? "",
				widths[columns.indexOf(column)] - ROW_PADDING * 2,
			),
		);
		const lineHeight = 3.4;
		const rowHeight =
			Math.max(...cellLines.map((lines) => Math.max(lines.length, 1))) *
				lineHeight +
			ROW_PADDING;

		if (y + rowHeight > pageHeight - PAGE_MARGIN) {
			doc.addPage();
			y = PAGE_MARGIN;
			drawHeader();
			doc.setFont("helvetica", "normal");
			doc.setFontSize(7.5);
		}

		let x = PAGE_MARGIN;
		cellLines.forEach((lines, columnIndex) => {
			doc.text(lines, x + ROW_PADDING, y + ROW_PADDING + lineHeight / 2);
			x += widths[columnIndex];
		});
		doc.setDrawColor(210, 210, 210);
		doc.line(
			PAGE_MARGIN,
			y + rowHeight,
			pageWidth - PAGE_MARGIN,
			y + rowHeight,
		);
		y += rowHeight;
	}

	doc.save(`${fileName}.pdf`);
}
