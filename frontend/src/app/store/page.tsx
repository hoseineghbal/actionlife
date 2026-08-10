"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getStoreProducts, getCategoryTree } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StoreProduct, Category, ProductCondition } from "@/types";
import { getEffectivePrice, hasActiveDiscount, PRODUCT_CONDITION_META, PRODUCT_TYPE_META } from "@/types";

export default function StorePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<Set<ProductCondition>>(new Set());
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const conditionList = selectedConditions.size > 0 ? Array.from(selectedConditions).join(',') : undefined;
      const res = await getStoreProducts({
        page,
        limit,
        category: selectedCategory || undefined,
        search: search || undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        conditionList,
      });
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, priceRange, selectedConditions]);

  useEffect(() => {
    fetchProducts();
    getCategoryTree().then(setCategoryTree).catch(() => {});
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const toggleCategory = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectCategory = (id: string) => {
    setPage(1);
    setSelectedCategory(id === selectedCategory ? "" : id);
  };

  const toggleCondition = (cond: ProductCondition) => {
    setPage(1);
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (next.has(cond)) next.delete(cond);
      else next.add(cond);
      return next;
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fa-IR").format(price);

  const getVariantStock = (p: StoreProduct): number => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((s, v) => s + (v.isActive !== false ? v.quantity : 0), 0);
    }
    return p.stockQuantity || 0;
  };

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
              placeholder="جستجوی محصول، برچسب یا کد محصول..."
              className="flex-1 px-4 py-3 bg-dark-light border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
            >
              جستجو
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar: Categories Tree + Condition Filter */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Collapsible Category Tree */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">دسته‌بندی‌ها</h3>
                  {selectedCategory && (
                    <button
                      onClick={() => { setSelectedCategory(""); setPage(1); }}
                      className="text-xs text-accent hover:underline"
                    >
                      پاک کردن
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleSelectCategory("")}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-accent text-white"
                        : "text-gray-custom hover:text-white hover:bg-white/5"
                    }`}
                  >
                    همه محصولات
                  </button>
                  {categoryTree.map((cat) => (
                    <CategoryNode
                      key={cat._id}
                      node={cat}
                      level={0}
                      expandedCats={expandedCats}
                      selectedCategory={selectedCategory}
                      onToggle={toggleCategory}
                      onSelect={handleSelectCategory}
                    />
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-bold mb-4">وضعیت محصول</h3>
                <div className="space-y-2">
                  {(Object.keys(PRODUCT_CONDITION_META) as ProductCondition[]).map((key) => {
                    const meta = PRODUCT_CONDITION_META[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                          selectedConditions.has(key)
                            ? "border-accent/50 bg-accent/10"
                            : "border-white/5 bg-white/0 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedConditions.has(key)}
                          onChange={() => toggleCondition(key)}
                          className="accent-accent w-4 h-4"
                        />
                        <span className={`text-xs font-medium ${meta.color.replace('700', '300')}`}>
                          {meta.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedConditions.size > 0 && (
                  <button
                    onClick={() => { setSelectedConditions(new Set()); setPage(1); }}
                    className="mt-3 text-xs text-accent hover:underline"
                  >
                    پاک کردن فیلتر وضعیت
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="bg-dark-light border border-white/5 rounded-2xl p-4">
                <h3 className="text-white font-bold mb-4">محدوده قیمت</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="از (توکن)"
                      value={priceRange.min ?? ""}
                      onChange={(e) => { setPriceRange({ ...priceRange, min: e.target.value ? Number(e.target.value) : undefined }); setPage(1); }}
                      className="flex-1 px-3 py-2 bg-dark border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="تا (توکن)"
                      value={priceRange.max ?? ""}
                      onChange={(e) => { setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : undefined }); setPage(1); }}
                      className="flex-1 px-3 py-2 bg-dark border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content: Products + Quick category chips */}
            <div className="lg:col-span-9 space-y-6">
              {/* Active filters summary */}
              {(selectedCategory || selectedConditions.size > 0 || search || priceRange.min || priceRange.max) && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-dark-light border border-white/5 rounded-xl">
                  <span className="text-xs text-gray-custom ml-2">فیلترهای فعال:</span>
                  {search && (
                    <FilterChip label={`جستجو: "${search}"`} onRemove={() => { setSearch(""); setSearchInput(""); setPage(1); }} />
                  )}
                  {selectedCategory && (
                    <FilterChip label="دسته‌بندی انتخاب شده" onRemove={() => { setSelectedCategory(""); setPage(1); }} />
                  )}
                  {selectedConditions.size > 0 && (
                    <FilterChip label={`${selectedConditions.size} وضعیت`} onRemove={() => { setSelectedConditions(new Set()); setPage(1); }} />
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <FilterChip label="محدوده قیمت" onRemove={() => { setPriceRange({}); setPage(1); }} />
                  )}
                  <button
                    onClick={() => {
                      setSearch(""); setSearchInput(""); setSelectedCategory("");
                      setSelectedConditions(new Set()); setPriceRange({}); setPage(1);
                    }}
                    className="mr-auto text-xs text-accent hover:underline"
                  >
                    پاک کردن همه
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-dark-light border border-white/5 rounded-2xl">
                  <svg className="w-16 h-16 mx-auto text-gray-custom/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-custom text-lg">محصولی با این فیلترها یافت نشد</p>
                  <button
                    onClick={() => {
                      setSearch(""); setSearchInput(""); setSelectedCategory("");
                      setSelectedConditions(new Set()); setPriceRange({}); setPage(1);
                    }}
                    className="mt-4 px-4 py-2 text-sm text-accent hover:text-accent/80 underline"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} formatPrice={formatPrice} variantStock={getVariantStock(product)} />
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
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
      {label}
      <button onClick={onRemove} className="ml-1 hover:text-white">
        ×
      </button>
    </span>
  );
}

function CategoryNode({
  node,
  level,
  expandedCats,
  selectedCategory,
  onToggle,
  onSelect,
}: {
  node: Category;
  level: number;
  expandedCats: Set<string>;
  selectedCategory: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedCats.has(node._id);
  const isSelected = selectedCategory === node._id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
          isSelected
            ? "bg-accent text-white"
            : "text-gray-custom hover:text-white hover:bg-white/5"
        }`}
        style={{ paddingRight: `${12 + level * 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(node._id); }}
            className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-custom hover:text-white"
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <button
          onClick={() => onSelect(node._id)}
          className="flex-1 text-right truncate"
        >
          {node.name}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {node.children!.map((child) => (
            <CategoryNode
              key={child._id}
              node={child}
              level={level + 1}
              expandedCats={expandedCats}
              selectedCategory={selectedCategory}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  formatPrice,
  variantStock,
}: {
  product: StoreProduct;
  formatPrice: (p: number) => string;
  variantStock: number;
}) {
  const effPrice = getEffectivePrice(product);
  const onSale = hasActiveDiscount(product);
  const discountPercent = onSale ? Math.round(((product.price - effPrice) / product.price) * 100) : 0;

  const totalStock = product.variants && product.variants.length > 0 ? variantStock : product.stockQuantity;
  const condition = product.condition || 'new';
  const condMeta = PRODUCT_CONDITION_META[condition];
  const productType = product.productType || 'physical';
  const isDigital = productType === 'digital';
  const typeMeta = PRODUCT_TYPE_META[productType];
  const stockLow = !isDigital && product.trackInventory !== false && totalStock > 0 && totalStock <= 3;
  const outOfStock = !isDigital && product.trackInventory !== false && totalStock === 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className={`group block bg-dark-light border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 ${outOfStock ? "opacity-70" : ""}`}
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

        {/* Top badges */}
        <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2 flex-wrap-reverse">
          <div className="flex flex-col gap-1">
            {onSale && (
              <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm self-start">
                {discountPercent}% تخفیف
              </span>
            )}
            {outOfStock && (
              <span className="px-3 py-1 bg-gray-800/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                ناموجود
              </span>
            )}
            {stockLow && !outOfStock && (
              <span className="px-3 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                تنها {totalStock} عدد باقی مانده
              </span>
            )}
          </div>
          {condMeta && (
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-sm ${condMeta.bg} ${condMeta.color}`} style={{ background: condMeta.color.includes('green') ? 'rgba(22,163,74,0.9)' : condMeta.color.includes('yellow') ? 'rgba(202,138,4,0.9)' : 'rgba(220,38,38,0.9)', color: '#fff' }}>
              {condMeta.label}
            </span>
          )}
          {isDigital && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-sm bg-blue-500/90 text-white">
              {typeMeta.label}
            </span>
          )}
        </div>

        {/* File count badge - for digital products */}
        {isDigital && product.files?.length > 0 && (
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500/80 text-white text-xs rounded-lg backdrop-blur-sm">
            {product.files.length} فایل
          </span>
        )}
        {/* File count badge - for physical products */}
        {!isDigital && product.files?.length > 0 && (
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

        {product.sku && (
          <p className="text-gray-custom/70 text-[11px] mb-2 dir-ltr text-left">
            SKU: {product.sku}
          </p>
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
          <div className="text-left">
            <span className="text-gray-custom text-xs block">
              {typeof product.seller === 'object' ? product.seller?.fullName ?? "نامشخص" : "نامشخص"}
            </span>
            {!isDigital && product.trackInventory !== false && (
              <span className={`text-[11px] ${outOfStock ? "text-red-400" : stockLow ? "text-orange-400" : "text-gray-custom/60"}`}>
                {outOfStock ? "ناموجود" : `موجودی: ${totalStock}`}
              </span>
            )}
            {isDigital && (
              <span className="text-[11px] text-gray-custom/60">
                دانلودی
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
