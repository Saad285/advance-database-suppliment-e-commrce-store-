'use client'

import { useCartStore } from '@/lib/store/cart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'

export default function CartClient({ shippingFee }: { shippingFee: number }) {
  const { items, updateQty, removeItem, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="py-28 text-center bg-background">
        <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-xl font-light text-foreground mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mb-8">Add some supplements to get started.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
        >
          Shop Supplements
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const subtotal = totalPrice()
  const total = subtotal + shippingFee

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 bg-background">
      <div className="lg:col-span-2">
        <div className="border-b border-border pb-4 mb-6 hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
          <span>Product</span>
          <span>Quantity</span>
          <span className="text-right">Total</span>
          <span className="w-8" />
        </div>

        <div className="space-y-0 divide-y divide-border">
          {items.map((item) => (
            <div key={item.product_id} className="py-6 flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-card border border-border overflow-hidden shrink-0 rounded-sm">
                  {item.product_image ? (
                    <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs font-light tracking-widest bg-card">IR</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm text-foreground font-normal">{item.product_name}</h4>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">Rs. {item.unit_price.toLocaleString()} each</p>
                </div>
              </div>

              <div className="flex items-center border border-border h-9 w-fit bg-card">
                <button
                  onClick={() => updateQty(item.product_id, item.quantity - 1)}
                  className="px-2.5 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm text-foreground font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product_id, item.quantity + 1)}
                  className="px-2.5 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                  disabled={item.quantity >= item.stock_qty}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm font-medium text-foreground text-right">
                Rs. {(item.unit_price * item.quantity).toLocaleString()}
              </p>

              <button
                onClick={() => removeItem(item.product_id)}
                className="text-muted-foreground hover:text-red-500 transition-colors duration-200 w-8 flex justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-card border border-border p-8">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-8">Summary</h2>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground font-medium">Rs. {shippingFee.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-8">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-medium text-foreground">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Cash on delivery available.
          </p>
        </div>
      </div>
    </div>
  )
}
