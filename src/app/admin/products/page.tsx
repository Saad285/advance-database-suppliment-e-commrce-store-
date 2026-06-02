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
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createServerSupabase()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Products</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Product</TableHead>
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-zinc-400">Price</TableHead>
              <TableHead className="text-zinc-400">Stock</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-zinc-800 rounded border border-zinc-700 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <span className="flex w-full h-full items-center justify-center text-xs text-zinc-500 font-bold">IR</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-200">{product.name}</div>
                      <div className="text-xs text-zinc-500">{product.slug}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-300">{product.categories?.name}</TableCell>
                <TableCell className="text-zinc-300">Rs. {product.price}</TableCell>
                <TableCell className="text-zinc-300">{product.stock_qty}</TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "default" : "destructive"} className="border-none">
                    {product.is_active ? 'Active' : 'Draft'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
