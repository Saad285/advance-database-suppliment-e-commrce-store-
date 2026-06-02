import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabase()
  
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
  
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(3)

  const { data: settings, error: setError } = await supabase
    .from('settings')
    .select('*')

  return NextResponse.json({
    connection: 'ok',
    categories: { count: categories?.length ?? 0, error: catError?.message ?? null, data: categories },
    products: { count: products?.length ?? 0, error: prodError?.message ?? null, names: products?.map(p => p.name) },
    settings: { count: settings?.length ?? 0, error: setError?.message ?? null, data: settings },
  })
}
