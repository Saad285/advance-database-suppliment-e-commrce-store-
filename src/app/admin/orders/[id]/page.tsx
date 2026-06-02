import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminOrderStatusClient from './AdminOrderStatusClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createServerSupabase()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', resolvedParams.id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Link href="/admin/orders"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-3xl font-bold text-white">Order #{order.id.split('-')[0]}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center font-bold text-xs text-zinc-500">
                      IR
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200">{item.product_name}</p>
                      <p className="text-zinc-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold text-zinc-300">
                    Rs. {(item.unit_price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="bg-zinc-800 my-6" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">Rs. {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping Fee</span>
                <span className="text-white">Rs. {Number(order.shipping_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-300 font-bold pt-2 border-t border-zinc-800 mt-2 text-lg">
                <span>Total</span>
                <span className="text-primary">Rs. {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Order Status</h2>
            <AdminOrderStatusClient orderId={order.id} currentStatus={order.status} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Customer Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500 mb-1">Name</p>
                <p className="font-medium text-zinc-200">{order.delivery_name}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Phone</p>
                <p className="font-medium text-zinc-200">{order.delivery_phone}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Address</p>
                <p className="font-medium text-zinc-200">{order.delivery_address}</p>
                <p className="font-medium text-zinc-200">{order.delivery_city}, {order.delivery_province}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-zinc-500 mb-1">Order Notes</p>
                  <p className="text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
