# Supabase Admin Setup Guide

## Overview
This guide will help you set up admin users in Supabase to enable image uploads and other admin functionality.

## Prerequisites
- Supabase project created
- Database tables created (run the SQL files in the `db/` directory)
- Environment variables configured

## Step 1: Run Database Setup Scripts

Make sure you've run these SQL scripts in your Supabase SQL editor:

1. **`db/rls_policies.sql`** - Sets up RLS policies
2. **`db/storage_setup.sql`** - Sets up storage bucket and policies

Note: We're using user metadata for admin roles, so no profiles table is needed.

## Step 2: Create Admin Users

### Option A: Use the Node.js Script (Recommended)

1. **Make sure your `.env` file has the required Supabase variables:**
   ```bash
   # In your project root .env file
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   ⚠️ **Important**: Use the **SERVICE_ROLE_KEY**, not the anon key!
   
   **Where to find these values:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings > API**
   - Copy the **Project URL** for `SUPABASE_URL`
   - Copy the **service_role secret** for `SUPABASE_SERVICE_ROLE_KEY`

2. **Install dependencies and run the script:**
   ```bash
   cd scripts/
   npm install @supabase/supabase-js dotenv
   node create_admin_users.js
   ```

3. **The script will:**
   - Load environment variables from your `.env` file
   - Create admin users with proper metadata
   - Give you confirmation and login credentials

### Option B: Manual Setup via Supabase Dashboard

1. **Go to Authentication > Users** in your Supabase dashboard
2. **Add User** with these details:
   - Email: `admin@caramelapple.com`
   - Password: `test`
   - Email Confirm: ✅ (check this)

3. **Add another user**:
   - Email: `manager@caramelapple.com`
   - Password: `hello`
   - Email Confirm: ✅ (check this)

4. **Important**: When creating users via dashboard, the `user_metadata` field should contain:
   ```json
   {
     "role": "admin"
   }
   ```
   
   Unfortunately, the Supabase dashboard doesn't allow setting user_metadata during user creation. You'll need to update it via SQL:
   
   ```sql
   -- Update user metadata to set admin role
   UPDATE auth.users 
   SET raw_user_meta_data = '{"role": "admin"}'::jsonb
   WHERE email IN ('admin@caramelapple.com', 'manager@caramelapple.com');
   ```

## Step 3: Test the Integration

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the admin portal**:
   ```
   http://localhost:5173/admin
   ```

3. **Login with admin credentials**:
   - Email: `admin@caramelapple.com`
   - Password: `test`

4. **Test image upload**:
   - Go to "Image Management" or "Product Management"
   - Try uploading an image
   - It should now work without RLS errors!

## Troubleshooting

### "Email not confirmed" 
- This happens because Supabase requires email verification by default
- **Fix via SQL**: Manually confirm emails for test accounts:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), confirmed_at = NOW()
  WHERE email IN ('admin@caramelapple.com', 'manager@caramelapple.com');
  ```
- **Future prevention**: The script now includes `email_confirm: true` to bypass this

### "Access denied: Admin privileges required"
- Make sure you've set the user_metadata with `{"role": "admin"}` for admin users
- Check the user metadata via: `SELECT raw_user_meta_data FROM auth.users WHERE email = 'admin@caramelapple.com';`

### "Invalid login credentials"
- Verify the email/password combination in Supabase Auth dashboard
- Make sure email confirmation is enabled for the users

### Still getting RLS errors
- Verify that the storage policies are set up correctly
- Make sure the user is properly authenticated with Supabase (not just local auth)
- Check that user_metadata contains the admin role

## Security Notes

- The service role key has full access to your database - keep it secure
- Consider using environment variables for the admin credentials in production
- The current passwords are for development only - change them for production use

## Next Steps

Once admin authentication is working, you can:
- Update admin passwords to more secure ones
- Add more admin users as needed
- Implement password reset functionality
- Add role-based permissions (editor, viewer, etc.)
