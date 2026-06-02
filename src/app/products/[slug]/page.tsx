import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const supabase = await createServerSupabase()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  const isOutOfStock = product.stock_qty <= 0
  const attributes = product.attributes as Record<string, any> || {}

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Image */}
        <div>
          <div className="relative aspect-square bg-card overflow-hidden rounded-sm">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-light text-muted-foreground/45 tracking-widest">IR</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_featured && (
                <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 font-medium">
                  Featured
                </span>
              )}
              {isOutOfStock && (
                <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-0.5 font-medium">
                  Sold Out
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <Link
              href={`/products?category=${product.categories?.slug}`}
              className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium hover:text-primary transition-colors duration-200 mb-4 inline-block"
            >
              {product.categories?.name}
            </Link>
            <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight leading-tight mb-5">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-medium text-foreground">Rs. {product.price.toLocaleString()}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-base text-muted-foreground line-through">
                  Rs. {product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-base text-muted-foreground font-light leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="mb-10">
            <AddToCartButton product={product as any} isOutOfStock={isOutOfStock} />
          </div>

          <div className="border-t border-border pt-8 space-y-8">
            {product.how_to_use && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">How to Use</h3>
                <p className="text-sm text-foreground/90 leading-relaxed font-light">{product.how_to_use}</p>
              </div>
            )}

            {product.ingredients && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">Ingredients</h3>
                <p className="text-sm text-foreground/90 leading-relaxed font-light">{product.ingredients}</p>
              </div>
            )}

            {Object.keys(attributes).length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(attributes).map(([key, value]) => {
                    const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    const formattedValue = Array.isArray(value) ? value.join(', ') : String(value)
                    return (
                      <div key={key}>
                        <span className="text-xs text-muted-foreground block mb-0.5">{formattedKey}</span>
                        <span className="text-sm text-foreground font-medium">{formattedValue}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
