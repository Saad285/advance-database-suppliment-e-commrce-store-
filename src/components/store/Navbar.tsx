"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

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
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled
          ? "bg-background/85 backdrop-blur-xl border-border"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium tracking-[0.2em] text-foreground uppercase"
        >
          IRONROOTS
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/products", label: "Shop" },
            { href: "/products?category=performance", label: "Performance" },
            { href: "/products?category=vitamins", label: "Vitamins" },
            { href: "/products?category=beauty", label: "Beauty" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-normal text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/account"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <User className="w-[18px] h-[18px]" />
          </Link>
          <Link
            href="/cart"
            className="relative text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 pb-6">
          {[
            { href: "/products", label: "Shop" },
            { href: "/products?category=performance", label: "Performance" },
            { href: "/products?category=vitamins", label: "Vitamins" },
            { href: "/products?category=beauty", label: "Beauty" },
          ].map((link, i, arr) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors ${
                i < arr.length - 1 ? "border-b border-border" : ""
              }`}
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
