// app/page.js
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Heart,
  ShoppingBag,
  Package,
  Shield,
} from "lucide-react";
import {
  getCategories,
  getAllProducts,
  getBestSellers,
  getProductsByCategory,
  searchProducts,
} from "../data/products";
import { CategoryTabs } from "../components/CategoryTabs";
import { ProductGrid } from "../components/ProductGrid";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [categories, setCategories] = useState({});
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg shadow-md">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-lg text-emerald-800 font-medium">
            Memuat Koleksi...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              Koleksi Terbaru 2025
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Koleksi Gamis
              <span className="block text-emerald-200">Premium</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 mb-8">
              Tampil anggun dan syar'i dengan koleksi terbaik kami
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                className="px-8 py-3 bg-white text-emerald-800 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Lihat Koleksi
              </a>
              <a
                href="#bestsellers"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Best Seller
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Kualitas Premium",
                desc: "Bahan berkualitas tinggi dengan jahitan rapi",
              },
              {
                icon: Heart,
                title: "Desain Syar'i",
                desc: "Sesuai syariat dengan tetap stylish",
              },
              {
                icon: Package,
                title: "Pengiriman Cepat",
                desc: "Pengiriman aman ke seluruh Indonesia",
              },
              {
                icon: ShoppingBag,
                title: "Layanan Terbaik",
                desc: "Pelayanan ramah 24/7",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <section id="bestsellers" className="py-20 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mb-4">
              Paling Diminati
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Best Seller</h2>
            <p className="text-gray-600">
              Koleksi gamis terfavorit yang paling banyak diminati customer kami
            </p>
          </div>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mb-4">
              Koleksi Lengkap
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Semua Produk
            </h2>
            <p className="text-gray-600">
              Temukan koleksi gamis premium pilihan anda
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative group">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
            </div>
          </div>

          {/* Category Tabs */}
          {activeCategory && (
            <div className="mb-12">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} />
        </div>
      </section>

      {/* CTA Section /}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Dapatkan Update Koleksi Terbaru
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan newsletter kami untuk mendapatkan informasi
            tentang koleksi terbaru dan promo spesial
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Alamat email Anda"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
            />
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Berlangganan
            </button>
          </div>
        </div>
      </section>
      */}
    </main>
  );
}
