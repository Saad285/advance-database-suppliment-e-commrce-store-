import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (product_id: string) => void
  updateQty: (product_id: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(i => i.product_id === item.product_id)
        if (existing) {
          const newQty = Math.min(
            existing.quantity + item.quantity,
            item.stock_qty
          )
          set(s => ({
            items: s.items.map(i =>
              i.product_id === item.product_id ? { ...i, quantity: newQty } : i
            )
          }))
        } else {
          set(s => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (product_id) =>
        set(s => ({ items: s.items.filter(i => i.product_id !== product_id) })),

      updateQty: (product_id, qty) =>
        set(s => ({
          items: qty <= 0
            ? s.items.filter(i => i.product_id !== product_id)
            : s.items.map(i =>
                i.product_id === product_id
                  ? { ...i, quantity: Math.min(qty, i.stock_qty) }
                  : i
              )
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      totalPrice: () => get().items.reduce(
        (s, i) => s + i.unit_price * i.quantity, 0
      ),
    }),
    { name: 'ironroots-cart' }
  )
)
