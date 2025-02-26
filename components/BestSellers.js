// components/BestSellers.js
"use client";

import { ProductGrid } from "./ProductGrid";
import { motion } from "react-dom";

export function BestSellers({ products = [] }) {
  return (
    <section id="bestsellers" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            Paling Laris
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Best Seller</h2>
          <p className="text-gray-600 text-lg">
            Koleksi gamis terfavorit yang paling banyak diminati customer kami.
            Kualitas terbaik dengan desain eksklusif.
          </p>
        </div>

        {/* Products Grid with Stats */}
        <div className="mb-12">
          <ProductGrid products={products} />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { label: "Terjual", value: "5000+" },
            { label: "Rating", value: "4.9/5.0" },
            { label: "Ulasan", value: "1200+" },
            { label: "Pembeli Puas", value: "99%" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-emerald-50"
            >
              <div className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2">
                {stat.value}
              </div>
              <div className="text-emerald-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Preview */}
      <div className="mt-20 bg-emerald-50/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">
              Apa Kata Customer Kami
            </h3>
            <p className="text-gray-600">Testimoni dari pelanggan setia kami</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                text: "Kualitas bahan sangat bagus, jahitan rapi, dan pengiriman cepat!",
                author: "Sarah A.",
                rating: 5,
              },
              {
                text: "Modelnya cantik dan sesuai gambar. Sangat puas dengan pembelian saya.",
                author: "Fatima R.",
                rating: 5,
              },
              {
                text: "Pelayanan ramah dan responsif. Akan belanja lagi di sini!",
                author: "Aisha N.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex text-emerald-500 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.text}</p>
                <p className="text-emerald-600 font-medium">
                  {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
