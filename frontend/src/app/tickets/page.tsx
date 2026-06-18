"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { Ticket } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function TicketsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/tickets/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, message, priority }),
      });
      if (res.ok) {
        setSubject("");
        setMessage("");
        setPriority("medium");
        setShowForm(false);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabels: Record<string, string> = {
    open: "باز",
    pending: "در انتظار پاسخ",
    closed: "بسته شده",
  };

  const statusColors: Record<string, string> = {
    open: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    closed: "bg-gray-500/20 text-gray-400",
  };

  const priorityLabels: Record<string, string> = {
    high: "بالا",
    medium: "متوسط",
    low: "پایین",
  };

  if (!user) return null;

  return (
    <>
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 sm:mb-4">
                تیکت‌های <span className="text-primary">پشتیبانی</span>
              </h1>
              <p className="text-gray-custom max-w-2xl leading-7">
                سوال یا مشکلی دارید؟ یک تیکت جدید ایجاد کنید و تیم پشتیبانی در
                اسرع وقت پاسخ شما را می‌دهد.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
            >
              {showForm ? "بستن فرم" : "تیکت جدید"}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-dark-light border border-white/10 rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-bold text-white mb-4">ایجاد تیکت جدید</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-custom mb-1">عنوان</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition"
                  placeholder="موضوع تیکت..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-custom mb-1">اولویت</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition"
                >
                  <option value="low">پایین</option>
                  <option value="medium">متوسط</option>
                  <option value="high">بالا</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-custom mb-1">پیام</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition resize-none"
                placeholder="مشکل خود را شرح دهید..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "در حال ارسال..." : "ارسال تیکت"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-custom">
            <p className="text-lg mb-2">هنوز تیکتی ندارید</p>
            <p className="text-sm">با کلیک روی دکمه &quot;تیکت جدید&quot; اولین تیکت خود را ایجاد کنید</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                href={`/tickets/${ticket._id}`}
                className="block bg-dark-light border border-white/10 rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white truncate">{ticket.subject}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}
                  >
                    {statusLabels[ticket.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-custom">
                  <span>اولویت: {priorityLabels[ticket.priority]}</span>
                  <span>{ticket.messages.length} پیام</span>
                  <span>
                    {new Date(ticket.updatedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
