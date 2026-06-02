'use client'

import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitOrder } from '@/app/actions/checkout'
import { toast } from 'sonner'
import { ArrowRight, Truck, CreditCard } from 'lucide-react'

export default function CheckoutClient({
  userId,
  shippingFee,
  defaultAddress
}: {
  userId: string
  shippingFee: number
  defaultAddress: any
}) {
  const { items, totalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    deliveryName: defaultAddress?.full_name || '',
    deliveryPhone: defaultAddress?.phone || '',
    deliveryAddress: defaultAddress?.address_line || '',
    deliveryCity: defaultAddress?.city || '',
    deliveryProvince: defaultAddress?.province || '',
    notes: ''
  })

  // Auto-fill Province based on City for Pakistan regions
  const handleCityChange = (city: string) => {
    const cleanCity = city.trim().toLowerCase()
    let province = form.deliveryProvince

    if (['peshawar', 'mardan', 'swat', 'abbottabad', 'kohat', 'dera ismail khan'].includes(cleanCity)) {
      province = 'Khyber Pakhtunkhwa'
    } else if (['karachi', 'hyderabad', 'sukkur', 'larkana', 'mirpurkhas'].includes(cleanCity)) {
      province = 'Sindh'
    } else if (['lahore', 'faisalabad', 'rawalpindi', 'multan', 'gujranwala', 'sialkot', 'bahawalpur', 'sargodha'].includes(cleanCity)) {
      province = 'Punjab'
    } else if (['quetta', 'gwadar', 'khuzdar', 'sibi', 'turbat'].includes(cleanCity)) {
      province = 'Balochistan'
    } else if (['islamabad'].includes(cleanCity)) {
      province = 'Federal Capital'
    } else if (['muzaffarabad', 'mirpur', 'kotli'].includes(cleanCity)) {
      province = 'Azad Kashmir'
    } else if (['gilgit', 'skardu'].includes(cleanCity)) {
      province = 'Gilgit-Baltistan'
    }

    setForm(prev => ({
      ...prev,
      deliveryCity: city,
      deliveryProvince: province
    }))
  }

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const subtotal = totalPrice()
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="py-28 text-center bg-background">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <button onClick={() => router.push('/products')} className="text-sm text-primary underline underline-offset-4">
          Back to shop
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const orderId = await submitOrder({
        userId,
        ...form,
        items
      })
      clearCart()
      toast.success("Order placed successfully")
      router.push(`/order-confirmation/${orderId}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 bg-background">
      <div className="lg:col-span-3">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">

          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" /> Delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Full Name</label>
                <input
                  required
                  value={form.deliveryName}
                  onChange={(e) => update('deliveryName', e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Phone</label>
                <input
                  required
                  value={form.deliveryPhone}
                  onChange={(e) => update('deliveryPhone', e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1.5">Address</label>
                <input
                  required
                  value={form.deliveryAddress}
                  onChange={(e) => update('deliveryAddress', e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">City</label>
                <input
                  required
                  value={form.deliveryCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="e.g. Peshawar, Karachi, Lahore"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Province</label>
                <input
                  required
                  value={form.deliveryProvince}
                  onChange={(e) => update('deliveryProvince', e.target.value)}
                  className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-6 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Payment
            </h2>
            <div className="border border-primary/20 bg-primary/[0.03] px-5 py-3.5">
              <p className="text-sm font-medium text-primary">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">Pay in cash when the order is delivered.</p>
            </div>
          </div>

        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 bg-card border border-border p-8">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-8">Order</h2>

          <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto">
            {items.map(item => (
              <div key={item.product_id} className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm text-foreground line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                </div>
                <span className="text-sm text-foreground shrink-0 font-medium">Rs. {(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3 mb-6 text-sm">
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

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Order'}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
