// utils/secure-cloudinary.js
import { auth } from "@/firebase/config";
import Cookies from "js-cookie";

export const secureUploadToCloudinary = async (file) => {
  try {
    // Check session cookie and auth
    const session = Cookies.get("session");
    const user = auth.currentUser;

    if (!session || !user) {
      throw new Error("Authentication required for upload");
    }

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload JPEG, PNG, or WebP images only."
      );
    }

    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append(
      "public_id",
      `shop/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Secure upload error:", error);
    throw new Error("Upload failed: " + error.message);
  }
};
