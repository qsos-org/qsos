import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
import qsosLogo from "@/assets/images/logo-qsos.png?inline";


function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const scoreColor = (s: number): [number, number, number] =>
    hslToRgb(Math.max(0, Math.min(2, s)) * 40, 1, 0.4);

const chartColor = (i: number, t: number): [number, number, number] =>
    hslToRgb(360 * i / Math.max(1, t), 0.7, 0.5);

const tint = ([r, g, b]: [number, number, number], t = 0.93): [number, number, number] => {
    const mix = (c: number) => Math.round(c * (1 - t) + 255 * t);
    return [mix(r), mix(g), mix(b)];
};


export async function exportPDF({
    tableId = 'cmp-table-print', 
    vizSelector = '.visualization',
    title = 'QSOS - Comparison',
    softwareType = '',
    setVisualization,
}: {
    tableId?: string;
    vizSelector?: string;
    title?: string;
    softwareType?: string;
    setVisualization: (kind: 'radar' | 'bubble') => Promise<void> | void;
}) {
    const table = document.getElementById(tableId) as HTMLTableElement | null;
    if (!table) return;

    const capture = async (kind: 'radar' | 'bubble') => {
        await setVisualization(kind);
        await new Promise(r => setTimeout(r, 200));
        const canvas = document.querySelector(`${vizSelector} canvas`) as HTMLCanvasElement | null;
        return canvas?.toDataURL('image/png') || null;
    };

    const radar = await capture('radar');
    const bubble = await capture('bubble');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const logoHeight = 32;
    const logoWidth = 96; 
    const baselineY = margin + logoHeight * 0.7;
    
    doc.addImage(qsosLogo, "PNG", margin, margin, logoWidth, logoHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);

    
    const dateStr = new Date().toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric"
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(`Issued on ${dateStr}`, pageWidth - margin, baselineY, { align: "right" });

    
    const theadThs = Array.from(table.querySelectorAll("thead tr:first-child th"));
    const softwareNames = theadThs.slice(2).map(th => (th.textContent || "").split("Version:")[0]?.trim());
    const gridVersion = title.match(/\(([^)]+)\)/)?.[1] || "";
    const softwareList = softwareNames.length > 5
        ? `${softwareNames.slice(0, 4).join(", ")} and ${softwareNames.length - 4} others`
        : softwareNames.join(", ");
    const mainTitle = `Comparison of selected software: ${softwareList}`;
    const subTitle = [gridVersion && `Grid version: ${gridVersion}`, softwareType && `Software type: ${softwareType}`]
        .filter(Boolean).join(" • ");

    const titleY = margin + logoHeight + 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);
    
    const maxTitleWidth = pageWidth - margin * 2;
    const titleLines = doc.splitTextToSize(mainTitle, maxTitleWidth);
    const lineHeight = 20;
    let currentY = titleY;
    titleLines.forEach((line: string, index: number) => {
        doc.text(line, (pageWidth - doc.getTextWidth(line)) / 2, currentY);
        currentY += lineHeight;
    });

    if (subTitle) {
        const subY = currentY + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(90, 90, 90);
        doc.text(subTitle, (pageWidth - doc.getTextWidth(subTitle)) / 2, subY);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, subY + 10, pageWidth - margin, subY + 10);
    }

    
    const startY = margin + logoHeight + 120;
    const chartsGap = 30;
    const chartWidth = Math.min((pageWidth - margin * 2 - chartsGap) / 2, 450);
    const chartHeight = Math.min(400, pageHeight - startY - 140);
    const duoX = (pageWidth - (chartWidth * 2 + chartsGap)) / 2;

    const drawChart = (label: string, dataUrl: string | null, x: number, y: number) => {
        if (!dataUrl) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(label, x + chartWidth / 2 - doc.getTextWidth(label) / 2, y);
        doc.addImage(dataUrl, "PNG", x, y + 10, chartWidth, chartHeight);
    };

    drawChart("Radar Chart", radar, duoX, startY);
    drawChart("Bubble Chart", bubble, duoX + chartWidth + chartsGap, startY);


    doc.addPage();
    const softwareCount = Math.max(0, theadThs.length - 2);

    autoTable(doc, {
        html: table,
        startY: margin,
        theme: 'grid',
        useCss: false,
        tableWidth: 'auto',
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            lineColor: [200, 200, 200],
            textColor: [40, 40, 40],
            halign: "center",
            valign: "middle"
        },
        headStyles: {fillColor: [235, 235, 235],fontStyle: 'bold',textColor: [20, 20, 20]
        },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "center", cellWidth: 80 } },
        didParseCell: (d: CellHookData) => {
            const raw = String((d.cell.text as any)?.join?.(" ") ?? d.cell.text ?? "");
            if (d.column.index === 0) {
                const isSection = (raw.includes("📁") || raw.includes("📂")) && !raw.includes("└");
                const isSubSection = raw.includes("└") && (raw.includes("📁") || raw.includes("📂"));
                const isCriteria = raw.includes("└") && !raw.includes("📁") && !raw.includes("📂");
                const cleaned = raw
                    .replace(/[📁📂└│├─]/g, "")
                    .replace(/^\s*%+\s*/, "")
                    .replace(/\s+/g, " ")
                    .trim();
                if (isSection) {
                    d.cell.styles.fontSize = 12;
                    d.cell.styles.fontStyle = 'bold';
                    d.cell.styles.fillColor = [235, 235, 235];
                    d.cell.text = [cleaned];
                } else if (isSubSection) {
                    d.cell.styles.fontSize = 10;
                    d.cell.styles.textColor = [90, 90, 90];
                    d.cell.styles.fillColor = [245, 245, 245];
                    d.cell.text = [" " + cleaned];
                } else if (isCriteria) {
                    d.cell.styles.fontSize = 8;
                    d.cell.styles.textColor = [110, 110, 110];
                    d.cell.text = [" " + cleaned];
                } else {
                    d.cell.text = [cleaned];
                }
            }

            if (d.section === "head") {
                if (d.column.index <= 1) {
                    d.cell.styles.fillColor = [200, 200, 200];
                } else {
                    d.cell.styles.fillColor = chartColor(d.column.index - 2, softwareCount);
                }
            }

            if (d.section === "body" && d.column.index >= 2) {
                d.cell.styles.fillColor = tint(chartColor(d.column.index - 2, softwareCount));
                const num = parseFloat(raw.replace(",", "."));
                if (!Number.isNaN(num)) {
                    d.cell.styles.textColor = scoreColor(num);
                    d.cell.styles.fontStyle = "bold";
                }
            }
        },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: "right" });
    }

    doc.save(title.replace(/\s+/g, "-") + ".pdf");
}