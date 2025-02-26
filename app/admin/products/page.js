// app/admin/products/page.js
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
import { Trash2, Edit, Loader2, LogOut, Plus, Package } from "lucide-react";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

export default function ProductsPage() {
  const [categories, setCategories] = useState({});
  const [productTypes, setProductTypes] = useState({});
  const [products, setProducts] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const fileInputRef = useRef(null);

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
      setIsInitialLoading(true);
      setError(null);

      const session = Cookies.get("session");
      const user = auth.currentUser;

      if (!session || !user) {
        throw new Error("Authentication required");
      }

      const [categoriesSnapshot, typesSnapshot, productsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "productTypes")),
          getDocs(query(collection(db, "products"), orderBy("name"))),
        ]);

      const categoriesData = {};
      categoriesSnapshot.forEach((doc) => {
        categoriesData[doc.id] = { id: doc.id, ...doc.data() };
      });

      const typesData = {};
      typesSnapshot.forEach((doc) => {
        typesData[doc.id] = { id: doc.id, ...doc.data() };
      });

      const productsData = [];
      productsSnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });

      setCategories(categoriesData);
      setProductTypes(typesData);
      setProducts(productsData);
    } catch (error) {
      if (error.message === "Authentication required") {
        router.push("/admin/login");
        return;
      }
      setError("Failed to fetch data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const session = Cookies.get("session");
      const user = auth.currentUser;

      if (!session || !user) {
        throw new Error("Authentication required. Please log in again.");
      }

      let imageUrl = productForm.imageUrl;

      // Handle image changes
      if (editingProduct) {
        // If editing and the image was changed or removed
        if (editingProduct.image !== productForm.imageUrl) {
          // Delete old image if it exists
          if (editingProduct.image) {
            try {
              await deleteFromCloudinary(editingProduct.image);
            } catch (deleteError) {
              console.error("Error deleting old image:", deleteError);
              // Continue with save even if delete fails
            }
          }

          // Upload new image if one was selected
          if (productForm.image) {
            try {
              imageUrl = await uploadToCloudinary(productForm.image);
              if (!imageUrl) {
                throw new Error("Failed to get image URL from Cloudinary");
              }
            } catch (uploadError) {
              console.error("Upload error details:", uploadError);
              throw new Error(`Image upload failed: ${uploadError.message}`);
            }
          } else {
            // If no new image was selected, set imageUrl to empty string
            imageUrl = "";
          }
        }
      } else {
        // If adding new product and image exists
        if (productForm.image) {
          try {
            imageUrl = await uploadToCloudinary(productForm.image);
            if (!imageUrl) {
              throw new Error("Failed to get image URL from Cloudinary");
            }
          } catch (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
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
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
          rating: 0,
          sold: 0,
        });
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }

      // Clean up any blob URLs before resetting form
      if (productForm.imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(productForm.imageUrl);
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
      await fetchData();
    } catch (error) {
      if (error.message.includes("Authentication required")) {
        Cookies.remove("session");
        router.push("/admin/login");
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Error saving product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, "products", id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      await fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
  };

  const handleImageUpload = ({ file, previewUrl }) => {
    setProductForm((prev) => ({
      ...prev,
      image: file,
      imageUrl: previewUrl,
    }));
  };

  const handleImageRemove = () => {
    if (!window.confirm("Are you sure you want to remove this image?")) {
      return;
    }

    // Clean up blob URL if it exists
    if (productForm.imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(productForm.imageUrl);
    }

    // Update form state
    setProductForm((prev) => ({
      ...prev,
      image: null,
      imageUrl: "",
    }));
  };

  // Add this to your form JSX, after the best seller checkbox
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload JPEG, PNG, or WebP images only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size too large. Maximum size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Set the file in state
    setProductForm((prev) => ({
      ...prev,
      image: file,
      // Create a temporary preview URL
      imageUrl: URL.createObjectURL(file),
    }));
  };

  // Add this cleanup effect
  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      if (productForm.imageUrl && productForm.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(productForm.imageUrl);
      }
    };
  }, [productForm.imageUrl]);

  if (isInitialLoading) {
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
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Products Management
                </h1>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin/dashboard")}
                >
                  Back to Dashboard
                </Button>
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      required
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border rounded-md"
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
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
                        setProductForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
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
                        setProductForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                      rows={4}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Product Image</Label>
                    <ImageUpload
                      value={productForm.imageUrl}
                      onChange={handleImageUpload}
                      onRemove={handleImageRemove}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopeeLink">Shopee Link</Label>
                    <Input
                      id="shopeeLink"
                      type="url"
                      value={productForm.shopeeLink}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          shopeeLink: e.target.value,
                        }))
                      }
                      required
                      placeholder="https://shopee.co.id/..."
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
                      <span className="flex items-center">
                        <Plus size={16} className="mr-2" />
                        Add Product
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Product Catalog</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
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
                        <h4 className="font-semibold mb-2 line-clamp-1">
                          {product.name}
                        </h4>
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
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
