"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      unit_price: product.price,
      quantity: 1,
      stock_qty: product.stock_qty,
    });
    toast.success(`Added to cart`);
  };

  const isOutOfStock = product.stock_qty <= 0;
  const categoryName = (product as any).categories?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] bg-card border border-border overflow-hidden rounded-sm">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <span className="text-2xl font-light text-muted-foreground/50 tracking-widest">
                IR
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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

          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
              <div className="bg-foreground/95 backdrop-blur-sm flex items-center justify-center py-2.5">
                <button
                  onClick={handleAddToCart}
                  className="text-xs uppercase tracking-wider text-background font-medium hover:text-primary transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-normal text-foreground truncate group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          {categoryName && (
            <p className="text-[11px] text-muted-foreground/80 uppercase tracking-wider mt-1">
              {categoryName}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-foreground">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <span className="text-xs text-muted-foreground/60 line-through">
                  Rs. {product.compare_at_price.toLocaleString()}
                </span>
              )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
