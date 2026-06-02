export type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  category_id: string
  price: number
  compare_at_price: number | null
  stock_qty: number
  description: string | null
  how_to_use: string | null
  ingredients: string | null
  attributes: Record<string, unknown> | null
  images: string[] | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  categories?: Category
}

export type Order = {
  id: string
  user_id: string
  delivery_name: string
  delivery_phone: string
  delivery_address: string
  delivery_city: string
  delivery_province: string
  subtotal: number
  shipping_fee: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: string
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
}

export type CartItem = {
  product_id: string
  product_name: string
  product_image: string | null
  unit_price: number
  quantity: number
  stock_qty: number
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
}
