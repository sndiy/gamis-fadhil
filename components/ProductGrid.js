// components/ProductGrid.js
import Image from "next/image";
import Link from "next/link";

export function ProductGrid({ products = [] }) {
  const defaultImage = "/placeholder-image.jpg"; // Replace with your default image path

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link
            href={product.shopeeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="relative aspect-square">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
              ) : (
                <Image
                  src={defaultImage}
                  alt="Produk Premium"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 font-bold">
                  Rp {product.price?.toLocaleString("id-ID") || 0}
                </span>
                {product.sold > 0 && (
                  <span className="text-sm text-gray-500">
                    Terjual {product.sold}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
