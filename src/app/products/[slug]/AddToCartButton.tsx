"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export default function AddToCartButton({
  product,
  isOutOfStock,
}: {
  product: Product;
  isOutOfStock: boolean;
}) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      unit_price: product.price,
      quantity: qty,
      stock_qty: product.stock_qty,
    });
    toast.success(`Added to cart`);
    setQty(1);
  };

  const increase = () => setQty((q) => Math.min(q + 1, product.stock_qty));
  const decrease = () => setQty((q) => Math.max(q - 1, 1));

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full sm:w-auto px-10 py-3 text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-white/[0.06] h-11">
        <button
          onClick={decrease}
          className="px-3 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors duration-200 disabled:opacity-30"
          disabled={qty <= 1}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-medium text-white">
          {qty}
        </span>
        <button
          onClick={increase}
          className="px-3 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors duration-200 disabled:opacity-30"
          disabled={qty >= product.stock_qty}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="flex-1 sm:flex-none px-10 py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors duration-200"
      >
        Add to Cart
      </button>
    </div>
  );
}
