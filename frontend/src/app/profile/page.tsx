"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile, uploadFile, requestStore } from "@/lib/api";
import type { User } from "@/types";

const educationOptions = [
  "دیپلم",
  "کاردانی",
  "کارشناسی",
  "کارشناسی ارشد",
  "دکتری",
  "حوزوی",
  "سایر",
];

const genderOptions = [
  { label: "مرد", value: "male" },
  { label: "زن", value: "female" },
];

const interestOptions = [
  "فیلم و سینما",
  "بازی‌های ویدیویی",
  "سفر و گردشگری",
  "ورزش و تناسب اندام",
  "موسیقی",
  "عکاسی",
  "آشپزی",
  "کتاب و مطالعه",
  "تکنولوژی",
  "هنر و طراحی",
  "طبیعت",
  "برنامه‌نویسی",
];

type ActiveTab = "basic" | "education" | "location" | "social" | "banking";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [storeReqLoading, setStoreReqLoading] = useState(false);
  const [storeReqMsg, setStoreReqMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const [usernameConfirmInput, setUsernameConfirmInput] = useState('');
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    mobile: "",
    headerImage: "",
    bio: "",
    birthDate: "",
    gender: "",
    education: "",
    fieldOfStudy: "",
    expertise: "",
    interests: [] as string[],
    country: "",
    city: "",
    website: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    cardNumber: "",
    shebaNumber: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) return;

    getProfile(token)
      .then((data) => {
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          username: data.username || "",
          mobile: data.mobile || "",
          headerImage: data.headerImage || "",
          bio: data.bio || "",
          birthDate: data.birthDate || "",
          gender: data.gender || "",
          education: data.education || "",
          fieldOfStudy: data.fieldOfStudy || "",
          expertise: data.expertise || "",
          interests: data.interests || [],
          country: data.country || "",
          city: data.city || "",
          website: data.website || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
          cardNumber: data.cardNumber || "",
          shebaNumber: data.shebaNumber || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "فقط فایل‌های تصویری مجاز هستند" });
      return;
    }

    setUploadingHeader(true);
    setMessage(null);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const result = await uploadFile(token, file, "profile");
      handleChange("headerImage", result.url);
      setMessage({ type: "success", text: "عکس هدر با موفقیت آپلود شد. برای ذخیره دکمه ذخیره را بزنید." });
    } catch {
      setMessage({ type: "error", text: "خطا در آپلود عکس هدر" });
    } finally {
      setUploadingHeader(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If username is being set for the first time, show confirmation modal
    if (!profile?.username && form.username.trim()) {
      setShowUsernameConfirm(true);
      return;
    }

    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      await updateProfile(token, form);
      setMessage({ type: "success", text: "پروفایل با موفقیت به‌روزرسانی شد" });
      setShowUsernameConfirm(false);
      setUsernameConfirmInput('');
      // Refresh profile data
      const prof = await getProfile(token);
      setProfile(prof);
    } catch {
      setMessage({ type: "error", text: "خطا در به‌روزرسانی پروفایل" });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmUsername = () => {
    if (usernameConfirmInput.trim().toLowerCase() !== form.username.trim().toLowerCase()) {
      setMessage({ type: "error", text: "نام کاربری وارد شده با مقدار انتخابی مطابقت ندارد" });
      return;
    }
    setMessage(null);
    doSave();
  };

  const handleRequestStore = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setStoreReqLoading(true);
    setStoreReqMsg(null);
    try {
      const res = await requestStore(token);
      setStoreReqMsg(res.message);
      setProfile((prev) => prev ? { ...prev, storeRequestStatus: 'pending' } : null);
    } catch (err: any) {
      setStoreReqMsg(err.message ?? "خطا در ثبت درخواست");
    } finally {
      setStoreReqLoading(false);
    }
  };

  if (!user) return null;

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "basic",
      label: "اطلاعات پایه",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: "education",
      label: "تحصیلات و تخصص",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
        </svg>
      ),
    },
    {
      key: "location",
      label: "محل زندگی",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: "social",
      label: "شبکه‌های اجتماعی",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      key: "banking",
      label: "اطلاعات بانکی",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* هدر صفحه */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {form.fullName?.charAt(0) || user.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                پروفایل <span className="text-accent">کاربری</span>
              </h1>
              <p className="text-gray-custom">{profile?.email || user.email}</p>
            </div>
          </div>

          {/* Store Request */}
          {(!profile?.hasStore && profile?.storeRequestStatus !== 'approved') && (
            <div className="mt-6 p-4 bg-dark border border-white/10 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">فروشگاه شخصی</h3>
                  <p className="text-gray-custom text-xs">
                    {profile?.storeRequestStatus === 'pending'
                      ? 'درخواست شما در انتظار بررسی توسط ادمین است.'
                      : profile?.storeRequestStatus === 'rejected'
                      ? 'درخواست قبلی شما رد شده است. می‌توانید مجددا درخواست دهید.'
                      : 'محصولات دیجیتال خود را بفروشید و کسب درآمد کنید.'}
                  </p>
                </div>
                <button
                  onClick={handleRequestStore}
                  disabled={storeReqLoading || profile?.storeRequestStatus === 'pending'}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    profile?.storeRequestStatus === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-400 cursor-not-allowed'
                      : 'bg-accent hover:bg-accent/90 text-white disabled:opacity-50'
                  }`}
                >
                  {storeReqLoading
                    ? 'در حال ثبت...'
                    : profile?.storeRequestStatus === 'pending'
                    ? 'در انتظار تایید'
                    : profile?.storeRequestStatus === 'rejected'
                    ? 'درخواست مجدد فروشگاه'
                    : 'درخواست فروشگاه'}
                </button>
              </div>
              {storeReqMsg && (
                <p className={`mt-2 text-xs ${storeReqMsg.includes('موفقیت') ? 'text-green-400' : 'text-red-400'}`}>
                  {storeReqMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* تب‌ها */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "gradient-primary text-white"
                      : "bg-dark-light text-gray-custom hover:text-white border border-white/10"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* اطلاعات پایه */}
            {activeTab === "basic" && (
              <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white mb-4">اطلاعات پایه</h2>

                {/* Header Image */}
                <div>
                  <label className="block text-sm text-gray-custom mb-2">عکس هدر پروفایل</label>
                  <div className="relative h-40 bg-dark rounded-xl overflow-hidden border border-white/10 group">
                    {form.headerImage ? (
                      <>
                        <img
                          src={form.headerImage}
                          alt="هدر پروفایل"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              type="button"
                              onClick={() => headerInputRef.current?.click()}
                              className="px-3 py-1.5 bg-white/20 backdrop-blur text-white text-sm rounded-lg hover:bg-white/30 transition"
                            >
                              تغییر عکس
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange("headerImage", "")}
                              className="px-3 py-1.5 bg-red-500/20 backdrop-blur text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => headerInputRef.current?.click()}
                          disabled={uploadingHeader}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition disabled:opacity-50"
                        >
                          {uploadingHeader ? "در حال آپلود..." : "آپلود عکس هدر"}
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={headerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-gray-custom mt-1">
                    سایز پیشنهادی: 1200×400 پیکسل. عکس هدر در بالای صفحه پروفایل عمومی شما نمایش داده می‌شود.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="نام کامل خود را وارد کنید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">
                      نام کاربری
                      {profile?.username ? (
                        <span className="text-amber-400 text-[10px] mr-1">(قابل تغییر نیست)</span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] mr-1">(بعد از ثبت قابل تغییر نیست)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => !profile?.username && handleChange("username", e.target.value)}
                      disabled={!!profile?.username}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition disabled:bg-dark/50 disabled:border-white/5 disabled:text-gray-custom disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="نام کاربری یکتا (برای انتقال توکن)"
                      dir="ltr"
                    />
                    {!profile?.username && form.username.trim() && (
                      <p className="text-[10px] text-amber-400 mt-1">
                        ⚠️ پس از ذخیره، نام کاربری و شماره موبایل هرگز قابل تغییر نخواهند بود.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">
                    شماره موبایل
                    <span className="text-amber-400 text-[10px] mr-1">(قابل تغییر نیست)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    disabled
                    className="w-full px-4 py-3 bg-dark/50 border border-white/5 rounded-lg text-gray-custom opacity-60 cursor-not-allowed"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">تاریخ تولد</label>
                    <input
                      type="text"
                      value={form.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="مثلا: 1375/06/15"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">جنسیت</label>
                    <div className="flex gap-3 mt-1">
                      {genderOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange("gender", opt.value)}
                          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                            form.gender === opt.value
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-white/10 bg-dark text-gray-custom hover:border-white/20"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">درباره من</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition resize-none"
                    placeholder="کمی درباره خودتان بنویسید..."
                  />
                </div>
              </div>
            )}

            {/* تحصیلات و تخصص */}
            {activeTab === "education" && (
              <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white mb-4">تحصیلات و تخصص</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">مقطع تحصیلی</label>
                    <select
                      value={form.education}
                      onChange={(e) => handleChange("education", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    >
                      <option value="">انتخاب کنید</option>
                      {educationOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">رشته تحصیلی</label>
                    <input
                      type="text"
                      value={form.fieldOfStudy}
                      onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="مثلا: مهندسی نرم‌افزار"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">تخصص / حرفه</label>
                  <input
                    type="text"
                    value={form.expertise}
                    onChange={(e) => handleChange("expertise", e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    placeholder="مثلا: توسعه‌دهنده وب، طراح گرافیک"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-2">علایق</label>
                  <p className="text-xs text-gray-custom mb-3">موضوعات مورد علاقه خود را انتخاب کنید</p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          form.interests.includes(interest)
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-gray-custom hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* محل زندگی */}
            {activeTab === "location" && (
              <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white mb-4">محل زندگی</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">کشور</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="مثلا: ایران"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">شهر</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="مثلا: تهران"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* شبکه‌های اجتماعی */}
            {activeTab === "social" && (
              <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white mb-4">شبکه‌های اجتماعی</h2>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">وبسایت</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    placeholder="https://example.com"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">اینستاگرام</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => handleChange("instagram", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="@username"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-custom mb-1.5">لینکدین</label>
                    <input
                      type="text"
                      value={form.linkedin}
                      onChange={(e) => handleChange("linkedin", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="linkedin.com/in/username"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">توییتر (X)</label>
                  <input
                    type="text"
                    value={form.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    placeholder="@username"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* اطلاعات بانکی */}
            {activeTab === "banking" && (
              <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-white mb-4">اطلاعات حساب بانکی</h2>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 mb-2">
                  ⚠️ حساب بانکی باید حتما به نام {user.fullName} باشد.
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">شماره کارت</label>
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => handleChange("cardNumber", e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    placeholder="۶۲۱۹-۸۶۱۹-****-****"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-custom mb-1.5">شماره شبا</label>
                  <input
                    type="text"
                    value={form.shebaNumber}
                    onChange={(e) => handleChange("shebaNumber", e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                    placeholder="IR..."
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* پیام و دکمه ذخیره */}
            {message && (
              <div
                className={`mt-6 px-4 py-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Username Confirmation Modal */}
      {showUsernameConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowUsernameConfirm(false); setUsernameConfirmInput(''); }}
          />
          <div className="relative bg-dark-light border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center text-lg">⚠️</div>
              <div>
                <h2 className="text-lg font-bold text-white">تایید نام کاربری</h2>
                <p className="text-xs text-gray-custom mt-0.5">این انتخاب غیرقابل بازگشت است</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
              <p className="font-medium mb-1">توجه: پس از ثبت، نام کاربری و شماره موبایل هرگز قابل تغییر نخواهند بود.</p>
              <p>نام کاربری برای انتقال توکن و شناسایی شما در سیستم استفاده می‌شود.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-custom mb-2">
                برای تایید، نام کاربری <span className="text-white font-mono font-bold">{form.username}</span> را مجدداً وارد کنید:
              </label>
              <input
                type="text"
                value={usernameConfirmInput}
                onChange={(e) => setUsernameConfirmInput(e.target.value)}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-left text-white text-lg font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder={form.username}
                dir="ltr"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmUsername}
                disabled={!usernameConfirmInput.trim()}
                className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-bold disabled:opacity-40 transition-all"
              >
                تایید و ذخیره
              </button>
              <button
                onClick={() => { setShowUsernameConfirm(false); setUsernameConfirmInput(''); }}
                className="flex-1 bg-dark border border-white/10 text-gray-custom hover:text-white py-3 rounded-xl font-medium transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
