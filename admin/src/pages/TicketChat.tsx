import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';
import type { Ticket } from '../types';

export default function TicketChat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = () => {
    api.get<Ticket>(`/tickets/${id}`)
      .then((res) => setTicket(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post<Ticket>(`/tickets/${id}/messages`, {
        message: message.trim(),
        senderRole: 'admin',
        senderName: user?.fullName || 'ادمین',
      });
      setTicket(res.data);
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const res = await api.put<Ticket>(`/tickets/${id}/status`, { status });
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!ticket) {
    return <p className="text-gray-500">تیکت یافت نشد</p>;
  }

  const statusLabels: Record<string, string> = {
    open: 'باز',
    pending: 'در انتظار',
    closed: 'بسته',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tickets')}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            &larr; بازگشت
          </button>
          <div>
            <h2 className="font-bold text-gray-800">{ticket.subject}</h2>
            <p className="text-sm text-gray-500">
              {ticket.userName} - {ticket.userEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['open', 'pending', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                ticket.status === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {ticket.messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.senderRole === 'admin'
                    ? 'bg-indigo-50 text-gray-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-indigo-600">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString('fa-IR')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {ticket.status !== 'closed' && (
        <form onSubmit={sendMessage} className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
          >
            {sending ? 'ارسال...' : 'ارسال'}
          </button>
        </form>
      )}
    </div>
  );
}
