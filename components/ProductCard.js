// components/ProductCard.js
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";

export function ProductCard({ product }) {
  const { name, price, image, rating, sold, shopeeLink } = product;

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <p className="text-emerald-600 font-bold mb-2">
          Rp {price.toLocaleString("id-ID")}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>⭐ {rating.toFixed(1)}</span>
          <span>{sold} terjual</span>
        </div>
        <a
          href={shopeeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full text-center bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Beli di Shopee
        </a>
      </div>
    </Card>
  );
}
