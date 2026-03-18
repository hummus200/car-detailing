import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { BubblesBackground } from "@/components/common/bubbles";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2 Auto Detailing | Premium Automotive Services",
  description:
    "B2 Auto Detailing – confident, minimal, technical. Enterprise-grade detailing and premium automotive services in Australia.",
  icons: {
    icon: "/images/b2-auto-detailing-logo.png",
    apple: "/images/b2-auto-detailing-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-gray-100">
        <BubblesBackground />
        <Navbar />
        <main className="pt-16">{children}</main>
        <Toaster />
        <footer className="border-t border-white/10 bg-black/40">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-400 sm:flex-row sm:px-6 lg:px-8">
            <span>
              © {year} B2 Auto Detailing. All rights reserved.
            </span>
            <span className="text-gray-300">
              Phone: <span className="font-medium text-gray-100">+61 427 816 980</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
