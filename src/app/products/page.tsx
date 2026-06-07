import { createServerSupabase } from "@/lib/supabase/server";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import { FadeIn } from "@/components/ui/animations";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerSupabase();
  const resolvedParams = await searchParams;
  const categorySlug =
    typeof resolvedParams.category === "string"
      ? resolvedParams.category
      : null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const cat = categories?.find((c) => c.slug === categorySlug);
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-28">
      <div className="flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-48 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6">
              Filter
            </p>
            <nav className="flex flex-col gap-1">
              <Link
                href="/products"
                className={`text-sm py-2 transition-colors duration-200 ${
                  !categorySlug
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Products
              </Link>
              {categories?.map((cat) => {
                const isActive = categorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className={`text-sm py-2 transition-colors duration-200 ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <FadeIn>
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-2">
                {categorySlug
                  ? categories?.find((c) => c.slug === categorySlug)?.name ||
                    "Products"
                  : "All Products"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {products?.length || 0}{" "}
                {products?.length === 1 ? "product" : "products"}
              </p>
            </div>
          </FadeIn>

          {products?.length === 0 ? (
            <div className="py-24 text-center border border-border">
              <p className="text-muted-foreground mb-2">No products found.</p>
              <p className="text-sm text-muted-foreground/80">
                Try selecting a different category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
