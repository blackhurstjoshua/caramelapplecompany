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
    console.log('Creating kriataleecook5@gmail.com...')
    const { data: kristaUser, error: kristaError } = await supabase.auth.admin.createUser({
      email: 'kriataleecook5@gmail.com',
      password: '12345apples',
      email_confirm: true,  // ← Bypass email confirmation
      user_metadata: { role: 'admin' }
    })

    if (kristaError) {
      console.error('❌ Error creating admin:', kristaError.message)
    } else {
      console.log('✅ Admin user created successfully!')
      console.log('   ID:', kristaUser.user.id)
      console.log('   Email:', kristaUser.user.email)
      console.log('   Role: admin (set in user_metadata)\n')
    }

    // Create god role user
    console.log('Creating blackhurst.joshua@gmail.com...')
    const { data: godUser, error: godError } = await supabase.auth.admin.createUser({
      email: 'blackhurst.joshua@gmail.com',
      password: 'obstkorb',
      email_confirm: true,  // ← Bypass email confirmation
      user_metadata: { role: 'admin' }
    })

    if (godError) {
      console.error('❌ Error creating god:', godError.message)
    } else {
      console.log('✅ God user created successfully!')
      console.log('   ID:', godUser.user.id)
      console.log('   Email:', godUser.user.email)
      console.log('   Role: admin (set in user_metadata)\n')
    }

    console.log('🎉 Admin user setup complete!')
    console.log('\nYou can now login to the admin portal at:')
    console.log('   http://localhost:5173/admin')
    console.log('\nLogin credentials:')
    console.log('   Kriataleecook5@gmail.com / test')
    console.log('   blackhurst.joshua@gmail.com / obstkorb')

  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

createAdminUsers()
