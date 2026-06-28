import Link from "next/link";
import type { StoreProduct } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default function StoreProductCard({ product }: { product: StoreProduct }) {
  return (
    <Link
      href={`/store/${product.slug}`}
      className="group block bg-dark-light border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-custom/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {product.discountPrice > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-lg">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% تخفیف
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-bold text-sm mb-1 group-hover:text-accent transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          {product.discountPrice > 0 ? (
            <>
              <span className="text-accent font-bold text-sm">{formatPrice(product.discountPrice)}</span>
              <span className="text-gray-custom text-xs line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-accent font-bold text-sm">{formatPrice(product.price)}</span>
          )}
          <span className="text-gray-custom text-xs">توکن</span>
        </div>
      </div>
    </Link>
  );
}
