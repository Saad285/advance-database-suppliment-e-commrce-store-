import { createServerSupabase } from "@/lib/supabase/server";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import { ArrowRight, FlaskConical, ShieldCheck, Microscope } from "lucide-react";
import { FadeIn, FadeInOnScroll } from "@/components/ui/animations";
import SciFiBackground from "@/components/ui/SciFiBackground";

export default async function Home() {
  const supabase = await createServerSupabase();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(4);

  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div style={{ backgroundColor: "#FAF9F7" }}>

      {/* ═══════════ HERO ═══════════ */}
      <section
        style={{ minHeight: "88vh" }}
        className="relative flex items-center overflow-hidden"
      >
        <SciFiBackground />

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-28 w-full">
          <div className="max-w-2xl">
            <FadeIn delay={0.1}>
              <p style={{ color: "#2ABFBF", letterSpacing: "0.25em" }}
                className="text-xs uppercase font-semibold mb-6">
                Pharmaceutical Distributors
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <h1 style={{ color: "#ffffff" }}
                className="text-5xl md:text-7xl font-light leading-tight tracking-tight mb-8">
                Trusted in<br />
                <span style={{ color: "#2ABFBF" }}>healthcare.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p style={{ color: "rgba(255,255,255,0.60)" }}
                className="text-lg font-light leading-relaxed mb-10 max-w-lg">
                Premium pharmaceutical distribution with uncompromising quality,
                serving healthcare professionals and institutions nationwide.
              </p>
            </FadeIn>
            <FadeIn delay={0.55}>
              <div className="flex items-center gap-6 flex-wrap">
                <Link
                  href="/products"
                  style={{ backgroundColor: "#2ABFBF", color: "#1B3A6B" }}
                  className="inline-flex items-center gap-3 px-8 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm"
                >
                  Shop Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                  className="text-sm hover:opacity-100 transition-opacity underline underline-offset-4"
                >
                  Explore Products
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section style={{ backgroundColor: "#ffffff" }} className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FlaskConical,
                label: "Formulation",
                text: "Every product sourced from certified manufacturers and backed by regulatory compliance.",
              },
              {
                icon: ShieldCheck,
                label: "Transparency",
                text: "No hidden fees. No compromises. Full supply chain transparency on every order.",
              },
              {
                icon: Microscope,
                label: "Testing",
                text: "Every batch quality-checked for authenticity, safety, and label accuracy.",
              },
            ].map((item, i) => (
              <FadeInOnScroll key={item.label} delay={i * 0.1}>
                <div
                  style={{ borderColor: "#e8e8e8" }}
                  className="group p-8 border rounded-xl hover:shadow-lg transition-shadow duration-300 bg-white"
                >
                  <div
                    style={{ backgroundColor: "rgba(42,191,191,0.1)", width: 44, height: 44 }}
                    className="rounded-xl flex items-center justify-center mb-5"
                  >
                    <item.icon style={{ color: "#2ABFBF" }} className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p style={{ color: "#1B3A6B", letterSpacing: "0.12em" }}
                    className="text-xs font-bold uppercase mb-3">
                    {item.label}
                  </p>
                  <p style={{ color: "#6B7280" }} className="text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section style={{ backgroundColor: "#FAF9F7" }} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInOnScroll>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p style={{ color: "#2ABFBF", letterSpacing: "0.2em" }}
                  className="text-xs font-bold uppercase mb-2">
                  Collections
                </p>
                <h2 style={{ color: "#1B3A6B" }}
                  className="text-3xl md:text-4xl font-light tracking-tight">
                  Shop by Category
                </h2>
              </div>
              <Link href="/products"
                style={{ color: "#6B7280" }}
                className="hidden md:flex items-center gap-2 text-sm hover:text-[#1B3A6B] transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories?.map((cat, i) => (
              <FadeInOnScroll key={cat.id} delay={i * 0.06}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  style={{ borderColor: "#E5E5E5", backgroundColor: "#ffffff" }}
                  className="group border rounded-xl p-6 flex flex-col justify-between aspect-square hover:shadow-md hover:border-[#2ABFBF] transition-all duration-300"
                >
                  <span style={{ color: "#2ABFBF" }} className="text-[11px] font-bold uppercase tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 style={{ color: "#1B3A6B" }}
                      className="text-base font-medium group-hover:text-[#2ABFBF] transition-colors mb-1">
                      {cat.name}
                    </h3>
                    <span style={{ color: "#9CA3AF" }} className="text-xs group-hover:text-[#2ABFBF] transition-colors">
                      Explore →
                    </span>
                  </div>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section style={{ backgroundColor: "#ffffff" }} className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInOnScroll>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p style={{ color: "#2ABFBF", letterSpacing: "0.2em" }}
                  className="text-xs font-bold uppercase mb-2">
                  Curated
                </p>
                <h2 style={{ color: "#1B3A6B" }}
                  className="text-3xl md:text-4xl font-light tracking-tight">
                  Featured Products
                </h2>
              </div>
              <Link href="/products"
                style={{ color: "#6B7280" }}
                className="hidden md:flex items-center gap-2 text-sm hover:text-[#1B3A6B] transition-colors">
                Shop all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product, i) => (
              <ProductCard key={product.id} product={product as any} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section style={{ backgroundColor: "#1B3A6B" }} className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInOnScroll>
            <p style={{ color: "#2ABFBF", letterSpacing: "0.2em" }}
              className="text-xs font-bold uppercase mb-5">
              Partner With Us
            </p>
            <h2 style={{ color: "#ffffff" }}
              className="text-3xl md:text-5xl font-light tracking-tight mb-6 max-w-xl mx-auto leading-tight">
              Your patients deserve better than generic.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.50)" }}
              className="text-base font-light mb-10 max-w-md mx-auto">
              Certified pharmaceuticals. Transparent supply chain. Backed by expertise.
            </p>
            <Link
              href="/products"
              style={{ backgroundColor: "#2ABFBF", color: "#1B3A6B" }}
              className="inline-flex items-center gap-3 px-8 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInOnScroll>
        </div>
      </section>

    </div>
  );
}
