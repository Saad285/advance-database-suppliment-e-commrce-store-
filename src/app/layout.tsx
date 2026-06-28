import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Shahan Traders — Pharmaceutical Distributors",
  description:
    "Premium pharmaceutical distribution with certified quality, serving healthcare professionals and institutions nationwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
