// lib/firebase/products.js
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";

export const productsRef = collection(db, "products");

export async function getProducts() {
  const q = query(productsRef, orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProductsByCategory(category) {
  const q = query(productsRef, where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getBestSellers() {
  const q = query(productsRef, where("isBestSeller", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function searchProducts(searchQuery) {
  // Note: Firestore doesn't support native full-text search
  // For production, consider using Algolia or similar
  const q = query(productsRef);
  const snapshot = await getDocs(q);
  const lowercaseQuery = searchQuery.toLowerCase();

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery)
    );
}
