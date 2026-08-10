"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ArticleCardProps {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  section: string;
  author?: { _id?: string; fullName: string; username?: string };
  createdAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const sectionLabelCache: Record<string, string> = {};
let sectionLabelsFetched = false;
let sectionLabelsPromise: Promise<void> | null = null;

function useSectionLabels() {
  const [labels, setLabels] = useState<Record<string, string>>(sectionLabelCache);

  useEffect(() => {
    if (sectionLabelsFetched) {
      setLabels({ ...sectionLabelCache });
      return;
    }
    if (!sectionLabelsPromise) {
      sectionLabelsPromise = fetch(`${API_BASE}/article-sections/active`)
        .then((res) => res.json())
        .then((data: { name: string; slug: string }[]) => {
          data.forEach((s) => { sectionLabelCache[s.slug] = s.name; });
          sectionLabelsFetched = true;
        })
        .catch(() => {});
    }
    sectionLabelsPromise.then(() => setLabels({ ...sectionLabelCache }));
  }, []);

  return labels;
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  section,
  author,
  createdAt,
}: ArticleCardProps) {
  const sectionLabels = useSectionLabels();
  const sectionPath =
    section === "blog" ? "/blog" : `/${section}`;

  return (
    <article className="group bg-dark-light border border-white/10 rounded-xl overflow-hidden hover:border-accent/30 transition-all">
      {/* تصویر */}
      <Link href={`${sectionPath}/${slug}`} className="block relative overflow-hidden">
        <div className="aspect-video bg-white/5">
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-custom">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <span className="absolute top-3 right-3 px-2 py-1 text-xs gradient-primary text-white rounded-md">
          {sectionLabels[section] || section}
        </span>
      </Link>

      {/* محتوا */}
      <div className="p-4">
        <Link href={`${sectionPath}/${slug}`}>
          <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-gray-custom text-sm line-clamp-2 mb-3">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-custom">
          {author && (
            author._id ? (
              <Link href={`/users/${author.username || author._id}`} className="hover:text-accent transition-colors">
                {author.username || author.fullName}
              </Link>
            ) : (
              <span>{author.username || author.fullName}</span>
            )
          )}
          {createdAt && (
            <span>
              {new Date(createdAt).toLocaleDateString("fa-IR")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
