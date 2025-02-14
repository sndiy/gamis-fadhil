"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  getCategories,
  getAllProducts,
  getBestSellers,
  getProductsByCategory,
  searchProducts,
} from "../data/products";
import { CategoryTabs } from "../components/CategoryTabs";
import { ProductGrid } from "../components/ProductGrid";

export default function Home() {
  // State management
  const [categories, setCategories] = useState({});
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, productsData, bestSellersData] =
          await Promise.all([
            getCategories(),
            getAllProducts(),
            getBestSellers(),
          ]);

        setCategories(categoriesData);
        setProducts(productsData);
        setBestSellers(bestSellersData);
        // Set initial active category
        setActiveCategory(Object.values(categoriesData)[0]?.key || null);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load products. Please try again later.");
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle product filtering
  useEffect(() => {
    const filterProducts = async () => {
      if (!activeCategory) return;

      try {
        const filtered = searchQuery
          ? await searchProducts(searchQuery)
          : await getProductsByCategory(activeCategory);
        setFilteredProducts(filtered);
      } catch (err) {
        console.error("Error filtering products:", err);
        setError("Failed to filter products. Please try again.");
      }
    };

    filterProducts();
  }, [searchQuery, activeCategory]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Koleksi Gamis Premium
          </h1>
          <p className="text-lg">
            Tampil anggun dan syar'i dengan koleksi terbaik kami
          </p>
        </div>
      </div>

      {/* Best Sellers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Best Seller</h2>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      {/* All Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Semua Produk</h2>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full px-4 py-2 rounded-lg border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Category Tabs */}
          {activeCategory && (
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          )}

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </main>
  );
}
