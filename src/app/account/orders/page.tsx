import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyOrdersPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-28">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/account" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 font-medium mb-1">Account</p>
          <h1 className="text-3xl font-light text-white tracking-tight">Orders</h1>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="py-28 text-center">
          <Package className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">No orders yet.</p>
          <Link href="/products" className="text-sm text-primary underline underline-offset-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="group block py-6 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white font-mono">#{order.id.split('-')[0]}</span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium bg-white/[0.04] px-2 py-0.5">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Total</p>
                    <p className="text-sm font-medium text-white">Rs. {Number(order.total).toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
