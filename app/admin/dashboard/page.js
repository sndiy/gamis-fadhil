// app/admin/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/firebase/config";
import { auth } from "@/firebase/config";
import Cookies from "js-cookie";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Loader2,
  LogOut,
  Plus,
  Grid,
  Tag,
  Package,
  AlertCircle,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [categories, setCategories] = useState({});
  const [productTypes, setProductTypes] = useState({});
  const [activeTab, setActiveTab] = useState("categories");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Form states
  const [newCategory, setNewCategory] = useState({ key: "", value: "" });
  const [newProductType, setNewProductType] = useState({ key: "", value: "" });

  // Add refs for inputs that need to maintain focus
  const categoryKeyRef = useRef(null);
  const categoryValueRef = useRef(null);
  const typeKeyRef = useRef(null);
  const typeValueRef = useRef(null);

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

      const [categoriesSnapshot, typesSnapshot] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "productTypes")),
      ]);

      const categoriesData = {};
      categoriesSnapshot.forEach((doc) => {
        categoriesData[doc.id] = { id: doc.id, ...doc.data() };
      });

      const typesData = {};
      typesSnapshot.forEach((doc) => {
        typesData[doc.id] = { id: doc.id, ...doc.data() };
      });

      setCategories(categoriesData);
      setProductTypes(typesData);
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
    setIsSubmitting(true);
    try {
      if (!newProductType.key || !newProductType.value) {
        throw new Error("Please fill in all fields");
      }
      await addDoc(collection(db, "productTypes"), {
        key: newProductType.key,
        value: newProductType.value,
      });
      setNewProductType({ key: "", value: "" });
      toast({
        title: "Success",
        description: "Product type added successfully",
      });
      await fetchData();
      setTimeout(() => {
        if (focusedElement) {
          focusedElement.focus();
        }
      }, 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (collectionName, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, collectionName, id));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      await fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error deleting item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/products")}
                >
                  <Package size={16} className="mr-2" />
                  Manage Products
                </Button>
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
                            ref={categoryValueRef}
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
                            ref={typeValueRef}
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
