// app/admin/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { db, storage, auth } from "@/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Edit, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [categories, setCategories] = useState({});
  const [productTypes, setProductTypes] = useState({});
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  // Form states
  const [newCategory, setNewCategory] = useState({ key: "", value: "" });
  const [newProductType, setNewProductType] = useState({ key: "", value: "" });
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    type: "",
    description: "",
    image: null,
    imageUrl: "",
    shopeeLink: "",
    isBestSeller: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = {};
      categoriesSnapshot.forEach((doc) => {
        categoriesData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setCategories(categoriesData);

      // Fetch product types
      const typesSnapshot = await getDocs(collection(db, "productTypes"));
      const typesData = {};
      typesSnapshot.forEach((doc) => {
        typesData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setProductTypes(typesData);

      // Fetch products with ordering
      const productsQuery = query(collection(db, "products"), orderBy("name"));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = [];
      productsSnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "categories"), {
        key: newCategory.key,
        value: newCategory.value,
      });
      setNewCategory({ key: "", value: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleAddProductType = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "productTypes"), {
        key: newProductType.key,
        value: newProductType.value,
      });
      setNewProductType({ key: "", value: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding product type:", error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = productForm.imageUrl;

      // Handle image upload if there's a new image
      if (productForm.image) {
        const storageRef = ref(
          storage,
          `products/${Date.now()}_${productForm.image.name}`
        );
        await uploadBytes(storageRef, productForm.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category,
        type: productForm.type,
        description: productForm.description,
        image: imageUrl,
        shopeeLink: productForm.shopeeLink,
        isBestSeller: productForm.isBestSeller,
        updatedAt: new Date().toISOString(),
      };

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
          rating: 0,
          sold: 0,
        });
      }

      setProductForm({
        name: "",
        price: "",
        category: "",
        type: "",
        description: "",
        image: null,
        imageUrl: "",
        shopeeLink: "",
        isBestSeller: false,
      });
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setLoading(true);

      if (collectionName === "products") {
        // Get the product data first
        const productDoc = await getDoc(doc(db, "products", id));
        const productData = productDoc.data();

        // Delete the image from storage if it exists
        if (productData.image) {
          const imageRef = ref(storage, productData.image);
          await deleteObject(imageRef);
        }
      }

      await deleteDoc(doc(db, collectionName, id));
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      type: product.type,
      description: product.description,
      image: null,
      imageUrl: product.image,
      shopeeLink: product.shopeeLink,
      isBestSeller: product.isBestSeller,
    });
    setActiveTab("products");
  };

  const ProductForm = () => (
    <form onSubmit={handleProductSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={productForm.name}
            onChange={(e) =>
              setProductForm({ ...productForm, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={productForm.price}
            onChange={(e) =>
              setProductForm({ ...productForm, price: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={productForm.category}
            onChange={(e) =>
              setProductForm({ ...productForm, category: e.target.value })
            }
            required
          >
            <option value="">Select Category</option>
            {Object.values(categories).map((category) => (
              <option key={category.id} value={category.key}>
                {category.value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={productForm.type}
            onChange={(e) =>
              setProductForm({ ...productForm, type: e.target.value })
            }
            required
          >
            <option value="">Select Type</option>
            {Object.values(productTypes).map((type) => (
              <option key={type.id} value={type.key}>
                {type.value}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            value={productForm.description}
            onChange={(e) =>
              setProductForm({ ...productForm, description: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full"
            onChange={(e) =>
              setProductForm({ ...productForm, image: e.target.files[0] })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Shopee Link
          </label>
          <input
            type="url"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={productForm.shopeeLink}
            onChange={(e) =>
              setProductForm({ ...productForm, shopeeLink: e.target.value })
            }
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={productForm.isBestSeller}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  isBestSeller: e.target.checked,
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Best Seller
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {editingProduct && (
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: "",
                price: "",
                category: "",
                type: "",
                description: "",
                image: null,
                imageUrl: "",
                shopeeLink: "",
                isBestSeller: false,
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Saving...
            </span>
          ) : editingProduct ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </button>
      </div>
    </form>
  );

  const TabButton = ({ tab, label }) => (
    <button
      className={`px-4 py-2 rounded ${
        activeTab === tab
          ? "bg-emerald-600 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {label}
    </button>
  );

  if (loading && !products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="mb-8">
          <div className="flex space-x-4">
            <TabButton tab="categories" label="Categories" />
            <TabButton tab="productTypes" label="Product Types" />
            <TabButton tab="products" label="Products" />
          </div>
        </div>

        {activeTab === "categories" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Key
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newCategory.key}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, key: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newCategory.value}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, value: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Add Category
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Existing Categories
              </h3>
              <div className="space-y-2">
                {Object.values(categories).map((category) => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{category.key}</span>:{" "}
                      {category.value}
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteItem("categories", category.id)
                      }
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "productTypes" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add Product Type</h2>
            <form onSubmit={handleAddProductType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type Key
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newProductType.key}
                  onChange={(e) =>
                    setNewProductType({
                      ...newProductType,
                      key: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newProductType.value}
                  onChange={(e) =>
                    setNewProductType({
                      ...newProductType,
                      value: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Add Product Type
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Existing Product Types
              </h3>
              <div className="space-y-2">
                {Object.values(productTypes).map((type) => (
                  <div
                    key={type.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">{type.key}</span>:{" "}
                      {type.value}
                    </div>
                    <button
                      onClick={() => handleDeleteItem("productTypes", type.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <ProductForm />

            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">Existing Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    <div className="aspect-square relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          No Image
                        </div>
                      )}
                      {product.isBestSeller && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                          Best Seller
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.description}
                      </p>
                      <p className="font-medium text-emerald-600 mb-2">
                        Rp {product.price.toLocaleString()}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {categories[product.category]?.value}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem("products", product.id)
                            }
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
