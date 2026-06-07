-- Create Pages Table for CMS
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to pages
CREATE POLICY "Allow public read on pages" ON public.pages FOR SELECT USING (true);

-- Allow admins to manage pages
CREATE POLICY "Allow admin manage pages" ON public.pages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Ensure read access is granted
GRANT SELECT ON public.pages TO anon, authenticated;

-- Ensure service_role and admins can modify
GRANT ALL ON public.pages TO service_role;
GRANT ALL ON public.pages TO authenticated;

-- Seed default pages so the footer doesn't break
INSERT INTO public.pages (title, slug, content) VALUES
('Contact Us', 'contact', '<h1>Contact Us</h1><p>Have a question or need assistance? We are here to help.</p><ul><li>Email: support@ironroots.com</li><li>Phone: 0800-IRON-ROOTS</li></ul>'),
('Shipping & Returns', 'shipping', '<h1>Shipping & Returns</h1><p>We currently ship across Pakistan using our trusted courier partners. Standard delivery takes 2-4 business days.</p><h2>Returns</h2><p>You may return any unopened product within 7 days of delivery.</p>'),
('FAQ', 'faq', '<h1>Frequently Asked Questions</h1><h3>Are your supplements tested?</h3><p>Yes, all our supplements undergo rigorous third-party testing.</p><h3>Do you offer COD?</h3><p>Yes, we offer Cash on Delivery across Pakistan.</p>'),
('Privacy Policy', 'privacy', '<h1>Privacy Policy</h1><p>We collect information you provide directly to us when you create an account, make a purchase, or contact customer support. We do not sell your personal data.</p>')
ON CONFLICT (slug) DO NOTHING;
