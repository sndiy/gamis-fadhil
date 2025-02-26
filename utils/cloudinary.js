// utils/cloudinary.js

/**
 * Uploads an image to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadToCloudinary = async (file) => {
  try {
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    ) {
      console.error("Missing Cloudinary config:", {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "MISSING",
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "MISSING",
      });
      throw new Error("Cloudinary configuration is missing");
    }

    if (!file) {
      console.error("File is missing:", file);
      throw new Error("No file provided for upload");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const apiUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log("Uploading to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary API error:", errorData);
      throw new Error(
        errorData.error?.message || `Upload failed with status: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.secure_url) {
      console.error("Missing secure_url in response:", data);
      throw new Error("Invalid response: missing image URL");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Extracts the public ID from a Cloudinary URL
 * @param {string} imageUrl - The full Cloudinary URL
 * @returns {string} - The extracted public ID
 */
const extractPublicId = (imageUrl) => {
  if (!imageUrl) {
    throw new Error("No image URL provided");
  }

  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/public_id.jpg
  const match = imageUrl.match(/\/v\d+\/(.+?)(?:\.[^/.]+)?$/);
  if (!match) {
    throw new Error(`Invalid Cloudinary URL format: ${imageUrl}`);
  }

  return match[1];
};

/**
 * Deletes an image from Cloudinary
 * @param {string} imageUrl - The full Cloudinary URL of the image
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteFromCloudinary(imageUrl) {
  try {
    const publicId = extractPublicId(imageUrl);
    console.log("Attempting to delete image with public_id:", publicId);

    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId,
        imageUrl, // For logging purposes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Delete API response error:", errorData);
      throw new Error(errorData.error || `Failed to delete image: ${response.status}`);
    }

    const data = await response.json();
    console.log("Delete API response:", data);
    return true;
  } catch (error) {
    console.error("Error in deleteFromCloudinary:", error);
    throw error;
  }
}

export { uploadToCloudinary };