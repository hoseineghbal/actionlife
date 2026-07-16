"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getStoreProducts, getCategories } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StoreProduct, Category } from "@/types";
import { getEffectivePrice, hasActiveDiscount } from "@/types";

export default function StorePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStoreProducts({
        page,
        limit,
        category: selectedCategory || undefined,
        search: search || undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, priceRange]);

  useEffect(() => {
    fetchProducts();
    getCategories().then(setCategories).catch(() => {});
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fa-IR").format(price);

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-light to-dark border-b border-white/5">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            فروشگاه <span className="text-accent">اکشن</span>
          </h1>
          <p className="text-lg text-gray-custom max-w-2xl">
            محصولات دیجیتال با کیفیت از بهترین تولیدکنندگان محتوا. با توکن خرید کنید.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجوی محصول..."
              className="flex-1 px-4 py-3 bg-dark-light border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
            >
              جستجو
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setSelectedCategory(""); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                !selectedCategory
                  ? "bg-accent text-white"
                  : "bg-dark-light text-gray-custom hover:text-white border border-white/10"
              }`}
            >
              همه
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat._id
                    ? "bg-accent text-white"
                    : "bg-dark-light text-gray-custom hover:text-white border border-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-custom">محدوده قیمت (توکن):</span>
            <input
              type="number"
              placeholder="از"
              value={priceRange.min ?? ""}
              onChange={(e) => { setPriceRange({ ...priceRange, min: e.target.value ? Number(e.target.value) : undefined }); setPage(1); }}
              className="w-24 px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
            />
            <span className="text-gray-custom">-</span>
            <input
              type="number"
              placeholder="تا"
              value={priceRange.max ?? ""}
              onChange={(e) => { setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : undefined }); setPage(1); }}
              className="w-24 px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-custom text-lg">محصولی یافت نشد</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} formatPrice={formatPrice} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30 transition-colors"
                >
                  قبلی
                </button>
                <span className="px-4 py-2 text-white text-sm">
                  صفحه {page} از {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30 transition-colors"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  formatPrice,
}: {
  product: StoreProduct;
  formatPrice: (p: number) => string;
}) {
  const effPrice = getEffectivePrice(product);
  const onSale = hasActiveDiscount(product);
  const discountPercent = onSale ? Math.round(((product.price - effPrice) / product.price) * 100) : 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group block bg-dark-light border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-custom/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
            {discountPercent}% تخفیف
          </span>
        )}
        {/* File count badge */}
        {product.files?.length > 0 && (
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-dark/80 text-white/70 text-xs rounded-lg backdrop-blur-sm">
            {product.files.length} فایل
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {product.title}
        </h3>
        {product.excerpt && (
          <p className="text-gray-custom text-sm mb-3 line-clamp-2">{product.excerpt}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div>
            {onSale ? (
              <div className="flex items-center gap-2">
                <span className="text-accent font-bold">{formatPrice(effPrice)}</span>
                <span className="text-gray-custom text-sm line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-accent font-bold">{formatPrice(product.price)}</span>
            )}
            <span className="text-gray-custom text-xs">توکن</span>
          </div>
          <span className="text-gray-custom text-xs">
            {product.seller?.fullName ?? "نامشخص"}
          </span>
        </div>
      </div>
    </Link>
  );
}
