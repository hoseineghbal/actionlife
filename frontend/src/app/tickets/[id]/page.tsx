"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { Ticket } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function TicketChatPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTicket(await res.json());
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
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [user, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          senderRole: "user",
          senderName: user?.fullName || "کاربر",
        }),
      });
      if (res.ok) {
        setTicket(await res.json());
        setMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const statusLabels: Record<string, string> = {
    open: "باز",
    pending: "در انتظار پاسخ",
    closed: "بسته شده",
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 text-gray-custom">تیکت یافت نشد</div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-dark-light border border-white/10 rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/tickets")}
              className="text-gray-custom hover:text-white transition-colors shrink-0"
            >
              &larr; بازگشت
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{ticket.subject}</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-custom">
            {statusLabels[ticket.status]}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-dark-light border border-white/10 rounded-xl p-3 sm:p-5 mb-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {ticket.messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderRole === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.senderRole === "user"
                    ? "bg-white/5 border border-white/10"
                    : "bg-primary/20 border border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-gray-custom">
                    {new Date(msg.createdAt).toLocaleString("fa-IR")}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {ticket.status !== "closed" ? (
        <form
          onSubmit={sendMessage}
          className="bg-dark-light border border-white/10 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none transition"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-4 sm:px-6 py-3 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            {sending ? "ارسال..." : "ارسال"}
          </button>
        </form>
      ) : (
        <div className="bg-dark-light border border-white/10 rounded-xl p-4 text-center text-gray-custom">
          این تیکت بسته شده است
        </div>
      )}
    </section>
  );
}
