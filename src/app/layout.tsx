import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Charmonman } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { PaintDefs } from "@/components/common/PaintDefs";

const notoThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// expressive brush/handwriting Thai display face for headings (Van Gogh feel)
const displayThai = Charmonman({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ศิลปินจอมปลอม — Fake Artist",
  description: "เกมปาร์ตี้วาดรูปหาตัวปลอม เล่นด้วยมือถือเครื่องเดียว",
  applicationName: "ศิลปินจอมปลอม",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ศิลปินจอมปลอม" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2e4ad" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1330" },
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
    <html lang="th" suppressHydrationWarning className={`${notoThai.variable} ${displayThai.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PaintDefs />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
