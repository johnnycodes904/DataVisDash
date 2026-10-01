import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface GeneratePdfOptions {
  element: HTMLElement;
  title: string;
  chartType?: string;
  description?: string;
  datasetName?: string;
  metadata?: Record<string, string | number>;
}

export async function generateChartPdfBlob(options: GeneratePdfOptions): Promise<{
  blob: Blob;
  base64: string;
  dataUri: string;
  filename: string;
}> {
  const { element, title, chartType, description, datasetName } = options;

  // Capture canvas with html2canvas-pro with full support for modern CSS color spaces including oklch
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution capture
    useCORS: true,
    backgroundColor: '#0f172a', // Slate 900 dark theme
    logging: false,
    ignoreElements: (el) => {
      // Ignore interactive button controls during PDF rendering
      return el.classList.contains('pdf-exclude') || el.getAttribute('data-pdf-exclude') === 'true';
    },
    onclone: (clonedDoc) => {
      // Ensure any cloned stylesheets or inline colors parse cleanly
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Strip any unsupported outline/filter effects that might interfere
        if (htmlEl.style) {
          if (htmlEl.style.color && htmlEl.style.color.includes('oklch')) {
            htmlEl.style.color = '#f8fafc';
          }
        }
      });
    }
  });

  const imgData = canvas.toDataURL('image/png');

  // Create jsPDF in landscape or portrait depending on dimensions
  const isLandscape = canvas.width >= canvas.height;
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Dark slate background for entire PDF
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header banner
  doc.setFillColor(30, 41, 59); // #1e293b
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Top accent line (blue)
  doc.setFillColor(59, 130, 246); // #3b82f6
  doc.rect(0, 0, pageWidth, 2, 'F');

  // Branding Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(248, 250, 252); // #f8fafc
  doc.text('DATA VISUALIZER REPORT', 14, 12);

  // Subtitle / generated timestamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const timestampStr = new Date().toLocaleString();
  doc.text(`Generated: ${timestampStr} | Dataset: ${datasetName || 'Active Session'}`, 14, 18);

  if (chartType) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(96, 165, 250); // #60a5fa
    const badgeText = chartType.toUpperCase();
    const textWidth = doc.getTextWidth(badgeText);
    doc.text(badgeText, pageWidth - 14 - textWidth, 14);
  }

  // Chart Title section
  let cursorY = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(241, 245, 249);
  doc.text(title, 14, cursorY);
  cursorY += 6;

  if (description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const splitDesc = doc.splitTextToSize(description, pageWidth - 28);
    doc.text(splitDesc, 14, cursorY);
    cursorY += splitDesc.length * 4.5 + 2;
  }

  // Calculate chart image layout
  const availableWidth = pageWidth - 28;
  const availableHeight = pageHeight - cursorY - 18;

  let imgWidth = availableWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > availableHeight) {
    imgHeight = availableHeight;
    imgWidth = (canvas.width * imgHeight) / canvas.height;
  }

  // Center horizontally
  const imgX = (pageWidth - imgWidth) / 2;
  const imgY = cursorY + (availableHeight - imgHeight) / 2;

  // Add chart image
  doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');

  // Footer banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential & Proprietary - Generated via Interactive Analytics Suite', 14, pageHeight - 5);
  doc.text('Page 1 of 1', pageWidth - 26, pageHeight - 5);

  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filename = `${cleanTitle || 'chart-export'}-${Date.now()}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  const base64 = dataUri.split(',')[1] || '';

  return { blob, base64, dataUri, filename };
}

export async function downloadChartAsPdf(options: GeneratePdfOptions): Promise<string> {
  const { blob, filename } = await generateChartPdfBlob(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}
