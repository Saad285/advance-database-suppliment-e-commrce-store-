"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=performance", label: "Performance" },
  { href: "/products?category=vitamins", label: "Vitamins" },
  { href: "/products?category=beauty", label: "Beauty" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: isScrolled ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
      }}
      className="fixed top-0 w-full z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Shahan Traders"
            width={220}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: "#1B3A6B" }}
              className="text-[13px] font-medium uppercase tracking-wider hover:text-[#2ABFBF] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <Link href="/account" style={{ color: "#1B3A6B" }} className="hover:text-[#2ABFBF] transition-colors duration-200">
            <User className="w-[18px] h-[18px]" />
          </Link>
          <Link href="/cart" style={{ color: "#1B3A6B" }} className="relative hover:text-[#2ABFBF] transition-colors duration-200">
            <ShoppingCart className="w-[18px] h-[18px]" />
            {mounted && totalItems > 0 && (
              <span
                style={{ backgroundColor: "#2ABFBF", color: "#ffffff" }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center"
              >
                {totalItems}
              </span>
            )}
          </Link>
          <button
            style={{ color: "#1B3A6B" }}
            className="md:hidden hover:text-[#2ABFBF] transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb" }} className="md:hidden px-6 pb-4">
          {navLinks.map((link, i, arr) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "#1B3A6B",
                borderBottom: i < arr.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
              className="block py-3 text-sm font-medium hover:text-[#2ABFBF] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
