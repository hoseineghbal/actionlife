"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createStoreProduct, updateStoreProduct, getCategories, getStudioFiles } from "@/lib/api";
import type { Category, ProductFile, StoreProduct, StudioFile } from "@/types";
import { PRODUCT_TYPE_META } from "@/types";

function AddProductForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    coverImage: "",
    price: "",
    discountPrice: "",
    category: "",
    tags: "",
    status: "draft",
    productType: "physical" as "physical" | "digital",
    condition: "new" as "new" | "used" | "clearance",
    stockQuantity: "",
    sku: "",
    weight: "",
  });

  const [files, setFiles] = useState<ProductFile[]>([]);

  // Studio library picker
  const [showStudioPicker, setShowStudioPicker] = useState(false);
  const [studioFiles, setStudioFiles] = useState<StudioFile[]>([]);
  const [loadingStudio, setLoadingStudio] = useState(false);

  const openStudioPicker = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setShowStudioPicker(true);
    setLoadingStudio(true);
    try {
      const files = await getStudioFiles(token);
      setStudioFiles(files);
    } catch {
      // ignore
    } finally {
      setLoadingStudio(false);
    }
  };

  const selectStudioFile = (sf: StudioFile) => {
    setFiles([
      ...files,
      {
        url: sf.url,
        title: sf.title,
        fileType: sf.type,
        order: files.length,
      },
    ]);
    setShowStudioPicker(false);
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});

    if (isEdit && editId) {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/store/product/${editId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data: StoreProduct) => {
          setForm({
            title: data.title,
            slug: data.slug,
            description: data.description ?? "",
            excerpt: data.excerpt ?? "",
            coverImage: data.coverImage ?? "",
            price: String(data.price),
            discountPrice: data.discountPrice ? String(data.discountPrice) : "",
            category: typeof data.category === "object" && data.category ? data.category._id : data.category ?? "",
            tags: data.tags?.join(", ") ?? "",
            status: data.status,
            productType: (data.productType as "physical" | "digital") || "physical",
            condition: (data.condition as "new" | "used" | "clearance") || "new",
            stockQuantity: data.stockQuantity ? String(data.stockQuantity) : "",
            sku: data.sku ?? "",
            weight: data.weight != null ? String(data.weight) : "",
          });
          setFiles(
            data.files?.map((f) => ({
              url: f.url,
              title: f.title,
              description: f.description ?? "",
              fileType: f.fileType,
              order: f.order ?? 0,
            })) ?? [],
          );
        })
        .catch(() => alert("خطا در بارگذاری محصول"))
        .finally(() => setLoadingProduct(false));
    }
  }, [isEdit, editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addFile = () => {
    setFiles([...files, { url: "", title: "", description: "", fileType: "pdf", order: files.length }]);
  };

  const updateFile = (index: number, field: string, value: string) => {
    const updated = [...files];
    (updated[index] as unknown as Record<string, string>)[field] = value;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim() || !form.price) {
      alert("عنوان، اسلاگ و قیمت الزامی هستند");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        excerpt: form.excerpt.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        category: form.category || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: form.status,
        productType: form.productType,
        condition: form.condition,
        files: files.filter((f) => f.url.trim() && f.title.trim()),
      };

      if (form.productType === 'physical') {
        payload.stockQuantity = form.stockQuantity ? Number(form.stockQuantity) : 0;
        payload.sku = form.sku.trim() || undefined;
        payload.weight = form.weight ? Number(form.weight) : undefined;
      }

      if (isEdit && editId) {
        await updateStoreProduct(token, editId, payload);
      } else {
        await createStoreProduct(token, payload);
      }
      router.push("/store");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در ثبت محصول");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-custom text-xl mb-4">برای افزودن محصول وارد شوید</p>
          <Link href="/auth/login" className="text-accent hover:underline">ورود به حساب</Link>
        </div>
      </div>
    );
  }

  if (!user.hasStore && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-dark-light mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">دسترسی محدود</h1>
          <p className="text-gray-custom mb-4">
            شما دسترسی به ایجاد فروشگاه ندارید. برای دریافت این دسترسی با مدیریت تماس بگیرید.
          </p>
        </div>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8">
          {isEdit ? "ویرایش محصول" : "افزودن محصول جدید"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">اطلاعات پایه</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-custom mb-2">عنوان محصول *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  placeholder="مثلا: آموزش بقا در طبیعت"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">اسلاگ (URL) *</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  dir="ltr"
                  placeholder="product-slug"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">قیمت (توکن) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">قیمت تخفیفی (توکن)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  placeholder="اختیاری"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">تصویر کاور (URL)</label>
                <input
                  type="text"
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">دسته‌بندی</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">وضعیت</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">ارسال برای انتشار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">نوع محصول</label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                >
                  {Object.entries(PRODUCT_TYPE_META).map(([val, meta]) => (
                    <option key={val} value={val}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-2">وضعیت کالا</label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                >
                  <option value="new">نو</option>
                  <option value="used">استفاده شده</option>
                  <option value="clearance">استوک / پاکسازی</option>
                </select>
              </div>
              {form.productType === 'physical' && (
                <>
                <div>
                  <label className="block text-sm text-gray-custom mb-2">موجودی</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                    placeholder="تعداد موجودی"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-custom mb-2">کد محصول (SKU)</label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                    dir="ltr"
                    placeholder="مثل SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-custom mb-2">وزن (کیلوگرم)</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                    dir="ltr"
                    placeholder="مثل 1.5"
                  />
                </div>
                </>
              )}
              <div>
                <label className="block text-sm text-gray-custom mb-2">تگ‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                  placeholder="بقا, طبیعت, آموزش"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-custom mb-2">خلاصه</label>
              <input
                type="text"
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                placeholder="توضیح کوتاه محصول"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-custom mb-2">توضیحات کامل</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                placeholder="توضیحات کامل محصول..."
              />
            </div>
          </div>

          {/* Files */}
          <div className="bg-dark-light border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">فایل‌های محصول</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openStudioPicker}
                  className="px-4 py-2 bg-accent/20 border border-accent/30 text-accent hover:bg-accent hover:text-white text-sm rounded-xl transition-colors"
                >
                  📂 استودیو من
                </button>
                <button
                  type="button"
                  onClick={addFile}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-xl transition-colors"
                >
                  + افزودن فایل با لینک
                </button>
              </div>
            </div>

            {files.length === 0 && (
              <p className="text-gray-custom text-center py-8">هنوز فایلی اضافه نشده است</p>
            )}

            <div className="space-y-4">
              {files.map((file, idx) => (
                <div key={idx} className="bg-dark rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">فایل #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-gray-custom hover:text-red-400 transition-colors text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-custom mb-1">عنوان فایل *</label>
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateFile(idx, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                        placeholder="عنوان فایل"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-custom mb-1">نوع فایل</label>
                      <select
                        value={file.fileType}
                        onChange={(e) => updateFile(idx, "fileType", e.target.value)}
                        className="w-full px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent/50"
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">ویدیو</option>
                        <option value="image">تصویر</option>
                        <option value="audio">صوتی</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-custom mb-1">آدرس فایل (URL) *</label>
                      <input
                        type="text"
                        value={file.url}
                        onChange={(e) => updateFile(idx, "url", e.target.value)}
                        className="w-full px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                        dir="ltr"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-custom mb-1">توضیحات فایل</label>
                      <input
                        type="text"
                        value={file.description || ""}
                        onChange={(e) => updateFile(idx, "description", e.target.value)}
                        className="w-full px-3 py-2 bg-dark-light border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-custom focus:outline-none focus:border-accent/50"
                        placeholder="توضیحات اختیاری"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
            >
              {submitting ? "در حال ثبت..." : isEdit ? "بروزرسانی محصول" : "ثبت محصول"}
            </button>
            <Link
              href="/store/my-products"
              className="px-6 py-4 border border-white/10 text-gray-custom hover:text-white rounded-xl transition-colors"
            >
              انصراف
            </Link>
          </div>
        </form>

        {/* Studio Picker Modal */}
        {showStudioPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowStudioPicker(false)} />
            <div className="relative bg-dark-light border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">انتخاب از استودیو</h3>
                <button onClick={() => setShowStudioPicker(false)} className="text-gray-custom hover:text-white text-xl">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {loadingStudio ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>
                ) : studioFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-custom mb-4">هنوز فایلی در استودیو ندارید</p>
                    <Link href="/studio" className="text-accent hover:underline text-sm">رفتن به استودیو</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {studioFiles.map((sf) => (
                      <button
                        key={sf._id}
                        type="button"
                        onClick={() => selectStudioFile(sf)}
                        className="flex items-center gap-4 bg-dark hover:bg-dark-light rounded-xl p-4 border border-white/5 hover:border-accent/30 transition-all text-left"
                      >
                        <span className="text-3xl">{sf.type === "video" ? "🎥" : "🎙️"}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium line-clamp-1">{sf.title}</h4>
                          <p className="text-gray-custom text-xs mt-1">
                            {sf.type === "video" ? "ویدیو" : "صدا"}
                            {sf.isEdited && " (ویرایش شده)"}
                            {" · "}
                            {new Date(sf.createdAt).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                        <span className="text-accent text-sm whitespace-nowrap">انتخاب ←</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    }>
      <AddProductForm />
    </Suspense>
  );
}
