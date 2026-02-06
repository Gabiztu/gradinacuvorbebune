-- Technical Specification Document: "Words of Support" PWA
-- Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'admin');
CREATE TYPE beneficiary_age_range AS ENUM ('8-10', '11-13', '14-16', '17-20');
CREATE TYPE message_category AS ENUM (
  'school_harmony',
  'exams_tests',
  'overcoming_failure',
  'family_reconnection',
  'personalized'
);

-- ============================================
-- TABLES
-- ============================================

-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'parent' NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  streak_count INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Beneficiaries (Children/Students)
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  age_range beneficiary_age_range NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Messages (Message Library)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category message_category NOT NULL,
  age_range beneficiary_age_range[] DEFAULT '{}' NOT NULL,
  role_target user_role[] DEFAULT '{parent,teacher}' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Favorites
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, message_id)
);

-- Message History (Sent Messages)
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE SET NULL,
  beneficiary_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Analytics Logs
CREATE TABLE analytics_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  sender_role user_role NOT NULL,
  beneficiary_age_range beneficiary_age_range NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Beneficiaries: Users can only access their own beneficiaries
CREATE POLICY "Users can view own beneficiaries" ON beneficiaries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own beneficiaries" ON beneficiaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own beneficiaries" ON beneficiaries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own beneficiaries" ON beneficiaries
  FOR DELETE USING (auth.uid() = user_id);

-- Messages: Everyone can view active messages
CREATE POLICY "Anyone can view active messages" ON messages
  FOR SELECT USING (is_active = TRUE);

-- Favorites: Users can only access their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- History: Users can only access their own history
CREATE POLICY "Users can view own history" ON history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics Logs: Only admins can view (created by system)
CREATE POLICY "Admins can view analytics" ON analytics_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables (except those with auto timestamps)
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, total_xp, streak_count, last_active_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    0,
    0,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA (Sample Messages)
-- ============================================

INSERT INTO messages (content, category, age_range, role_target) VALUES
-- School Harmony
('Nu ești singur în fața provocărilor. Împreună vom găsi soluții.', 
 'school_harmony', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Fiecare conflict este o oportunitate de a învăța și de a crește.', 
 'school_harmony', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Ești valoros/a așa cum ești. Nu permite nimănui să te facă să te simți altfel.', 
 'school_harmony', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

-- Exams & Tests
('Ai muncit din greu și ești pregătit/a. Ai încredere în tine!', 
 'exams_tests', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Rezultatele sunt importante, dar efortul tău contează cel mai mult.', 
 'exams_tests', 
 ARRAY['8-10', '11-13', '14-16']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Până mâine, fii calm/a și concentrat/a. Vei reuși!', 
 'exams_tests', 
 ARRAY['14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

-- Overcoming Failure
('Greșelile sunt lecții, nu eșecuri. Continuă să încerci!', 
 'overcoming_failure', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Un rezultat nu te definește. Ești mult mai mult decât o notă.', 
 'overcoming_failure', 
 ARRAY['11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent', 'teacher']::user_role[]),

('Fiindcă ai căzut, înseamnă că poți și să te ridici. Sunt mândru/mândră de tine.', 
 'overcoming_failure', 
 ARRAY['8-10', '11-13']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

-- Family Reconnection
('Dragostea noastră nu depinde de nimic. Te iubim neconditionat.', 
 'family_reconnection', 
 ARRAY['8-10', '11-13', '14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

('Hai să vorbim deschis. Îmi pasă de tine și vreau să te ascult.', 
 'family_reconnection', 
 ARRAY['14-16', '17-20']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]),

('Familia este locul unde te acceptăm așa cum ești.', 
 'family_reconnection', 
 ARRAY['8-10', '11-13']::beneficiary_age_range[], 
 ARRAY['parent']::user_role[]);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_is_active ON messages(is_active);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_created_at ON history(created_at DESC);
CREATE INDEX idx_analytics_logs_created_at ON analytics_logs(created_at DESC);

-- ============================================
-- NEXT.PWA CONFIGURATION
-- ============================================

-- For next-pwa, you'll need to configure these in next.config.js:
-- The manifest.json will be served from /public/manifest.json
