import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "زندگی اکشن",
  description:
    "آخرین مقالات و آموزش‌های سبک زندگی اکشن - طبیعت‌گردی، بقا، ورزش، گیم و سینما",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const page = Math.max(1, parseInt(params.page || "1") || 1);

  return <BlogClient category={category} page={page} />;
}
