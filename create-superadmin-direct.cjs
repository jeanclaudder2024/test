const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating super admin user...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // First check the users table structure
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('Table error:', tableError);
    } else {
      console.log('Sample user data structure:', tableData);
    }
    
    // Insert super admin user with basic fields only
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: 'superadmin@petrodealhub.com',
        password: hashedPassword,
        role: 'admin'
      }, {
        onConflict: 'email'
      })
      .select();
    
    if (error) {
      console.error('❌ Error creating super admin:', error);
      return;
    }
    
    console.log('✅ Super admin user created successfully!');
    console.log('📧 Email: superadmin@petrodealhub.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('📊 Data:', data);
    
  } catch (error) {
    console.error('❌ Failed to create super admin:', error.message);
  }
}

createSuperAdmin();