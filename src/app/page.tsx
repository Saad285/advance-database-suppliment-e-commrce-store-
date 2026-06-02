import { createServerSupabase } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn, FadeInOnScroll } from '@/components/ui/animations'

export default async function Home() {
  const supabase = await createServerSupabase()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(200,169,126,0.1),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <FadeIn delay={0.1}>
              <p className="text-[13px] uppercase tracking-[0.2em] text-primary font-medium mb-6">
                Premium Supplements
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <h1 className="text-5xl md:text-7xl font-light text-foreground leading-[1.1] tracking-tight mb-8">
                Rooted in
                <br />
                science.
              </h1>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-10 max-w-lg">
                Clinically-dosed, third-party tested supplements engineered
                for those who take their health seriously.
              </p>
            </FadeIn>
            <FadeIn delay={0.55}>
              <div className="flex items-center gap-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?category=performance"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 underline underline-offset-4 decoration-border hover:decoration-foreground"
                >
                  Explore Performance
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {[
              { label: 'Formulation', text: 'Every ingredient clinically dosed and backed by peer-reviewed research.' },
              { label: 'Transparency', text: 'No proprietary blends. No fillers. Full label transparency on every product.' },
              { label: 'Testing', text: 'Every batch third-party tested for heavy metals, microbes, and label accuracy.' },
            ].map((item, i) => (
              <FadeInOnScroll key={item.label} delay={i * 0.1}>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2">{item.label}</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{item.text}</p>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInOnScroll>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">Collections</p>
                <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">Shop by Category</h2>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[1px] bg-border">
            {categories?.map((cat, i) => (
              <FadeInOnScroll key={cat.id} delay={i * 0.06}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group bg-card hover:bg-card/70 transition-colors duration-300 p-8 md:p-10 flex flex-col justify-between aspect-square"
                >
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors duration-200 mb-1">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-muted-foreground/80 group-hover:text-primary transition-colors duration-200">
                      Explore →
                    </span>
                  </div>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInOnScroll>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">Curated</p>
                <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">Featured Products</h2>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
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

      {/* CTA Banner */}
      <section className="py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInOnScroll>
            <p className="text-xs uppercase tracking-[0.15em] text-primary font-medium mb-6">Start Your Journey</p>
            <h2 className="text-3xl md:text-5xl font-light text-foreground tracking-tight mb-6 max-w-xl mx-auto leading-tight">
              Your body deserves better than generic.
            </h2>
            <p className="text-muted-foreground text-base font-light mb-10 max-w-md mx-auto">
              Premium ingredients. Transparent labels. Backed by science.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  )
}
