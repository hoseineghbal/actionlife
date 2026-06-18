"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-custom mb-1">نام *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-custom focus:outline-none focus:border-primary transition-colors"
            placeholder="نام شما"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-custom mb-1">ایمیل *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-custom focus:outline-none focus:border-primary transition-colors"
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-custom mb-1">موبایل</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-custom focus:outline-none focus:border-primary transition-colors"
            placeholder="09xxxxxxxxx"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-custom mb-1">موضوع *</label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-custom focus:outline-none focus:border-primary transition-colors"
            placeholder="موضوع پیام"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-custom mb-1">پیام *</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-custom focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="پیام خود را بنویسید..."
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-8 py-3 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "loading" ? "در حال ارسال..." : "ارسال پیام"}
      </button>
      {status === "success" && (
        <p className="text-green-400 text-sm">پیام شما با موفقیت ارسال شد!</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm">خطا در ارسال پیام. لطفاً دوباره تلاش کنید.</p>
      )}
    </form>
  );
}
