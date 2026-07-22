import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "จิตรกรตัวปลอม — Fake Artist",
  description: "เกมปาร์ตี้วาดรูปหาตัวปลอม เล่นด้วยมือถือเครื่องเดียว",
  applicationName: "จิตรกรตัวปลอม",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "จิตรกรตัวปลอม" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#2a2b31" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning className={`${notoThai.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
