import { v2 as cloudinary } from "cloudinary";

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
      console.warn("Cloudinary environment variables missing. Returning mock upload URL.");
      return {
        url: fileUri.startsWith("data:application/pdf")
          ? `https://res.cloudinary.com/demo/image/upload/v1620000000/mock-${folder}/${Date.now()}.pdf`
          : `https://res.cloudinary.com/demo/image/upload/v1620000000/mock-${folder}/${Date.now()}.png`,
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
