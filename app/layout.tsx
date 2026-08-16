import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cairo = Cairo({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laskwt — Dascha & Thobe Tailoring",
  description:
    "Tailoring management web app for Laskwt Kuwait — customers, measurements, styles, pricing, invoices and Shopify sync.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16160F" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EC" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
