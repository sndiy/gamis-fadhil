// pages/api/cloudinary/delete.js
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicId, imageUrl } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: "Public ID is required" });
  }

  try {
    // Log the configuration and inputs
    console.log("Cloudinary config:", {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Attempting to delete:", { publicId, imageUrl });

    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);

    if (result.result === "ok") {
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        details: result,
      });
    } else {
      return res.status(400).json({
        error: "Failed to delete image",
        details: result,
        publicId,
        imageUrl,
      });
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      publicId,
      imageUrl,
    });
  }
}
