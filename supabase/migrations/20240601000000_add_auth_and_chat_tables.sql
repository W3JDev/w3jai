-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- Create user preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user API keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create chat sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT,
  referrer TEXT,
  user_agent TEXT
);

-- Create restaurant_info table if it doesn't exist
CREATE TABLE IF NOT EXISTS restaurant_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours JSONB DEFAULT '{}'::JSONB,
  social_media JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events (timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions (user_id);

-- Create RLS policies

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences: Users can only access their own preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own preferences" 
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own preferences" 
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own preferences" 
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User API keys: Users can only access their own API keys
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own API keys" 
  ON user_api_keys FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own API keys" 
  ON user_api_keys FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own API keys" 
  ON user_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own API keys" 
  ON user_api_keys FOR DELETE USING (auth.uid() = user_id);

-- Chat sessions: Users can only access their own chat sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own chat sessions" 
  ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own chat sessions" 
  ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own chat sessions" 
  ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own chat sessions" 
  ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: Users can only access messages from their own sessions
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view messages from their own sessions" 
  ON chat_messages FOR SELECT 
  USING (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = chat_messages.session_id)
  );

CREATE POLICY IF NOT EXISTS "Users can insert messages to their own sessions" 
  ON chat_messages FOR INSERT 
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = chat_messages.session_id)
  );

CREATE POLICY IF NOT EXISTS "Users can delete messages from their own sessions" 
  ON chat_messages FOR DELETE 
  USING (
    auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = chat_messages.session_id)
  );

-- Restaurant info: Everyone can read, only admins can modify
ALTER TABLE restaurant_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Restaurant info is viewable by everyone" 
  ON restaurant_info FOR SELECT USING (true);

-- Analytics events: Only admins can view, users can insert their own
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Only admins can view analytics events" 
  ON analytics_events FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert their own analytics events" 
  ON analytics_events FOR INSERT 
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_api_keys_updated_at
BEFORE UPDATE ON user_api_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_restaurant_info_updated_at
BEFORE UPDATE ON restaurant_info
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Function to get messages by day
CREATE OR REPLACE FUNCTION get_messages_by_day(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS count
  FROM chat_messages
  WHERE created_at >= start_date
  GROUP BY DATE(created_at)
  ORDER BY date;
$$;

-- Function to get messages by role
CREATE OR REPLACE FUNCTION get_messages_by_role(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  role TEXT,
  count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    role,
    COUNT(*) AS count
  FROM chat_messages
  WHERE created_at >= start_date
  GROUP BY role
  ORDER BY count DESC;
$$;

-- Function to get user retention
CREATE OR REPLACE FUNCTION get_user_retention(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  cohort_date DATE,
  users BIGINT,
  returning_users BIGINT,
  retention_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  end_date TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  RETURN QUERY
  WITH first_sessions AS (
    -- Get the first session date for each user
    SELECT
      user_id,
      DATE(MIN(timestamp)) AS first_date
    FROM analytics_events
    WHERE user_id IS NOT NULL
    AND timestamp >= start_date
    GROUP BY user_id
  ),
  returning_users AS (
    -- Get users who came back after their first session
    SELECT
      fs.first_date,
      fs.user_id,
      COUNT(DISTINCT DATE(ae.timestamp)) AS days_returned
    FROM first_sessions fs
    JOIN analytics_events ae ON fs.user_id = ae.user_id
    WHERE DATE(ae.timestamp) > fs.first_date
    GROUP BY fs.first_date, fs.user_id
  ),
  cohort_size AS (
    -- Count users per cohort date
    SELECT
      first_date AS cohort_date,
      COUNT(*) AS users
    FROM first_sessions
    GROUP BY first_date
  ),
  cohort_retention AS (
    -- Calculate retention per cohort
    SELECT
      cs.cohort_date,
      cs.users,
      COUNT(ru.user_id) AS returning_users
    FROM cohort_size cs
    LEFT JOIN returning_users ru ON cs.cohort_date = ru.first_date
    GROUP BY cs.cohort_date, cs.users
  )
  SELECT
    cr.cohort_date,
    cr.users,
    cr.returning_users,
    ROUND((cr.returning_users::NUMERIC / NULLIF(cr.users, 0)) * 100, 2) AS retention_rate
  FROM cohort_retention cr
  ORDER BY cr.cohort_date;
END;
$$;

-- Insert default restaurant info if it doesn't exist
INSERT INTO restaurant_info (name, description, address, phone, email, website, opening_hours, social_media)
SELECT 
  'Table & Apron', 
  'A neighborhood restaurant serving honest food and warm hospitality.',
  '23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor, Malaysia',
  '+603-7733 4000',
  'info@tableandapron.com',
  'https://www.tableandapron.com',
  '{
    "monday": "Closed",
    "tuesday": "11:30 AM - 10:00 PM",
    "wednesday": "11:30 AM - 10:00 PM",
    "thursday": "11:30 AM - 10:00 PM",
    "friday": "11:30 AM - 10:00 PM",
    "saturday": "9:30 AM - 10:00 PM",
    "sunday": "9:30 AM - 10:00 PM"
  }',
  '{
    "instagram": "tableandapron",
    "facebook": "tableandapron"
  }'
WHERE NOT EXISTS (SELECT 1 FROM restaurant_info LIMIT 1);
