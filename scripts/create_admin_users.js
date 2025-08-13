// Script to create admin users via Supabase Admin API
// Run this with Node.js after installing @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // NOT anon key!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUsers() {
  try {
    // Create admin user
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@caramelapple.com',
      password: 'test',
      user_metadata: { role: 'admin' }
    })

    if (adminError) {
      console.error('Error creating admin:', adminError)
    } else {
      console.log('Admin user created:', adminUser.user.id)
      
      // Insert into profiles table
      await supabase.from('profiles').insert({
        id: adminUser.user.id,
        email: 'admin@caramelapple.com',
        role: 'admin'
      })
    }

    // Create manager user
    const { data: managerUser, error: managerError } = await supabase.auth.admin.createUser({
      email: 'manager@caramelapple.com',
      password: 'hello',
      user_metadata: { role: 'admin' }
    })

    if (managerError) {
      console.error('Error creating manager:', managerError)
    } else {
      console.log('Manager user created:', managerUser.user.id)
      
      // Insert into profiles table
      await supabase.from('profiles').insert({
        id: managerUser.user.id,
        email: 'manager@caramelapple.com',
        role: 'admin'
      })
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

createAdminUsers()
