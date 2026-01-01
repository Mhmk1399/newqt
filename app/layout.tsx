import type { Metadata } from "next";
import "./globals.css";
import { ray } from "@/next-persian-fonts/ray";
import Navbar from "@/components/global/navabr";
import { Toaster } from "react-hot-toast";
import Avatar from "@/components/global/avatar";
import TokenCleanup from "@/components/global/TokenCleanup";

export const metadata: Metadata = {
  title: "QTT - خدمات تولید محتوا",
  description: "ارائه خدمات حرفه‌ای تولید محتوا، ویدیو و طراحی گرافیک",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ray.className} bg-[#f8fafc] antialiased relative`}>
        {/* Token cleanup component - runs on app initialization */}
        <TokenCleanup />
        {/* SnakeLine with z-index 0 will appear behind other components */}
        <Avatar />
        <div className="relative">
          <Navbar />
          <Toaster position="top-center" reverseOrder={false} />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
