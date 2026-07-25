-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Site content blocks
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);

-- 3. Pages management
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Site settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can insert contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact_submissions" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update contact_submissions" ON contact_submissions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Seed default site_content entries
INSERT INTO site_content (section, key, value) VALUES
  ('hero', 'heading', 'Ship, manage, track, deliver'),
  ('hero', 'subtitle', ''),
  ('cta', 'heading', 'Ready to get started?'),
  ('cta', 'text', 'Create an account or log in to manage your shipments.'),
  ('cta', 'button_text', 'Open an Account'),
  ('featured', 'heading_1', 'FedEx One Rate'),
  ('featured', 'text_1', 'Simple flat-rate pricing for boxes up to 50 lbs.'),
  ('featured', 'heading_2', 'FedEx Rewards'),
  ('featured', 'text_2', 'Earn points on every shipment and redeem for rewards.')
ON CONFLICT (section, key) DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('site_name', 'FedEx Replica'),
  ('site_description', 'A FedEx static site replica with admin portal'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;
