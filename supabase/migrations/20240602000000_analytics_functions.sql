-- Create analytics_events table
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

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events (timestamp);

-- Create index on event_name for faster filtering
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events (event_name);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);

-- Create index on session_id for faster session-specific queries
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events (session_id);

-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

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

-- RLS policies for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view analytics events
CREATE POLICY "Only admins can view analytics events" 
  ON analytics_events FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = TRUE
    )
  );

-- Users can insert their own analytics events
CREATE POLICY "Users can insert their own analytics events" 
  ON analytics_events FOR INSERT 
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );
