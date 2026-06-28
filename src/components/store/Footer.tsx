import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";

const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=performance", label: "Performance" },
  { href: "/products?category=vitamins", label: "Vitamins" },
  { href: "/products?category=beauty", label: "Beauty" },
];

export default async function Footer() {
  const supabase = await createServerSupabase();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("slug, title")
    .order("created_at");

  let supportLinks = [];
  if (!error && pages) {
    supportLinks = pages.map((p) => ({ href: `/${p.slug}`, label: p.title }));
  } else {
    // Fallback if table not created yet
    supportLinks = [
      { href: "/contact", label: "Contact Us" },
      { href: "/shipping", label: "Shipping & Returns" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
    ];
  }

  return (
    <footer className="bg-[#112240] border-t border-white/10 pt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div>
            <Image
              src="/logo.png"
              alt="Shahan Traders"
              width={180}
              height={60}
              className="h-14 w-auto object-contain"
            />
            <p className="mt-4 text-sm text-white/50 max-w-xs leading-relaxed">
              Premium pharmaceutical distribution rooted in trust, crafted for
              those who demand quality healthcare.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium mb-5">
              Newsletter
            </h3>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Join for early access and exclusive offers.
            </p>
            <form action="#" className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-[#0d1b2e] border border-white/10 rounded-none px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2ABFBF]/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-[#2ABFBF] text-[#0d1b2e] px-5 py-2.5 text-sm font-medium hover:bg-[#22a8a8] transition-colors rounded-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 pb-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Shahan Traders. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
