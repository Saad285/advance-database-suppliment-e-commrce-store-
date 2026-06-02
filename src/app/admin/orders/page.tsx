import { createServerSupabase } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabase()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Orders</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Order ID</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Customer</TableHead>
              <TableHead className="text-zinc-400">Total</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell className="font-mono text-zinc-300">
                  #{order.id.split('-')[0]}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-zinc-200">{order.delivery_name}</div>
                  <div className="text-xs text-zinc-500">{order.delivery_city}</div>
                </TableCell>
                <TableCell className="font-medium text-zinc-200">
                  Rs. {Number(order.total).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`border-none capitalize ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline text-sm font-medium">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
