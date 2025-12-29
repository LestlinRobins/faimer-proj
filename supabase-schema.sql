-- FAIMER Database Schema for Dynamic Features
-- Run this in your Supabase SQL Editor

-- 1. User Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crop Plans Table
CREATE TABLE IF NOT EXISTS crop_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    area_size DECIMAL(10, 2),
    area_unit TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    status TEXT DEFAULT 'planning',
    tasks JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Activity History Table
CREATE TABLE IF NOT EXISTS activity_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Profile Settings Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    phone TEXT,
    language TEXT DEFAULT 'en',
    location TEXT,
    farm_size DECIMAL(10, 2),
    farm_size_unit TEXT,
    main_crops TEXT[],
    soil_type TEXT,
    irrigation_type TEXT,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Personalized Alerts Table
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    crop TEXT,
    severity TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 6. Labourers Table
CREATE TABLE IF NOT EXISTS labourers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    experience_years INTEGER,
    location TEXT NOT NULL,
    wage_per_day DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    availability TEXT DEFAULT 'available',
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FairFarm Products Table
CREATE TABLE IF NOT EXISTS fairfarm_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    quantity_available DECIMAL(10, 2),
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT,
    organic BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    image_url TEXT,
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FairFarm Transactions Table
CREATE TABLE IF NOT EXISTS fairfarm_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES fairfarm_products(id),
    buyer_user_id TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    seller_user_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Cached Government Schemes Table
CREATE TABLE IF NOT EXISTS government_schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    how_to_apply TEXT,
    state TEXT,
    source TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Agriculture News Cache Table
CREATE TABLE IF NOT EXISTS agriculture_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    category TEXT,
    source TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_crop_plans_user_id ON crop_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_user_id ON activity_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_labourers_location ON labourers(location);
CREATE INDEX IF NOT EXISTS idx_labourers_skills ON labourers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_fairfarm_products_user_id ON fairfarm_products(user_id);
CREATE INDEX IF NOT EXISTS idx_fairfarm_products_category ON fairfarm_products(category);
CREATE INDEX IF NOT EXISTS idx_agriculture_news_published ON agriculture_news(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE labourers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fairfarm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fairfarm_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only see their own data)
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own crop plans" ON crop_plans FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own crop plans" ON crop_plans FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own crop plans" ON crop_plans FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own crop plans" ON crop_plans FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own history" ON activity_history FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own history" ON activity_history FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own alerts" ON user_alerts FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own alerts" ON user_alerts FOR UPDATE USING (auth.uid()::text = user_id);

-- Public read for labourers, but only own data for insert/update
CREATE POLICY "Anyone can view labourers" ON labourers FOR SELECT USING (true);
CREATE POLICY "Users can insert own labourer profile" ON labourers FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own labourer profile" ON labourers FOR UPDATE USING (auth.uid()::text = user_id);

-- Public read for fairfarm products
CREATE POLICY "Anyone can view products" ON fairfarm_products FOR SELECT USING (true);
CREATE POLICY "Users can insert own products" ON fairfarm_products FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own products" ON fairfarm_products FOR UPDATE USING (auth.uid()::text = user_id);

-- Public read for transactions (transparency)
CREATE POLICY "Anyone can view transactions" ON fairfarm_transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions" ON fairfarm_transactions FOR INSERT WITH CHECK (auth.uid()::text = buyer_user_id);
