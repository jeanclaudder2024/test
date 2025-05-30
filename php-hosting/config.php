<?php
// Configuration file for Maritime Platform
// Replace these values with your actual Supabase credentials

return [
    // Supabase Configuration - REQUIRED
    'supabase_url' => 'https://your-project-id.supabase.co',
    'supabase_anon_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here',
    'supabase_service_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key_here',
    
    // Optional API Keys
    'openai_key' => '',
    'stripe_key' => '',
    
    // Application Settings
    'app_name' => 'Maritime Oil Brokerage Platform',
    'app_version' => '1.0.0',
    'timezone' => 'UTC'
];
?>