"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoreProductBySlug, purchaseProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StoreProduct } from "@/types";
import { getEffectivePrice, hasActiveDiscount } from "@/types";

// Simple cart hook using localStorage
function useCart() {
  const getCart = (): import("@/types").CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  };

  const addToCart = (item: import("@/types").CartItem) => {
    const cart = getCart();
    const exists = cart.find((i) => i.productId === item.productId);
    if (!exists) {
      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    }
    return cart;
  };

  const isInCart = (productId: string) => {
    return getCart().some((i) => i.productId === productId);
  };

  const removeFromCart = (productId: string) => {
    const cart = getCart().filter((i) => i.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    return cart;
  };

  return { getCart, addToCart, isInCart, removeFromCart };
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const cart = useCart();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [activeTab, setActiveTab] = useState<"files" | "description">("files");
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ url: string; title: string; fileType: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || undefined;
    getStoreProductBySlug(slug, token)
      .then((data) => {
        setProduct(data);
        setPurchased(data.hasPurchased ?? false);
        setInCart(cart.isInCart(data._id));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || purchased) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (inCart) {
      cart.removeFromCart(product._id);
      setInCart(false);
    } else {
      cart.addToCart({
        productId: product._id,
        title: product.title,
        slug: product.slug,
        coverImage: product.coverImage,
        price: product.price,
        discountPrice: finalPrice,
        sellerName: product.seller?.fullName ?? "",
      });
      setInCart(true);
    }
  };

  const handleBuyNow = async () => {
    if (!product || purchased) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setBuying(true);
    try {
      const token = localStorage.getItem("access_token")!;
      await purchaseProduct(token, product._id);
      setPurchased(true);
      // Always remove from cart if it's there (check localStorage, not state)
      if (cart.isInCart(product._id)) {
        cart.removeFromCart(product._id);
      }
      setInCart(false);
    } catch (err: any) {
      alert(err.message ?? "خطا در خرید");
    } finally {
      setBuying(false);
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("fa-IR").format(p);

  const fileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "image":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "audio":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "pdf": return "PDF";
      case "video": return "ویدیو";
      case "image": return "تصویر";
      case "audio": return "صوتی";
      default: return type;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "pdf": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "video": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "image": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "audio": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-dark-light text-gray-custom border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-custom text-xl mb-4">محصول یافت نشد</p>
          <Link href="/store" className="text-accent hover:underline">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = getEffectivePrice(product);
  const isOwner = user && product.seller?._id === user.id;

  return (
    <div className="min-h-screen bg-dark">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-dark-light/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-custom">
            <Link href="/" className="hover:text-white transition-colors">خانه</Link>
            <span>/</span>
            <Link href="/store" className="hover:text-white transition-colors">فروشگاه</Link>
            <span>/</span>
            <span className="text-white truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden border border-white/5">
              {product.coverImage ? (
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-custom/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>

            {hasActiveDiscount(product) && (
              <span className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl">
                {Math.round(((product.price - finalPrice) / product.price) * 100)}% تخفیف
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Seller */}
            {product.seller?._id ? (
              <Link href={`/users/${product.seller.username || product.seller._id}`} className="flex items-center gap-3 mb-6 p-3 bg-dark-light rounded-xl border border-white/5 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                  {product.seller?.fullName?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p className="text-white text-sm font-medium hover:text-accent transition-colors">{product.seller?.fullName ?? "نامشخص"}</p>
                  <p className="text-gray-custom text-xs">فروشنده</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 mb-6 p-3 bg-dark-light rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                  {product.seller?.fullName?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{product.seller?.fullName ?? "نامشخص"}</p>
                  <p className="text-gray-custom text-xs">فروشنده</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="bg-dark-light rounded-2xl p-6 border border-white/5 mb-6">
              <p className="text-gray-custom text-sm mb-2">قیمت:</p>
              <div className="flex items-baseline gap-3">
                {finalPrice < product.price ? (
                  <>
                    <span className="text-3xl font-black text-accent">{formatPrice(finalPrice)}</span>
                    <span className="text-xl text-gray-custom line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-accent">{formatPrice(product.price)}</span>
                )}
                <span className="text-gray-custom text-lg">توکن</span>
              </div>
            </div>

            {/* Actions */}
            {purchased ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center mb-6">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-400 font-bold text-lg">شما این محصول را خریداری کرده‌اید</p>
                <p className="text-green-400/70 text-sm mt-1">فایل‌های محصول در پایین صفحه قابل مشاهده است</p>
              </div>
            ) : isOwner ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center mb-6">
                <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-blue-400 font-bold text-lg">این محصول متعلق به شماست</p>
                <p className="text-blue-400/70 text-sm mt-1">نمی‌توانید محصول خود را خریداری کنید</p>
              </div>
            ) : (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="flex-1 py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  {buying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      در حال خرید...
                    </span>
                  ) : (
                    "خرید فوری"
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`px-6 py-4 rounded-xl font-bold border transition-all ${
                    inCart
                      ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "border-white/10 bg-dark-light text-white hover:border-accent/50"
                  }`}
                >
                  {inCart ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      حذف از سبد
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      افزودن به سبد
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-custom mb-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {product.salesCount} فروش
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {product.views} بازدید
              </span>
              {product.category && (
                <span className="px-3 py-1 bg-dark-light rounded-lg border border-white/5 text-xs">
                  {typeof product.category === "object" ? product.category.name : ""}
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="mt-12">
          <div className="flex gap-2 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("files")}
              className={`px-6 py-3 text-sm font-medium rounded-t-xl transition-colors ${
                activeTab === "files"
                  ? "bg-accent text-white"
                  : "text-gray-custom hover:text-white"
              }`}
            >
              فایل‌های محصول ({product.files?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 text-sm font-medium rounded-t-xl transition-colors ${
                activeTab === "description"
                  ? "bg-accent text-white"
                  : "text-gray-custom hover:text-white"
              }`}
            >
              توضیحات
            </button>
          </div>

          {activeTab === "files" && (
            <div>
              {!product.files || product.files.length === 0 ? (
                <p className="text-gray-custom text-center py-12">هیچ فایلی برای این محصول ثبت نشده است</p>
              ) : purchased || isOwner ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.files
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setViewingFile({ url: file.url, title: file.title, fileType: file.fileType });
                          setFileViewerOpen(true);
                        }}
                        className="flex items-start gap-4 p-4 bg-dark-light border border-white/5 rounded-xl hover:border-accent/30 transition-all text-right"
                      >
                        <div className={`shrink-0 p-3 rounded-xl border ${typeColor(file.fileType)}`}>
                          {fileIcon(file.fileType)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium mb-1">{file.title}</h4>
                          {file.description && (
                            <p className="text-gray-custom text-sm line-clamp-2">{file.description}</p>
                          )}
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs border ${typeColor(file.fileType)}`}>
                            {typeLabel(file.fileType)}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-dark-light mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-gray-custom mb-2">برای مشاهده فایل‌ها ابتدا محصول را خریداری کنید</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "description" && (
            <div className="prose prose-invert max-w-none">
              {product.description ? (
                <div
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-custom text-center py-12">توضیحاتی برای این محصول ثبت نشده است</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File Viewer Modal */}
      {fileViewerOpen && viewingFile && (
        <div
          className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setFileViewerOpen(false); setViewingFile(null); }}
        >
          <button
            onClick={() => { setFileViewerOpen(false); setViewingFile(null); }}
            className="absolute top-4 left-4 p-2 bg-dark-light rounded-xl text-white hover:text-accent transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-bold mb-4">{viewingFile.title}</h3>
            {viewingFile.fileType === "image" && (
              <img src={viewingFile.url} alt={viewingFile.title} className="max-w-full max-h-[75vh] rounded-xl object-contain mx-auto" />
            )}
            {viewingFile.fileType === "video" && (
              <video src={viewingFile.url} controls className="max-w-full max-h-[75vh] rounded-xl mx-auto" />
            )}
            {viewingFile.fileType === "audio" && (
              <audio src={viewingFile.url} controls className="w-full mt-4" />
            )}
            {viewingFile.fileType === "pdf" && (
              <iframe src={viewingFile.url} className="w-full h-[75vh] rounded-xl" title={viewingFile.title} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
