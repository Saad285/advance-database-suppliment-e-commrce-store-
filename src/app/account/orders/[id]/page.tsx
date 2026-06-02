import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account')
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-28">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/account/orders" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light text-white tracking-tight font-mono">
            #{order.id.split('-')[0]}
          </h1>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium bg-white/[0.04] px-2 py-0.5">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-6">Items</p>
          <div className="divide-y divide-white/[0.04]">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="py-4 first:pt-0 flex items-center gap-4">
                <div className="relative w-14 h-14 bg-[#111] rounded-sm overflow-hidden shrink-0">
                  {item.product_image ? (
                    <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] tracking-widest">IR</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{item.product_name}</p>
                  <p className="text-xs text-zinc-500">× {item.quantity}</p>
                </div>
                <span className="text-sm text-white font-medium shrink-0">
                  Rs. {(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.04] mt-6 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="text-zinc-200">Rs. {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Shipping</span>
              <span className="text-zinc-200">Rs. {Number(order.shipping_fee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.04] pt-2 mt-2">
              <span className="text-zinc-300">Total</span>
              <span className="text-lg text-white font-medium">Rs. {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">Delivery</p>
            <div className="text-sm text-zinc-300 space-y-1">
              <p className="text-white">{order.delivery_name}</p>
              <p>{order.delivery_address}</p>
              <p>{order.delivery_city}, {order.delivery_province}</p>
              <p>{order.delivery_phone}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-3">Payment</p>
            <p className="text-sm text-zinc-300">Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
