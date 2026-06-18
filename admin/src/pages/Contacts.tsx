import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Contact } from '../types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    api.get<Contact[]>('/contact')
      .then((res) => setContacts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/contact/${id}/read`);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead: true } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (contact: Contact) => {
    setSelected(contact);
    if (!contact.isRead) {
      markAsRead(contact._id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">پیام‌های تماس با ما</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => handleSelect(contact)}
                className={`w-full text-right p-4 rounded-xl transition cursor-pointer ${
                  selected?._id === contact._id
                    ? 'bg-indigo-50 border-2 border-indigo-300'
                    : 'bg-white shadow-sm hover:shadow-md border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-sm">{contact.name}</span>
                  {!contact.isRead && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{contact.subject}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(contact.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </button>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-16 text-gray-400">پیامی وجود ندارد</div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h2 className="text-lg font-bold text-gray-800">{selected.subject}</h2>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selected.isRead ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {selected.isRead ? 'خوانده شده' : 'خوانده نشده'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-500">نام:</span>
                    <span className="mr-2 font-medium text-gray-800">{selected.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ایمیل:</span>
                    <span className="mr-2 font-medium text-gray-800" dir="ltr">{selected.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">موبایل:</span>
                    <span className="mr-2 font-medium text-gray-800" dir="ltr">{selected.mobile || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">تاریخ:</span>
                    <span className="mr-2 font-medium text-gray-800">
                      {new Date(selected.createdAt).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center h-64 text-gray-400">
                یک پیام را انتخاب کنید
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
