import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// State management
let isInitialized = false;
let categories = {};
let productTypes = {};
let products = [];
let bestSellers = [];

// Initialize data from Firestore
export const initializeData = async () => {
  // Prevent multiple initializations
  if (isInitialized) return;

  try {
    // Fetch categories
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const categoriesData = {};
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      categoriesData[data.key] = {
        key: data.key,
        value: data.value,
      };
    });
    categories = categoriesData;

    // Fetch product types
    const typesSnapshot = await getDocs(collection(db, "productTypes"));
    const typesData = {};
    typesSnapshot.forEach((doc) => {
      const data = doc.data();
      typesData[data.key] = {
        key: data.key,
        value: data.value,
      };
    });
    productTypes = typesData;

    // Fetch products
    const productsQuery = query(collection(db, "products"), orderBy("name"));
    const productsSnapshot = await getDocs(productsQuery);
    const productsData = [];
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      productsData.push({
        id: doc.id,
        category: data.category,
        createdAt: data.createdAt,
        description: data.description,
        image: data.image || "",
        isBestSeller: data.isBestSeller || false,
        name: data.name,
        price: data.price,
        rating: data.rating || 0,
        shopeeLink: data.shopeeLink,
        sold: data.sold || 0,
        type: data.type,
        updatedAt: data.updatedAt,
      });
    });
    products = productsData;
    bestSellers = products.filter((product) => product.isBestSeller);

    isInitialized = true;
  } catch (error) {
    console.error("Error initializing data:", error);
    throw error; // Re-throw to handle in the component
  }
};

// Getter functions that ensure data is initialized
export const getCategories = async () => {
  await initializeData();
  return categories;
};

export const getProductTypes = async () => {
  await initializeData();
  return productTypes;
};

export const getAllProducts = async () => {
  await initializeData();
  return products;
};

export const getBestSellers = async () => {
  await initializeData();
  return bestSellers;
};

export const getProductsByCategory = async (category) => {
  await initializeData();
  return products.filter((product) => product.category === category);
};

export const getProductsByType = async (type) => {
  await initializeData();
  return products.filter((product) => product.type === type);
};

export const searchProducts = async (query) => {
  await initializeData();
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
  );
};
