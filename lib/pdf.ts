import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

export async function generateCertificatePDF(data: PDFData): Promise<Buffer> {
  try {
    // Resolve language (default to English if unsupported)
    const lang = data.language && translations[data.language] ? data.language : "en";
    const t = translations[lang];

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a landscape A4 page (595.27 x 841.89 points)
    // A4 Landscape: width = 841.89, height = 595.27
    const page = pdfDoc.addPage([841.89, 595.27]);
    const { width, height } = page.getSize();

    // Load standard fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // 1. Draw elegant background colors (warm ivory/off-white background)
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.98, 0.98, 0.96),
    });

    // 2. Draw dual-layered borders (navy blue outer border, gold inner border)
    // Outer border (navy blue)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.08, 0.18, 0.36),
      borderWidth: 4,
    });

    // Inner border (gold accent)
    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: rgb(0.83, 0.69, 0.22),
      borderWidth: 1.5,
    });

    // Decorate corners
    const drawCornerDecoration = (cx: number, cy: number) => {
      page.drawRectangle({
        x: cx - 15,
        y: cy - 15,
        width: 30,
        height: 30,
        color: rgb(0.83, 0.69, 0.22),
      });
      page.drawRectangle({
        x: cx - 10,
        y: cy - 10,
        width: 20,
        height: 20,
        color: rgb(0.08, 0.18, 0.36),
      });
    };
    // Corner coordinates
    drawCornerDecoration(28, 28);
    drawCornerDecoration(width - 28, 28);
    drawCornerDecoration(28, height - 28);
    drawCornerDecoration(width - 28, height - 28);

    // 3. Draw Brand Logo or Placeholder
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
      // Draw text-based logo placeholder
      const logoText = "KODE TO CAREER";
      const logoTextWidth = helveticaBold.widthOfTextAtSize(logoText, 18);
      page.drawText(logoText, {
        x: width / 2 - logoTextWidth / 2,
        y: height - 75,
        size: 18,
        font: helveticaBold,
        color: rgb(0.08, 0.18, 0.36),
      });
    }

    // 4. Certificate Title (Translated)
    const titleText = t.title;
    const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 26);
    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - 140,
      size: 26,
      font: helveticaBold,
      color: rgb(0.08, 0.18, 0.36),
    });

    // 5. Presentational Text (Translated)
    const presentText = t.present;
    const presentWidth = timesItalic.widthOfTextAtSize(presentText, 16);
    page.drawText(presentText, {
      x: width / 2 - presentWidth / 2,
      y: height - 180,
      size: 16,
      font: timesItalic,
      color: rgb(0.35, 0.35, 0.35),
    });

    // 6. Student Name (Focal Point)
    const nameText = data.studentName;
    const nameWidth = helveticaBold.widthOfTextAtSize(nameText, 32);
    page.drawText(nameText, {
      x: width / 2 - nameWidth / 2,
      y: height - 230,
      size: 32,
      font: helveticaBold,
      color: rgb(0.83, 0.69, 0.22), // Gold
    });

    // Draw an elegant divider line below name
    page.drawLine({
      start: { x: width / 2 - 120, y: height - 245 },
      end: { x: width / 2 + 120, y: height - 245 },
      color: rgb(0.83, 0.69, 0.22),
      thickness: 1.5,
    });

    // 7. Completion Text (Translated)
    const completionText = t.completion;
    const completionWidth = helvetica.widthOfTextAtSize(completionText, 13);
    page.drawText(completionText, {
      x: width / 2 - completionWidth / 2,
      y: height - 280,
      size: 13,
      font: helvetica,
      color: rgb(0.35, 0.35, 0.35),
    });

    // 8. Course Title
    const courseText = data.courseTitle;
    const courseWidth = helveticaBold.widthOfTextAtSize(courseText, 20);
    page.drawText(courseText, {
      x: width / 2 - courseWidth / 2,
      y: height - 315,
      size: 20,
      font: helveticaBold,
      color: rgb(0.08, 0.18, 0.36),
    });

    // 9. Footer: Left Side - Trainer Details & Signature
    const sigX = 80;
    const sigY = 90;
    
    // Embed trainer signature image if provided
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
      // Cursive font representation for signature placeholder
      page.drawText(data.trainerName, {
        x: sigX + 10,
        y: sigY + 15,
        size: 18,
        font: timesItalic,
        color: rgb(0.08, 0.18, 0.36),
      });
    }

    // Signature line & details
    page.drawLine({
      start: { x: sigX, y: sigY - 5 },
      end: { x: sigX + 150, y: sigY - 5 },
      color: rgb(0.5, 0.5, 0.5),
      thickness: 1,
    });
    
    page.drawText(data.trainerName, {
      x: sigX,
      y: sigY - 20,
      size: 12,
      font: helveticaBold,
      color: rgb(0.08, 0.18, 0.36),
    });
    
    page.drawText(data.trainerDesignation || t.trainerDefault, {
      x: sigX,
      y: sigY - 32,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // 10. Footer: Center - Date of Issuance (Translated Label)
    const dateX = width / 2 - 50;
    page.drawLine({
      start: { x: dateX, y: sigY - 5 },
      end: { x: dateX + 100, y: sigY - 5 },
      color: rgb(0.5, 0.5, 0.5),
      thickness: 1,
    });
    page.drawText(t.issueDateLabel, {
      x: dateX + 10,
      y: sigY - 20,
      size: 10,
      font: helveticaBold,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Localize the actual date display representation slightly based on language
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
      color: rgb(0.08, 0.18, 0.36),
    });

    // 11. Footer: Right Side - QR Code & Certificate Number
    const qrX = width - 170;
    const qrY = 55;
    const qrSize = 85;

    // Embed QR code from data URL
    const qrBase64 = data.qrCodeDataUrl.split(",")[1];
    const qrBytes = Buffer.from(qrBase64, "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Draw Certificate ID
    page.drawText(`Certificate ID: ${data.certificateId}`, {
      x: qrX - 50,
      y: qrY - 12,
      size: 8,
      font: helveticaBold,
      color: rgb(0.35, 0.35, 0.35),
    });

    // Draw small verification instructions (Translated)
    const scanText = t.scanToVerify;
    page.drawText(scanText, {
      x: qrX - 10,
      y: qrY - 22,
      size: 7,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save PDF as buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF Generation Service Error:", error);
    throw error;
  }
}
