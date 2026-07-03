import QRCode from "qrcode";

export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
    });
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    throw err;
  }
}
