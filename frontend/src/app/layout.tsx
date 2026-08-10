import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageViewTracker from "@/components/shared/PageViewTracker";
import { AuthProvider } from "@/lib/auth-context";

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
    index: false,
    follow: false,
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col bg-dark text-foreground font-sans antialiased">
        <AuthProvider>
          <CopyProtection />
          <SemiSpaceHandler />
          <PageViewTracker />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

// جلوگیری از کلیک راست، کشیدن و کلیدهای میانبر کپی/ذخیره
function CopyProtection() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            function block(e) {
              var tag = (e.target||e.srcElement).tagName;
              if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
              e.preventDefault();
              return false;
            }
            document.addEventListener('contextmenu', function(e){block(e);}, false);
            document.addEventListener('dragstart', function(e){block(e);}, false);
            document.addEventListener('selectstart', function(e){block(e);}, false);
            document.addEventListener('copy', function(e){block(e);}, false);
            document.addEventListener('cut', function(e){block(e);}, false);
            document.addEventListener('keydown', function(e){
              var tag = (e.target||e.srcElement).tagName;
              if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
              // Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12
              if ((e.ctrlKey||e.metaKey) && (e.key==='c'||e.key==='C'||e.key==='u'||e.key==='U'||e.key==='s'||e.key==='S'||e.key==='p'||e.key==='P'||e.key==='i'||e.key==='I'||e.key==='j'||e.key==='J')) {
                e.preventDefault(); return false;
              }
              if (e.key==='F12' || (e.ctrlKey&&e.shiftKey&&(e.key==='i'||e.key==='I'||e.key==='c'||e.key==='C'||e.key==='j'||e.key==='J'))) {
                e.preventDefault(); return false;
              }
            });
          })();
        `,
      }}
    />
  );
}

// نیم‌فاصله: Shift+Space را به ZWNJ تبدیل می‌کند
function SemiSpaceHandler() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            document.addEventListener('keydown', function(e){
              var tag = (e.target||e.srcElement).tagName;
              var isContentEditable = (e.target||e.srcElement).isContentEditable;
              if (!isContentEditable && (tag !== 'INPUT' && tag !== 'TEXTAREA')) return;
              if (e.shiftKey && e.key === ' ') {
                e.preventDefault();
                var zwnj = '\\u200C';
                var target = e.target;
                if (tag === 'INPUT' || tag === 'TEXTAREA') {
                  var start = target.selectionStart;
                  var end = target.selectionEnd;
                  var val = target.value;
                  target.value = val.slice(0, start) + zwnj + val.slice(end);
                  target.selectionStart = target.selectionEnd = start + 1;
                  target.dispatchEvent(new Event('input', {bubbles: true}));
                } else if (isContentEditable) {
                  document.execCommand('insertText', false, zwnj);
                }
              }
            });
          })();
        `,
      }}
    />
  );
}
