// app/admin/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/firebase/config";
import { auth } from "@/firebase/config";
import Cookies from "js-cookie";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trash2,
  Edit,
  Loader2,
  LogOut,
  Plus,
  Package,
  Grid,
  Tag,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { uploadToCloudinary } from "@/utils/cloudinary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

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

  // Add refs for inputs that need to maintain focus
  const categoryKeyRef = useRef(null);
  const categoryValueRef = useRef(null);
  const typeKeyRef = useRef(null);
  const typeValueRef = useRef(null);
  const productNameRef = useRef(null);
  const productPriceRef = useRef(null);
  const productDescriptionRef = useRef(null);
  const shopeeLinkRef = useRef(null);

  // Add new state for error handling and loading states
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Enhanced error handling for fetchData
  const fetchData = async () => {
    try {
      const session = Cookies.get("session");
      if (!session) {
        router.push("/admin/login");
        return;
      }
      setLoading(true);
      setError(null);

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
    } catch (error) {
      setError("Failed to fetch data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced handleLogout with feedback
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
      router.push("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const focusedElement = document.activeElement;
    setIsSubmitting(true);
    try {
      if (!newCategory.key || !newCategory.value) {
        throw new Error("Please fill in all fields");
      }
      await addDoc(collection(db, "categories"), {
        key: newCategory.key,
        value: newCategory.value,
      });
      setNewCategory({ key: "", value: "" });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      await fetchData();
      // Restore focus after state updates
      setTimeout(() => {
        if (focusedElement) {
          focusedElement.focus();
        }
      }, 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProductType = async (e) => {
    e.preventDefault();
    const focusedElement = document.activeElement;
    try {
      await addDoc(collection(db, "productTypes"), {
        key: newProductType.key,
        value: newProductType.value,
      });
      setNewProductType({ key: "", value: "" });
      await fetchData();
      // Restore focus after state updates
      setTimeout(() => {
        if (focusedElement) {
          focusedElement.focus();
        }
      }, 0);
    } catch (error) {
      console.error("Error adding product type:", error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const focusedElement = document.activeElement;
    setLoading(true);

    try {
      // Check session and auth
      const session = Cookies.get("session");
      const user = auth.currentUser;

      if (!session || !user) {
        throw new Error("Authentication required. Please log in again.");
      }

      let imageUrl = productForm.imageUrl;

      // Handle image upload if there's a new image
      if (productForm.image) {
        try {
          imageUrl = await secureUploadToCloudinary(productForm.image);
        } catch (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
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
        updatedBy: user.email,
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
          rating: 0,
          sold: 0,
        });
      }

      // Reset form and restore focus
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
      await fetchData();

      // Restore focus after state updates
      setTimeout(() => {
        if (focusedElement) {
          focusedElement.focus();
        }
      }, 0);
    } catch (error) {
      console.error("Error saving product:", error);

      // Handle session expiration
      if (error.message.includes("Authentication required")) {
        Cookies.remove("session");
        router.push("/admin/login");
        return;
      }

      alert(error.message || "Error saving product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, collectionName, id));
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
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

  // Enhanced product form component
  const ProductForm = () => (
    <form onSubmit={handleProductSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={productForm.name}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            autoFocus={false}
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="price">Price (Rp)</Label>
          <Input
            id="price"
            type="number"
            value={productForm.price}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, price: e.target.value }))
            }
            required
            min="0"
            step="1000"
            autoFocus={false}
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full p-2 border rounded-md"
            value={productForm.category}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, category: e.target.value }))
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
  
        <div className="space-y-2">
          <Label htmlFor="type">Product Type</Label>
          <select
            id="type"
            className="w-full p-2 border rounded-md"
            value={productForm.type}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, type: e.target.value }))
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
  
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={productForm.description}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, description: e.target.value }))
            }
            required
            rows={4}
            autoFocus={false}
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="shopeeLink">Shopee Link</Label>
          <Input
            id="shopeeLink"
            type="url"
            value={productForm.shopeeLink}
            onChange={(e) =>
              setProductForm((prev) => ({ ...prev, shopeeLink: e.target.value }))
            }
            required
            placeholder="https://shopee.co.id/..."
            autoFocus={false}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={productForm.isBestSeller}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  isBestSeller: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as Best Seller
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {editingProduct && (
          <Button
            type="button"
            variant="outline"
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
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              {editingProduct ? "Updating..." : "Adding..."}
            </span>
          ) : editingProduct ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </Button>
      </div>
    </form>
  );

  // Enhanced product card component
  const ProductCard = ({ product }) => (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package size={48} className="text-gray-400" />
          </div>
        )}
        {product.isBestSeller && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
            Best Seller
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2 line-clamp-1">{product.name}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>
        <p className="font-medium text-emerald-600 mb-2">
          Rp {Number(product.price).toLocaleString()}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {categories[product.category]?.value}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProduct(product)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteItem("products", product.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center">
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "categories" ? "default" : "outline"}
                onClick={() => setActiveTab("categories")}
              >
                <Tag size={16} className="mr-2" />
                Categories
              </Button>
              <Button
                variant={activeTab === "productTypes" ? "default" : "outline"}
                onClick={() => setActiveTab("productTypes")}
              >
                <Grid size={16} className="mr-2" />
                Product Types
              </Button>
              <Button
                variant={activeTab === "products" ? "default" : "outline"}
                onClick={() => setActiveTab("products")}
              >
                <Package size={16} className="mr-2" />
                Products
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "categories" && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryKey">Category Key</Label>
                          <Input
                            id="categoryKey"
                            ref={categoryKeyRef}
                            value={newCategory.key}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                key: e.target.value,
                              })
                            }
                            required
                            placeholder="e.g., PREMIUM_GAMIS"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryValue">Category Name</Label>
                          <Input
                            id="categoryValue"
                            value={newCategory.value}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                value: e.target.value,
                              })
                            }
                            required
                            placeholder="e.g., Premium Gamis"
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Adding...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add Category
                          </span>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Existing Categories
                      </h3>
                      <div className="grid gap-4">
                        {Object.values(categories).map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{category.value}</p>
                              <p className="text-sm text-gray-500">
                                Key: {category.key}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteItem("categories", category.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "productTypes" && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Types Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <form onSubmit={handleAddProductType} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="typeKey">Type Key</Label>
                          <Input
                            id="typeKey"
                            ref={typeKeyRef}
                            value={newProductType.key}
                            onChange={(e) =>
                              setNewProductType({
                                ...newProductType,
                                key: e.target.value,
                              })
                            }
                            required
                            placeholder="e.g., CERUTI_PREMIUM"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="typeValue">Type Name</Label>
                          <Input
                            id="typeValue"
                            value={newProductType.value}
                            onChange={(e) =>
                              setNewProductType({
                                ...newProductType,
                                value: e.target.value,
                              })
                            }
                            required
                            placeholder="e.g., Ceruti Premium"
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Adding...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add Product Type
                          </span>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Existing Product Types
                      </h3>
                      <div className="grid gap-4">
                        {Object.values(productTypes).map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{type.value}</p>
                              <p className="text-sm text-gray-500">
                                Key: {type.key}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteItem("productTypes", type.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "products" && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ProductForm />

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Product Catalog
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
