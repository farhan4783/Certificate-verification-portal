import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface LayoutElement {
  x: number;
  y: number;
  fontSize?: number;
  color?: string; // Hex color string e.g. "#1e3a8a"
  fontStyle?: "bold" | "regular" | "italic";
  align?: "center" | "left" | "right";
  visible?: boolean;
}

export interface CertificateLayoutConfig {
  presetStyle?: "classic-gold" | "modern-cyber" | "executive-navy" | "emerald-academic" | "minimal-dark";
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  showWatermark?: boolean;
  watermarkText?: string;
  showMicrotextBorder?: boolean;
  elements?: {
    title?: LayoutElement;
    studentName?: LayoutElement;
    courseTitle?: LayoutElement;
    issueDate?: LayoutElement;
    qrCode?: LayoutElement;
    signature?: LayoutElement;
    orgLogo?: LayoutElement;
  };
}

interface PDFData {
  studentName: string;
  courseTitle: string;
  trainerName: string;
  trainerDesignation?: string;
  trainerSignatureUrl?: string;
  orgLogoUrl?: string;
  issueDate: string;
  certificateId: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  language?: string;
  layoutConfig?: CertificateLayoutConfig;
}

const translations: Record<string, {
  title: string;
  present: string;
  completion: string;
  issueDateLabel: string;
  scanToVerify: string;
  trainerDefault: string;
}> = {
  en: {
    title: "CERTIFICATE OF COMPLETION",
    present: "This credential is proudly presented to",
    completion: "for successfully completing the course of study in",
    issueDateLabel: "ISSUE DATE",
    scanToVerify: "Scan to verify credential",
    trainerDefault: "Trainer",
  },
  es: {
    title: "CERTIFICADO DE FINALIZACIÓN",
    present: "Esta credencial se presenta con orgullo a",
    completion: "por completar con éxito el curso de estudio en",
    issueDateLabel: "FECHA DE EMISIÓN",
    scanToVerify: "Escanee para verificar credencial",
    trainerDefault: "Instructor",
  },
  fr: {
    title: "CERTIFICAT DE RÉUSSITE",
    present: "Ce titre est fièrement présenté à",
    completion: "pour avoir complété avec succès le cours d'études en",
    issueDateLabel: "DATE D'ÉMISSION",
    scanToVerify: "Scanner pour vérifier l'attestation",
    trainerDefault: "Formateur",
  },
};

// Utility to parse hex color into rgb object for pdf-lib
function hexToPdfRgb(hexStr: string, fallbackRgb = rgb(0.08, 0.18, 0.36)) {
  try {
    const cleanHex = hexStr.replace("#", "");
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
      return rgb(r, g, b);
    }
  } catch {}
  return fallbackRgb;
}

export async function generateCertificatePDF(data: PDFData): Promise<Buffer> {
  try {
    // Resolve language (default to English if unsupported)
    const lang = data.language && translations[data.language] ? data.language : "en";
    const t = translations[lang];

    const config = data.layoutConfig || {};
    const preset = config.presetStyle || "classic-gold";

    // Color Palettes based on Presets
    let bgRgb = rgb(0.98, 0.98, 0.96); // warm ivory
    let primaryRgb = rgb(0.08, 0.18, 0.36); // navy blue
    let accentRgb = rgb(0.83, 0.69, 0.22); // gold
    let borderOuterRgb = rgb(0.08, 0.18, 0.36);
    let borderInnerRgb = rgb(0.83, 0.69, 0.22);
    let textMutedRgb = rgb(0.35, 0.35, 0.35);

    if (preset === "modern-cyber") {
      bgRgb = rgb(0.05, 0.08, 0.14);
      primaryRgb = rgb(0.06, 0.72, 0.94); // cyan
      accentRgb = rgb(0.65, 0.28, 0.98); // purple
      borderOuterRgb = rgb(0.06, 0.72, 0.94);
      borderInnerRgb = rgb(0.65, 0.28, 0.98);
      textMutedRgb = rgb(0.7, 0.75, 0.85);
    } else if (preset === "executive-navy") {
      bgRgb = rgb(0.96, 0.97, 0.99);
      primaryRgb = rgb(0.05, 0.15, 0.35);
      accentRgb = rgb(0.18, 0.45, 0.85);
      borderOuterRgb = rgb(0.05, 0.15, 0.35);
      borderInnerRgb = rgb(0.18, 0.45, 0.85);
      textMutedRgb = rgb(0.3, 0.35, 0.45);
    } else if (preset === "emerald-academic") {
      bgRgb = rgb(0.97, 0.99, 0.97);
      primaryRgb = rgb(0.04, 0.32, 0.22); // emerald green
      accentRgb = rgb(0.78, 0.65, 0.2); // bronze gold
      borderOuterRgb = rgb(0.04, 0.32, 0.22);
      borderInnerRgb = rgb(0.78, 0.65, 0.2);
      textMutedRgb = rgb(0.3, 0.4, 0.35);
    } else if (preset === "minimal-dark") {
      bgRgb = rgb(0.1, 0.1, 0.12);
      primaryRgb = rgb(0.95, 0.95, 0.98);
      accentRgb = rgb(0.9, 0.75, 0.3);
      borderOuterRgb = rgb(0.25, 0.25, 0.3);
      borderInnerRgb = rgb(0.9, 0.75, 0.3);
      textMutedRgb = rgb(0.6, 0.6, 0.65);
    }

    // Override colors if custom colors provided in layoutConfig
    if (config.primaryColor) primaryRgb = hexToPdfRgb(config.primaryColor, primaryRgb);
    if (config.secondaryColor) borderOuterRgb = hexToPdfRgb(config.secondaryColor, borderOuterRgb);
    if (config.accentColor) accentRgb = hexToPdfRgb(config.accentColor, accentRgb);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a landscape A4 page (width = 841.89, height = 595.27 points)
    const page = pdfDoc.addPage([841.89, 595.27]);
    const { width, height } = page.getSize();

    // Load standard fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // 1. Background fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgRgb,
    });

    // 2. Background Watermark (optional)
    const watermarkText = config.watermarkText || "OFFICIAL VERIFIED CREDENTIAL • KODE TO CAREER";
    if (config.showWatermark !== false) {
      const wmTextWidth = helveticaBold.widthOfTextAtSize(watermarkText, 10);
      // Subtle watermark line running horizontally across center background
      page.drawText(watermarkText, {
        x: width / 2 - wmTextWidth / 2,
        y: height / 2 - 5,
        size: 10,
        font: helveticaBold,
        color: preset === "minimal-dark" || preset === "modern-cyber" ? rgb(0.2, 0.25, 0.32) : rgb(0.9, 0.9, 0.88),
        opacity: 0.35,
      });
    }

    // 3. Borders
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: borderOuterRgb,
      borderWidth: 4,
    });

    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: borderInnerRgb,
      borderWidth: 1.5,
    });

    // Corner decorations
    const drawCornerDecoration = (cx: number, cy: number) => {
      page.drawRectangle({
        x: cx - 15,
        y: cy - 15,
        width: 30,
        height: 30,
        color: borderInnerRgb,
      });
      page.drawRectangle({
        x: cx - 10,
        y: cy - 10,
        width: 20,
        height: 20,
        color: borderOuterRgb,
      });
    };
    drawCornerDecoration(28, 28);
    drawCornerDecoration(width - 28, 28);
    drawCornerDecoration(28, height - 28);
    drawCornerDecoration(width - 28, height - 28);

    // 4. Microtext Security Border at Bottom Edge
    if (config.showMicrotextBorder !== false) {
      const microtext = `SHA256 CHECKSUM SECURITY LAYER • CERTIFICATE ID: ${data.certificateId} • VERIFY AT ${data.verificationUrl} • TAMPER PROOF DIGITAL CREDENTIAL`;
      page.drawText(microtext, {
        x: 35,
        y: 11,
        size: 5,
        font: helvetica,
        color: textMutedRgb,
        opacity: 0.75,
      });
    }

    // 5. Brand Logo or Text Header
    let logoEmbedded = false;
    if (data.orgLogoUrl && !data.orgLogoUrl.includes("mock-") && data.orgLogoUrl.startsWith("http")) {
      try {
        const logoRes = await fetch(data.orgLogoUrl);
        const logoBytes = await logoRes.arrayBuffer();
        const logoImage = data.orgLogoUrl.endsWith(".png") 
          ? await pdfDoc.embedPng(logoBytes)
          : await pdfDoc.embedJpg(logoBytes);
        
        const logoWidth = 100;
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
        page.drawImage(logoImage, {
          x: width / 2 - logoWidth / 2,
          y: height - 90,
          width: logoWidth,
          height: logoHeight,
        });
        logoEmbedded = true;
      } catch (err) {
        console.warn("Could not embed organization logo in PDF:", err);
      }
    }

    if (!logoEmbedded) {
      const logoText = "KODE TO CAREER";
      const logoTextWidth = helveticaBold.widthOfTextAtSize(logoText, 18);
      page.drawText(logoText, {
        x: width / 2 - logoTextWidth / 2,
        y: height - 75,
        size: 18,
        font: helveticaBold,
        color: primaryRgb,
      });
    }

    // 6. Certificate Title
    const titleText = t.title;
    const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 26);
    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - 140,
      size: 26,
      font: helveticaBold,
      color: primaryRgb,
    });

    // 7. Presentation Subtitle
    const presentText = t.present;
    const presentWidth = timesItalic.widthOfTextAtSize(presentText, 16);
    page.drawText(presentText, {
      x: width / 2 - presentWidth / 2,
      y: height - 180,
      size: 16,
      font: timesItalic,
      color: textMutedRgb,
    });

    // 8. Student Name (Focal Point)
    const nameText = data.studentName;
    const nameWidth = helveticaBold.widthOfTextAtSize(nameText, 32);
    page.drawText(nameText, {
      x: width / 2 - nameWidth / 2,
      y: height - 230,
      size: 32,
      font: helveticaBold,
      color: accentRgb,
    });

    // Elegant divider line under student name
    page.drawLine({
      start: { x: width / 2 - 120, y: height - 245 },
      end: { x: width / 2 + 120, y: height - 245 },
      color: accentRgb,
      thickness: 1.5,
    });

    // 9. Completion Text
    const completionText = t.completion;
    const completionWidth = helvetica.widthOfTextAtSize(completionText, 13);
    page.drawText(completionText, {
      x: width / 2 - completionWidth / 2,
      y: height - 280,
      size: 13,
      font: helvetica,
      color: textMutedRgb,
    });

    // 10. Course Title
    const courseText = data.courseTitle;
    const courseWidth = helveticaBold.widthOfTextAtSize(courseText, 20);
    page.drawText(courseText, {
      x: width / 2 - courseWidth / 2,
      y: height - 315,
      size: 20,
      font: helveticaBold,
      color: primaryRgb,
    });

    // 11. Footer: Left Side - Trainer Details & Signature
    const sigX = 80;
    const sigY = 90;
    
    let signatureEmbedded = false;
    if (data.trainerSignatureUrl && !data.trainerSignatureUrl.includes("mock-") && data.trainerSignatureUrl.startsWith("http")) {
      try {
        const sigRes = await fetch(data.trainerSignatureUrl);
        const sigBytes = await sigRes.arrayBuffer();
        const sigImage = data.trainerSignatureUrl.endsWith(".png")
          ? await pdfDoc.embedPng(sigBytes)
          : await pdfDoc.embedJpg(sigBytes);

        page.drawImage(sigImage, {
          x: sigX,
          y: sigY,
          width: 120,
          height: 45,
        });
        signatureEmbedded = true;
      } catch (err) {
        console.warn("Could not embed signature image in PDF:", err);
      }
    }

    if (!signatureEmbedded) {
      page.drawText(data.trainerName, {
        x: sigX + 10,
        y: sigY + 15,
        size: 18,
        font: timesItalic,
        color: primaryRgb,
      });
    }

    page.drawLine({
      start: { x: sigX, y: sigY - 5 },
      end: { x: sigX + 150, y: sigY - 5 },
      color: textMutedRgb,
      thickness: 1,
    });
    
    page.drawText(data.trainerName, {
      x: sigX,
      y: sigY - 20,
      size: 12,
      font: helveticaBold,
      color: primaryRgb,
    });
    
    page.drawText(data.trainerDesignation || t.trainerDefault, {
      x: sigX,
      y: sigY - 32,
      size: 10,
      font: helvetica,
      color: textMutedRgb,
    });

    // 12. Footer: Center - Issue Date
    const dateX = width / 2 - 50;
    page.drawLine({
      start: { x: dateX, y: sigY - 5 },
      end: { x: dateX + 100, y: sigY - 5 },
      color: textMutedRgb,
      thickness: 1,
    });
    page.drawText(t.issueDateLabel, {
      x: dateX + 10,
      y: sigY - 20,
      size: 10,
      font: helveticaBold,
      color: textMutedRgb,
    });
    
    let localizedDateStr = data.issueDate;
    try {
      const parsedDate = new Date(data.issueDate);
      if (!isNaN(parsedDate.getTime())) {
        const localeMap: Record<string, string> = { en: "en-US", es: "es-ES", fr: "fr-FR" };
        localizedDateStr = parsedDate.toLocaleDateString(localeMap[lang] || "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch {}

    const dateStrWidth = helvetica.widthOfTextAtSize(localizedDateStr, 10);
    page.drawText(localizedDateStr, {
      x: width / 2 - dateStrWidth / 2,
      y: sigY - 32,
      size: 10,
      font: helvetica,
      color: primaryRgb,
    });

    // 13. Footer: Right Side - QR Code & Certificate Number
    const qrX = width - 170;
    const qrY = 55;
    const qrSize = 85;

    const qrBase64 = data.qrCodeDataUrl.split(",")[1];
    const qrBytes = Buffer.from(qrBase64, "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    page.drawText(`Certificate ID: ${data.certificateId}`, {
      x: qrX - 50,
      y: qrY - 12,
      size: 8,
      font: helveticaBold,
      color: textMutedRgb,
    });

    const scanText = t.scanToVerify;
    page.drawText(scanText, {
      x: qrX - 10,
      y: qrY - 22,
      size: 7,
      font: helvetica,
      color: textMutedRgb,
    });

    // Save PDF buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF Generation Service Error:", error);
    throw error;
  }
}

