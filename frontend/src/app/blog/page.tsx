import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "وبلاگ زندگی اکشن",
  description:
    "مقالات، آموزش‌ها، اخبار اعضای قبیله زندگی اکشن و انجمن های تخصصی",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const page = Math.max(1, parseInt(params.page || "1") || 1);
  const search = params.search;

  return <BlogClient category={category} page={page} search={search} />;
}
