-- ============================================================
-- IRONROOTS SUPPLEMENTS — FULL DATABASE SCHEMA & SCRIPTS
-- Course: Advanced Database Systems (ADB) Project
-- ============================================================

-- ============================================================
-- 1. TABLE CREATION (3NF Normalization & Structure)
-- ============================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  price            NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  stock_qty        INT NOT NULL DEFAULT 0,
  description      TEXT,
  how_to_use       TEXT,
  ingredients      TEXT,
  attributes       JSONB, -- Semi-structured details (GIN Indexed)
  images           TEXT[],
  is_featured      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Profiles Table (Linked with Supabase Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  role       TEXT DEFAULT 'customer', -- Role-based access control ('customer', 'admin')
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Addresses Table
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

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  delivery_name     TEXT NOT NULL,
  delivery_phone    TEXT NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_city     TEXT NOT NULL,
  delivery_province TEXT NOT NULL,
  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_fee      NUMERIC(10,2) NOT NULL DEFAULT 200,
  total             NUMERIC(10,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  payment_method    TEXT NOT NULL DEFAULT 'COD',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Order Items Table (Weak entity dependent on Orders)
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,
  quantity      INT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL
);

-- Audit Log Table (For Database Logging Criteria)
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  table_name  TEXT NOT NULL,
  operation   TEXT NOT NULL,
  record_id   UUID,
  changed_by  UUID,
  changed_at  TIMESTAMPTZ DEFAULT now(),
  old_data    JSONB,
  new_data    JSONB
);

-- Settings Table (For Dynamic Parameters)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);


-- ============================================================
-- 2. INDEXING STRATEGY (Performance & Optimization Criteria)
-- ============================================================

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Partial Indexes for highly filtered user views
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Multi-column/Sorting optimization
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- GIN Index for rapid search inside JSONB attributes metadata
CREATE INDEX IF NOT EXISTS idx_products_attributes ON products USING GIN(attributes);


-- ============================================================
-- 3. ADVANCED BUSINESS LOGIC & CONCURRENCY (ACID Compliant)
-- ============================================================

-- Place Order Stored Procedure Function (Handles ACID transaction and automatic Stock Rollback)
CREATE OR REPLACE FUNCTION place_order(
  order_data JSONB,
  items_data JSONB
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Insert Main Order
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

  -- Loop through order items, check stock, and decrement count
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

    -- Concurrency handling: Decrement stock ONLY if enough stock is available (Safety Constraint)
    UPDATE products
      SET stock_qty = stock_qty - (item->>'quantity')::int
      WHERE id = (item->>'product_id')::uuid
        AND stock_qty >= (item->>'quantity')::int;

    -- Concurrency Guard: If product stock wasn't enough, row is NOT FOUND, transaction rolls back
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', item->>'product_name';
    END IF;
  END LOOP;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 4. TRIGGERS & LOGGING (Auditing & Automated Workflows)
-- ============================================================

-- Function: Automatic signup listener (Populates Public Profiles table from Auth system)
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

-- Trigger: Bind signup listener to auth users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Audit order state variations
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

-- Trigger: Bind auditing to orders table updates
DROP TRIGGER IF EXISTS trg_order_audit ON orders;
CREATE TRIGGER trg_order_audit
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_change();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL (GRANTS)
-- ============================================================

-- Enable RLS across all schema entities
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings    ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow profiles self-read & write" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow public insert during signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Settings Policies
CREATE POLICY "Allow public read on settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage settings" ON settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Products Policies
CREATE POLICY "Allow public read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin manage products" ON products
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Categories Policies
CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage categories" ON categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Orders & Items Policies
CREATE POLICY "Allow orders self-read & write" ON orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow admin manage orders" ON orders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Allow items self-read" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Allow admin manage order items" ON order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- User Addresses Policies
CREATE POLICY "Allow address self-manage" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- System Level Grants (Bypasses basic schema locks for API consumers)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON addresses TO authenticated;


-- ============================================================
-- 6. CORE INITIAL DATA (Seed Data for Quick Setup)
-- ============================================================

-- Settings Seeds
INSERT INTO settings (key, value) VALUES
  ('shipping_fee', '200'),
  ('site_name', 'IronRoots'),
  ('free_shipping_above', '5000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Categories Seeds
INSERT INTO categories (name, slug) VALUES
  ('Vitamins',    'vitamins'),
  ('Minerals',    'minerals'),
  ('Performance', 'performance'),
  ('Adaptogens',  'adaptogens'),
  ('Beauty',      'beauty')
ON CONFLICT (slug) DO NOTHING;

-- Products Seeds
INSERT INTO products
  (name, slug, category_id, price, compare_at_price, stock_qty, description, how_to_use, ingredients, attributes, is_featured, is_active)
VALUES
  (
    'Magnesium Glycinate 400mg', 'magnesium-glycinate-400mg',
    (SELECT id FROM categories WHERE slug='minerals'), 3500, 4200, 80,
    'Premium magnesium glycinate for superior absorption. Supports deep sleep, muscle recovery, and nervous system health.',
    'Take 2 capsules 30 minutes before bed with water.', 'Magnesium Glycinate 400mg, Vegetable Cellulose (capsule), Rice Flour.',
    '{"serving_size":"2 capsules","servings":60,"form":"capsule","benefits":["Sleep Quality","Muscle Recovery","Stress Relief"],"elemental_mg":400,"third_party_tested":true}',
    true, true
  ),
  (
    'Biotin 10,000mcg Hair & Nail', 'biotin-10000mcg',
    (SELECT id FROM categories WHERE slug='beauty'), 2200, 2800, 120,
    'High-potency biotin for strong hair, nails, and healthy skin. Pharmaceutical grade.',
    'Take 1 softgel daily with food.', 'Biotin 10,000mcg, Soybean Oil, Gelatin (softgel), Glycerin.',
    '{"serving_size":"1 softgel","servings":90,"form":"softgel","benefits":["Hair Growth","Nail Strength","Skin Health"],"biotin_mcg":10000,"third_party_tested":true}',
    true, true
  ),
  (
    'Omega-3 Fish Oil 3000mg', 'omega-3-fish-oil-3000mg',
    (SELECT id FROM categories WHERE slug='vitamins'), 4800, 5500, 65,
    'Triple-strength omega-3 with 1000mg EPA and 500mg DHA per serving. Supports heart and brain health.',
    'Take 1 softgel 3 times daily with meals.', 'Fish Oil Concentrate 3000mg (EPA 1000mg, DHA 500mg), Gelatin, Glycerin.',
    '{"serving_size":"1 softgel","servings":90,"form":"softgel","EPA_mg":1000,"DHA_mg":500,"benefits":["Heart Health","Brain Function","Joint Support"],"third_party_tested":true}',
    true, true
  ),
  (
    'Vitamin D3 5000 IU + K2 100mcg', 'vitamin-d3-5000iu-k2',
    (SELECT id FROM categories WHERE slug='vitamins'), 2800, 3400, 95,
    'Synergistic D3 and K2 combination for bone density, immune support, and calcium metabolism.',
    'Take 1 capsule daily with a fatty meal for best absorption.', 'Vitamin D3 5000IU, Vitamin K2 100mcg (MK-7), Organic Olive Oil, Gelatin.',
    '{"serving_size":"1 capsule","servings":120,"form":"softgel","D3_IU":5000,"K2_mcg":100,"benefits":["Bone Density","Immune Support","Calcium Absorption"],"third_party_tested":true}',
    false, true
  ),
  (
    'Zinc Picolinate 50mg', 'zinc-picolinate-50mg',
    (SELECT id FROM categories WHERE slug='minerals'), 1800, 2200, 150,
    'Highly bioavailable zinc picolinate for immune function, testosterone support, and skin health.',
    'Take 1 capsule daily with food to avoid stomach upset.', 'Zinc Picolinate 50mg, Vegetable Cellulose (capsule), Rice Flour.',
    '{"serving_size":"1 capsule","servings":60,"form":"capsule","zinc_mg":50,"benefits":["Immune Function","Testosterone","Skin Health"],"third_party_tested":true}',
    false, true
  ),
  (
    'Ashwagandha KSM-66 600mg', 'ashwagandha-ksm66-600mg',
    (SELECT id FROM categories WHERE slug='adaptogens'), 3200, 3900, 70,
    'Clinically studied KSM-66 full-spectrum ashwagandha root extract for stress relief and cortisol control.',
    'Take 1 capsule twice daily with meals.', 'Ashwagandha Root Extract KSM-66 600mg (5% withanolides), Black Pepper Extract 5mg, Vegetable Cellulose.',
    '{"serving_size":"1 capsule","servings":60,"form":"capsule","extract":"KSM-66","withanolides_pct":5,"benefits":["Stress Relief","Cortisol Control","Anxiety Reduction","Energy"],"third_party_tested":true}',
    true, true
  ),
  (
    'Marine Collagen Peptides 300g', 'marine-collagen-peptides-300g',
    (SELECT id FROM categories WHERE slug='beauty'), 5500, 6500, 40,
    'Hydrolyzed marine collagen type I & III powder for skin elasticity, hair, and joint lubrication.',
    'Mix 1 scoop (10g) in any hot or cold beverage. Unflavoured.', 'Hydrolyzed Marine Collagen Peptides 10g (Type I, Type III).',
    '{"serving_size":"10g (1 scoop)","servings":30,"form":"powder","collagen_type":"Type I & III","source":"Marine","benefits":["Skin Elasticity","Hair & Nails","Joint Health"],"third_party_tested":true}',
    false, true
  ),
  (
    'Creatine Monohydrate 500g', 'creatine-monohydrate-500g',
    (SELECT id FROM categories WHERE slug='performance'), 4200, 4800, 85,
    'Pure pharmaceutical-grade creatine monohydrate. Proven to increase strength, power output, and lean muscle mass.',
    'Mix 5g (1 scoop) in 250ml water. Take daily.', 'Creatine Monohydrate 5g (100% pure, Creapure certified).',
    '{"serving_size":"5g (1 scoop)","servings":100,"form":"powder","creatine_g":5,"grade":"Creapure certified","benefits":["Strength","Power Output","Lean Muscle","Endurance"],"third_party_tested":true}',
    true, true
  ),
  (
    'Multivitamin Pro 30-Day Pack', 'multivitamin-pro-30-day',
    (SELECT id FROM categories WHERE slug='vitamins'), 3900, 4600, 55,
    'Complete daily vitamin and mineral pack with 10 essential nutrients. Each sachet is one day.',
    'Take 1 sachet daily with breakfast.', 'Vitamin A, C, D3, E, B1, B6, B12, Folate, Zinc, Selenium.',
    '{"serving_size":"1 sachet","servings":30,"form":"sachet","nutrients":10,"benefits":["Daily Wellness","Immune Support","Energy","Antioxidant"],"third_party_tested":true}',
    false, true
  ),
  (
    'Vitamin B-Complex Energy Formula', 'vitamin-b-complex-energy',
    (SELECT id FROM categories WHERE slug='vitamins'), 2500, 3000, 110,
    'Complete B-vitamin complex (B1 through B12) for energy metabolism, nerve function, and mental clarity.',
    'Take 1 capsule daily with any meal.', 'Vitamin B1, B2, B3, B5, B6, B7 (Biotin), B9 (Folate), B12, Vegetable Cellulose.',
    '{"serving_size":"1 capsule","servings":60,"form":"capsule","vitamins":["B1","B2","B3","B5","B6","B7","B9","B12"],"benefits":["Energy Metabolism","Mental Clarity","Nerve Function"],"third_party_tested":true}',
    false, true
  )
ON CONFLICT (slug) DO NOTHING;
