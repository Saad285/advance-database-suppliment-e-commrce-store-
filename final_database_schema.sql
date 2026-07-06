-- ============================================================
-- IRONROOTS SUPPLEMENTS — SECURE DATABASE SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  category_id      UUID REFERENCES categories(id),
  price            NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  stock_qty        INT NOT NULL DEFAULT 0,
  description      TEXT,
  how_to_use       TEXT,
  ingredients      TEXT,
  attributes       JSONB,
  images           TEXT[],
  is_featured      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  role       TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city         TEXT NOT NULL,
  province     TEXT NOT NULL,
  postal_code  TEXT,
  is_default   BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id),
  delivery_name     TEXT NOT NULL,
  delivery_phone    TEXT NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_city     TEXT NOT NULL,
  delivery_province TEXT NOT NULL,
  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_fee      NUMERIC(10,2) NOT NULL DEFAULT 200,
  total             NUMERIC(10,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  payment_method    TEXT NOT NULL DEFAULT 'COD',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id),
  product_name  TEXT NOT NULL,
  product_image TEXT,
  quantity      INT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  table_name  TEXT,
  operation   TEXT,
  record_id   UUID,
  changed_by  UUID,
  changed_at  TIMESTAMPTZ DEFAULT now(),
  old_data    JSONB,
  new_data    JSONB
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_serviceable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(province_id, name)
);

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXING
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_attributes ON products USING GIN(attributes);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Safely handle new user signups securely (Bypasses RLS internally)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'), 
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Log Order Status Changes
CREATE OR REPLACE FUNCTION log_order_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO audit_log(
      table_name, operation, record_id,
      old_data, new_data
    ) VALUES (
      'orders', 'STATUS_UPDATE', NEW.id,
      jsonb_build_object('status', OLD.status, 'updated_at', now()),
      jsonb_build_object('status', NEW.status, 'updated_at', now())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_audit ON orders;
CREATE TRIGGER trg_order_audit
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_change();

-- Secure Order Placement via RPC
CREATE OR REPLACE FUNCTION place_order(
  order_data JSONB,
  items_data JSONB
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  INSERT INTO orders(
    user_id, delivery_name, delivery_phone,
    delivery_address, delivery_city, delivery_province,
    subtotal, shipping_fee, total,
    status, payment_method, notes
  ) VALUES (
    (order_data->>'user_id')::uuid,
     order_data->>'delivery_name',
     order_data->>'delivery_phone',
     order_data->>'delivery_address',
     order_data->>'delivery_city',
     order_data->>'delivery_province',
    (order_data->>'subtotal')::numeric,
    (order_data->>'shipping_fee')::numeric,
    (order_data->>'total')::numeric,
    'pending', 'COD',
     order_data->>'notes'
  ) RETURNING id INTO new_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(items_data)
  LOOP
    INSERT INTO order_items(
      order_id, product_id, product_name,
      product_image, quantity, unit_price
    ) VALUES (
      new_order_id,
      (item->>'product_id')::uuid,
       item->>'product_name',
       item->>'product_image',
      (item->>'quantity')::int,
      (item->>'unit_price')::numeric
    );

    UPDATE products
      SET stock_qty = stock_qty - (item->>'quantity')::int
      WHERE id = (item->>'product_id')::uuid
        AND stock_qty >= (item->>'quantity')::int;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for: %', item->>'product_name';
    END IF;
  END LOOP;
  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- SECURE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Clear old insecure policies to replace them
DROP POLICY IF EXISTS profiles_self ON profiles;
DROP POLICY IF EXISTS orders_self ON orders;
DROP POLICY IF EXISTS orders_admin ON orders;
DROP POLICY IF EXISTS items_self ON order_items;
DROP POLICY IF EXISTS items_admin ON order_items;
DROP POLICY IF EXISTS addr_self ON addresses;
DROP POLICY IF EXISTS products_public_read ON products;
DROP POLICY IF EXISTS products_admin_write ON products;
DROP POLICY IF EXISTS categories_public ON categories;
DROP POLICY IF EXISTS categories_admin_write ON categories;
DROP POLICY IF EXISTS settings_public_read ON settings;
DROP POLICY IF EXISTS settings_admin_write ON settings;
DROP POLICY IF EXISTS "Allow public read on provinces" ON public.provinces;
DROP POLICY IF EXISTS "Allow public read on cities" ON public.cities;
DROP POLICY IF EXISTS "Allow public read on pages" ON public.pages;
DROP POLICY IF EXISTS "Allow admin manage pages" ON public.pages;
DROP POLICY IF EXISTS "Allow public insert during signup" ON profiles;

-- Profiles: Users can only read/edit themselves
CREATE POLICY profiles_self ON profiles FOR ALL USING (auth.uid() = id);

-- Orders: Users read their own, Admins read all
CREATE POLICY orders_self ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY orders_admin ON orders FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Order Items: Tied to orders
CREATE POLICY items_self ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY items_admin ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Addresses
CREATE POLICY addr_self ON addresses FOR ALL USING (auth.uid() = user_id);

-- Products: Anyone can read active products, ONLY ADMINS can write/edit
CREATE POLICY products_public_read ON products FOR SELECT USING (is_active = true);
CREATE POLICY products_admin_write ON products FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Categories: Anyone can read, ONLY ADMINS can write
CREATE POLICY categories_public ON categories FOR SELECT USING (true);
CREATE POLICY categories_admin_write ON categories FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Settings & Pages & Locations: Public Read, Admin Write
CREATE POLICY settings_public_read ON settings FOR SELECT USING (true);
CREATE POLICY settings_admin_write ON settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow public read on provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Allow public read on cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read on pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Allow admin manage pages" ON public.pages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- STORAGE BUCKET & POLICIES
-- ============================================================
-- 1. Ensure the bucket actually exists for image uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- 2. Secure bucket policies
DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_images" ON storage.objects;

CREATE POLICY "public_read_images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "admin_upload_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_delete_images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- FINALIZE ADMIN ACCOUNTS
-- ============================================================
-- Securely grant admin rights ONLY to the exact emails specified
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('saadzia285@gmail.com', 'saaaadzia285@gmail.com', 'shahanullahkhanoffical@gmail.com')
);
