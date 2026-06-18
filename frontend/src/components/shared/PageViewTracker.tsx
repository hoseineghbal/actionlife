"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_BASE}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        title: document.title,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
