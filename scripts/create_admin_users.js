// Script to create admin users via Supabase Admin API
// Run this with: node create_admin_users.js
// Make sure you have a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config({ path: '../.env' })

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // NOT anon key!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
  console.error('\nPlease add these to your .env file in the project root.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUsers() {
  console.log('🚀 Creating admin users...\n')
  
  try {
    // Create admin user
    console.log('Creating admin@caramelapple.com...')
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@caramelapple.com',
      password: 'test',
      user_metadata: { role: 'admin' }
    })

    if (adminError) {
      console.error('❌ Error creating admin:', adminError.message)
    } else {
      console.log('✅ Admin user created successfully!')
      console.log('   ID:', adminUser.user.id)
      console.log('   Email:', adminUser.user.email)
      console.log('   Role: admin (set in user_metadata)\n')
    }

    // Create manager user
    console.log('Creating manager@caramelapple.com...')
    const { data: managerUser, error: managerError } = await supabase.auth.admin.createUser({
      email: 'manager@caramelapple.com',
      password: 'hello',
      user_metadata: { role: 'admin' }
    })

    if (managerError) {
      console.error('❌ Error creating manager:', managerError.message)
    } else {
      console.log('✅ Manager user created successfully!')
      console.log('   ID:', managerUser.user.id)
      console.log('   Email:', managerUser.user.email)
      console.log('   Role: admin (set in user_metadata)\n')
    }

    console.log('🎉 Admin user setup complete!')
    console.log('\nYou can now login to the admin portal at:')
    console.log('   http://localhost:5173/admin')
    console.log('\nLogin credentials:')
    console.log('   admin@caramelapple.com / test')
    console.log('   manager@caramelapple.com / hello')

  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

createAdminUsers()
