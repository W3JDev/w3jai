# Supabase Database Migration

This directory contains SQL migrations for the Supabase database.

## Running Migrations

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of the migration files in the `migrations` directory
4. Paste and execute the SQL statements in the SQL Editor

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

### Option 3: Using the JavaScript Migration Script

1. Make sure you have the required environment variables in your `.env` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```

2. Install the required dependencies:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. Run the migration script:
   ```bash
   node supabase/run-migration.js
   ```

## Migration Files

- `20240601000000_create_exec_sql_function.sql`: Creates a function to execute SQL statements
- `20240601000000_add_auth_and_chat_tables.sql`: Adds tables for authentication, user preferences, and chat history

## Database Schema

The migration adds the following tables:

- `profiles`: User profile information
- `user_preferences`: User preferences and settings
- `user_api_keys`: Encrypted API keys for users
- `chat_sessions`: Chat session metadata
- `chat_messages`: Individual chat messages
- `analytics_events`: Analytics event tracking
- `restaurant_info`: Restaurant information

## Row Level Security (RLS) Policies

The migration also sets up Row Level Security policies to ensure that users can only access their own data.
