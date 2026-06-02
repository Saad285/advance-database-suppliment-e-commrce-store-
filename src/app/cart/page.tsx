import { createServerSupabase } from '@/lib/supabase/server'
import CartClient from './CartClient'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const supabase = await createServerSupabase()

  const { data: settingData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'shipping_fee')
    .single()

  const shippingFee = settingData ? parseInt(settingData.value, 10) : 200

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-28">
      <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-10">Cart</h1>
      <CartClient shippingFee={shippingFee} />
    </div>
  )
}
