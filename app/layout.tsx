import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";
import { cn } from "@/lib/utils";

/** latin-ext: hỗ trợ ký tự tiếng Việt đầy đủ hơn */
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ATS | Tuyển dụng",
  description: "Hệ thống ATS / Job portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", montserrat.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
