'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CartItem } from '@/types'

type CheckoutData = {
  userId: string
  deliveryName: string
  deliveryPhone: string
  deliveryAddress: string
  deliveryCity: string
  deliveryProvince: string
  notes?: string
  items: CartItem[]
}

export async function submitOrder(data: CheckoutData) {
  const supabase = createAdminClient()

  const subtotal = data.items.reduce(
    (s, i) => s + i.unit_price * i.quantity, 0
  )
  const { data: settingData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'shipping_fee')
    .single()

  const shippingFee = settingData ? parseInt(settingData.value, 10) : 200
  const total = subtotal + shippingFee

  const orderData = {
    user_id:          data.userId,
    delivery_name:    data.deliveryName,
    delivery_phone:   data.deliveryPhone,
    delivery_address: data.deliveryAddress,
    delivery_city:    data.deliveryCity,
    delivery_province:data.deliveryProvince,
    subtotal:         subtotal.toString(),
    shipping_fee:     shippingFee.toString(),
    total:            total.toString(),
    notes:            data.notes ?? '',
  }

  const itemsData = data.items.map(i => ({
    product_id:    i.product_id,
    product_name:  i.product_name,
    product_image: i.product_image ?? '',
    quantity:      i.quantity.toString(),
    unit_price:    i.unit_price.toString(),
  }))

  const { data: result, error } = await supabase
    .rpc('place_order', {
      order_data: orderData,
      items_data: itemsData
    })

  if (error) throw new Error(error.message)
  return result as string  // returns new order UUID
}
