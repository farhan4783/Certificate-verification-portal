import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  fileUri: string,
  folder: string = "certificates"
): Promise<{ url: string; publicId: string } | null> {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn("Cloudinary environment variables missing. Saving file locally.");
      
      const dirPath = path.join(process.cwd(), "public", "generated-certificates");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const isPdf = fileUri.startsWith("data:application/pdf");
      const ext = isPdf ? ".pdf" : ".png";
      const filename = `mock-${folder}-${Date.now()}${ext}`;
      const filePath = path.join(dirPath, filename);

      const base64Data = fileUri.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filePath, buffer);

      return {
        url: `/generated-certificates/${filename}`,
        publicId: `mock-public-id-${Date.now()}`,
      };
    }

    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: "auto",
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
}

export default cloudinary;
