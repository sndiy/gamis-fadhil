// lib/firebase/admin.js
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { secureUploadToCloudinary } from "@/utils/secure-cloudinary";

export async function addProduct(productData, image, user) {
  try {
    let imageUrl = "";
    if (image) {
      imageUrl = await secureUploadToCloudinary(image);
    }

    const data = {
      ...productData,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      rating: 0,
      sold: 0,
    };

    const docRef = await addDoc(collection(db, "products"), data);
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to add product: ${error.message}`);
  }
}

export async function updateProduct(productId, productData, image, user) {
  try {
    let imageUrl = productData.image;
    if (image) {
      imageUrl = await secureUploadToCloudinary(image);
    }

    const data = {
      ...productData,
      image: imageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    };

    await updateDoc(doc(db, "products", productId), data);
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}
