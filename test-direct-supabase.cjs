const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('Testing direct Supabase connection...');
  
  const supabase = createClient(
    'https://fahvjksfkzmbsyvtktyk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHZqa3Nma3ptYnN5dnRrdHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzgwMDMsImV4cCI6MjA2NDA1NDAwM30.TsfzDouSyN-jQE0uM36LV2UmVljAUbr92rPry9kZR78'
  );

  try {
    // Test basic connection
    const { data, error } = await supabase.from('vessels').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    console.log('Vessel count:', data);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

testSupabaseConnection();