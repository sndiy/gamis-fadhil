// components/Hero.js
"use client";

import { motion } from "react-dom";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-600 text-white">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 30L60 30' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative py-24 lg:py-32 container mx-auto px-4">
        <div className="max-w-2xl">
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
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
            >
              Lihat Koleksi
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#bestsellers"
              className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Best Seller
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-4 lg:right-12 bottom-12 hidden lg:block">
          <div className="w-48 h-48 rounded-full bg-emerald-500/20 backdrop-blur-sm" />
          <div className="w-32 h-32 rounded-full bg-emerald-500/20 backdrop-blur-sm absolute -top-16 -left-16" />
        </div>
      </div>
    </div>
  );
}
