"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getMyStoreProducts,
  getSellerOrders,
  deleteStoreProduct,
  updateStoreProduct,
} from "@/lib/api";
import type { StoreProduct, StoreOrder } from "@/types";

export default function MyProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const limit = 20;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    if (tab === "products") {
      getMyStoreProducts(token, page, limit)
        .then((res) => {
          setProducts(res.products);
          setProductsTotal(res.total);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      getSellerOrders(token, page, limit)
        .then((res) => {
          setOrders(res.orders);
          setOrdersTotal(res.total);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, page, user, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    const token = localStorage.getItem("access_token")!;
    try {
      await deleteStoreProduct(token, id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message ?? "خطا در حذف");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    // draft → pending (submit for review), pending/rejected → draft, published handled by admin
    const newStatus = currentStatus === "draft"
      ? "published" // service-layer changes "published" from non-admin to "pending"
      : "draft";
    const token = localStorage.getItem("access_token")!;
    try {
      await updateStoreProduct(token, id, { status: newStatus });
      // The server changes "published" to "pending" for non-admins
      const serverStatus = currentStatus === "draft" ? "pending" : "draft";
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: serverStatus } as StoreProduct : p)),
      );
    } catch (err: any) {
      alert(err.message ?? "خطا در تغییر وضعیت");
    }
  };

  const handlePriceUpdate = async (id: string) => {
    const token = localStorage.getItem("access_token")!;
    const price = newPrice ? Number(newPrice) : undefined;
    const discountPrice = newDiscount ? Number(newDiscount) : undefined;
    if (!price && !discountPrice) {
      setEditingPrice(null);
      return;
    }
    try {
      const updated = await updateStoreProduct(token, id, {
        price: price ?? undefined,
        discountPrice: discountPrice ?? undefined,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      );
      setEditingPrice(null);
      setNewPrice("");
      setNewDiscount("");
    } catch (err: any) {
      alert(err.message ?? "خطا در بروزرسانی");
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("fa-IR").format(p);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalProducts = Math.ceil(productsTotal / limit);
  const totalOrderPages = Math.ceil(ordersTotal / limit);
  const totalPages = tab === "products" ? totalProducts : totalOrderPages;

  if (!user || (user.role !== "admin" && !user.hasStore)) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-dark-light mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">دسترسی محدود</h1>
          <p className="text-gray-custom">شما دسترسی به فروشگاه ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <section className="border-b border-white/5 bg-dark-light/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-white mb-2">مدیریت فروشگاه</h1>
          <p className="text-gray-custom">محصولات و سفارشات شما</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 mb-6">
          <button
            onClick={() => { setTab("products"); setPage(1); }}
            className={`px-6 py-3 text-sm font-medium rounded-t-xl transition-colors ${
              tab === "products"
                ? "bg-accent text-white"
                : "text-gray-custom hover:text-white"
            }`}
          >
            محصولات من ({productsTotal})
          </button>
          <button
            onClick={() => { setTab("orders"); setPage(1); }}
            className={`px-6 py-3 text-sm font-medium rounded-t-xl transition-colors ${
              tab === "orders"
                ? "bg-accent text-white"
                : "text-gray-custom hover:text-white"
            }`}
          >
            سفارشات ({ordersTotal})
          </button>
          <div className="flex-1" />
          <Link
            href="/store/add"
            className="self-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-xl transition-colors"
          >
            + محصول جدید
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          </div>
        ) : tab === "products" ? (
          <>
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-custom text-lg mb-4">هنوز محصولی ثبت نکرده‌اید</p>
                <Link
                  href="/store/add"
                  className="inline-flex px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors"
                >
                  افزودن اولین محصول
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-dark-light border border-white/5 rounded-2xl p-4 md:p-5"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumbnail */}
                      <Link
                        href={`/store/${product.slug}`}
                        className="shrink-0 w-full md:w-32 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden"
                      >
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-custom/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/store/${product.slug}`}
                              className="text-white font-bold hover:text-accent transition-colors"
                            >
                              {product.title}
                            </Link>
                            <span
                              className={`mr-2 px-2 py-0.5 rounded text-xs font-medium ${
                                product.status === "published"
                                  ? "bg-green-500/10 text-green-400"
                                  : product.status === "pending"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : product.status === "rejected"
                                  ? "bg-red-500/10 text-red-400"
                                  : product.status === "archived"
                                  ? "bg-gray-500/10 text-gray-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {product.status === "published"
                                ? "منتشر شده"
                                : product.status === "pending"
                                ? "در انتظار تایید"
                                : product.status === "rejected"
                                ? "رد شده"
                                : product.status === "archived"
                                ? "آرشیو"
                                : "پیش‌نویس"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-gray-custom">
                          {editingPrice === product._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="قیمت"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-24 px-3 py-1.5 bg-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
                              />
                              <input
                                type="number"
                                placeholder="تخفیف"
                                value={newDiscount}
                                onChange={(e) => setNewDiscount(e.target.value)}
                                className="w-24 px-3 py-1.5 bg-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
                              />
                              <button
                                onClick={() => handlePriceUpdate(product._id)}
                                className="px-3 py-1.5 bg-accent text-white text-xs rounded-lg"
                              >
                                ذخیره
                              </button>
                              <button
                                onClick={() => setEditingPrice(null)}
                                className="px-3 py-1.5 text-gray-custom text-xs"
                              >
                                لغو
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPrice(product._id);
                                setNewPrice(String(product.price));
                                setNewDiscount(String(product.discountPrice || ""));
                              }}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                              {product.discountPrice > 0 ? (
                                <>
                                  <span className="text-accent font-bold">{formatPrice(product.discountPrice)}</span>
                                  <span className="line-through text-xs">{formatPrice(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-accent font-bold">{formatPrice(product.price)}</span>
                              )}
                              <span>توکن</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                          <span>{product.salesCount} فروش</span>
                          <span>{product.files?.length ?? 0} فایل</span>
                          <span>{formatDate(product.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center justify-center gap-2 shrink-0">
                        {product.status !== "published" ? (
                          <>
                            <button
                              onClick={() => handleStatusToggle(product._id, product.status)}
                              className={`w-full px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                                product.status === "draft"
                                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                              }`}
                            >
                              {product.status === "draft"
                                ? "ارسال برای انتشار"
                                : product.status === "pending"
                                ? "بازگشت به پیش‌نویس"
                                : product.status === "rejected"
                                ? "ویرایش مجدد"
                                : "پیش‌نویس"}
                            </button>
                            <Link
                              href={`/store/add?edit=${product._id}`}
                              className="w-full px-4 py-2 bg-dark border border-white/10 text-gray-custom hover:text-white rounded-lg text-xs text-center transition-colors"
                            >
                              ویرایش
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="w-full px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs transition-colors"
                            >
                              حذف
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-custom text-center">مدیریت توسط ادمین</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30"
                    >
                      قبلی
                    </button>
                    <span className="text-white text-sm">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30"
                    >
                      بعدی
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-custom">هنوز سفارشی ثبت نشده است</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-dark-light border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    {/* Product thumbnail */}
                    <Link
                      href={`/store/${order.productSlug}`}
                      className="shrink-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden"
                    >
                      {order.productCover ? (
                        <img src={order.productCover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-custom/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* Order details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/store/${order.productSlug}`}
                        className="text-white font-bold hover:text-accent transition-colors line-clamp-1"
                      >
                        {order.productTitle}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-custom">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          خریدار:{" "}
                          {typeof order.buyer === "object"
                            ? order.buyer?.fullName ?? "---"
                            : "---"}
                        </span>
                        {typeof order.buyer === "object" && order.buyer?.mobile && (
                          <span dir="ltr" className="text-xs">
                            {order.buyer.mobile}
                          </span>
                        )}
                        <span className="text-accent font-bold">
                          {formatPrice(order.finalPrice)} توکن
                          {order.price !== order.finalPrice && (
                            <span className="text-gray-custom text-xs line-through mr-1">
                              {formatPrice(order.price)}
                            </span>
                          )}
                        </span>
                        <span className="text-xs">{formatDate(order.createdAt)}</span>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                          تکمیل شده
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30"
                    >
                      قبلی
                    </button>
                    <span className="text-white text-sm">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg bg-dark-light border border-white/10 text-gray-custom hover:text-white disabled:opacity-30"
                    >
                      بعدی
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
