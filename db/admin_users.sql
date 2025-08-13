-- Create admin users in Supabase Auth
-- Note: These need to be run with service role key or created via Supabase dashboard

-- Insert admin users into auth.users table
-- You'll need to do this via Supabase dashboard or use the management API

-- Alternative: Use Supabase client to create users
-- supabase.auth.admin.createUser({
--   email: 'admin@caramelapple.com',
--   password: 'test',
--   user_metadata: { role: 'admin' }
-- })

-- supabase.auth.admin.createUser({
--   email: 'manager@caramelapple.com', 
--   password: 'hello',
--   user_metadata: { role: 'admin' }
-- })

-- Create a profiles table to store admin roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Only service role can insert/update profiles
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Insert admin profiles (do this after creating the auth users)
-- INSERT INTO profiles (id, email, role) VALUES
--   ('admin-user-uuid-here', 'admin@caramelapple.com', 'admin'),
--   ('manager-user-uuid-here', 'manager@caramelapple.com', 'admin');
