const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  const supabaseUrl = process.env.SUPABASE_URL || 'https://fahvjksfkzmbsyvtktyk.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHZqa3Nma3ptYnN5dnRrdHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzgwMDMsImV4cCI6MjA2NDA1NDAwM30.TsfzDouSyN-jQE0uM36LV2UmVljAUbr92rPry9kZR78';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    console.log('Testing basic vessel count...');
    const { data, error, count } = await supabase
      .from('vessels')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Vessel count: ${count}`);
    
    // Test actual data fetch
    const { data: vessels, error: fetchError } = await supabase
      .from('vessels')
      .select('*')
      .limit(3);
      
    if (fetchError) {
      console.error('❌ Data fetch error:', fetchError);
      return false;
    }
    
    console.log(`✅ Successfully fetched ${vessels?.length || 0} vessels`);
    if (vessels && vessels.length > 0) {
      console.log('Sample vessel:', vessels[0].name);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

testSupabaseConnection();