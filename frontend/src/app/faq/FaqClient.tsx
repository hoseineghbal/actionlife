"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: string;
  items: FaqItem[];
}

export default function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="space-y-10">
      {categories.map((category, catIdx) => (
        <div key={catIdx}>
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{category.icon}</span>
            <h2 className="text-xl font-bold text-white">{category.title}</h2>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {category.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isOpen = openIndex === key;

              return (
                <div
                  key={key}
                  className="bg-dark-light border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-white font-bold text-sm flex-1">
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-accent/20 border-accent/30" : ""
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-gray-custom"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5">
                      <div className="pt-0 border-t border-white/10">
                        <p className="text-gray-custom text-sm leading-7 pt-4">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
