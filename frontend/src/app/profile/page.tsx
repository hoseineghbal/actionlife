"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/api";
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

type ActiveTab = "basic" | "education" | "location" | "social";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("basic");

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
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
          mobile: data.mobile || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      await updateProfile(token, form);
      setMessage({ type: "success", text: "پروفایل با موفقیت به‌روزرسانی شد" });
    } catch {
      setMessage({ type: "error", text: "خطا در به‌روزرسانی پروفایل" });
    } finally {
      setSaving(false);
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
                    <label className="block text-sm text-gray-custom mb-1.5">شماره موبایل</label>
                    <input
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:accent/50 outline-none transition"
                      placeholder="09123456789"
                      dir="ltr"
                    />
                  </div>
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
    </>
  );
}
