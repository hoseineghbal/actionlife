import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageViewTracker from "@/components/shared/PageViewTracker";
import { AuthProvider } from "@/lib/auth-context";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Action Life | پلتفرم سبک زندگی اکشن",
    template: "%s | Action Life",
  },
  description:
    "پلتفرم سبک زندگی اکشن - طبیعت‌گردی، بقا، ورزش، گیم، سینما و جامعه کاربران اکشن",
  keywords: [
    "اکشن لایف",
    "طبیعت‌گردی",
    "بقا",
    "بوشکرفت",
    "ورزش",
    "گیم اکشن",
    "فیلم اکشن",
    "سبک زندگی",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "Action Life",
    title: "Action Life | پلتفرم سبک زندگی اکشن",
    description:
      "پلتفرم سبک زندگی اکشن - طبیعت‌گردی، بقا، ورزش، گیم، سینما و جامعه کاربران اکشن",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-dark text-foreground font-sans antialiased">
        <AuthProvider>
          <PageViewTracker />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
