<?php
// Maritime Platform Configuration
// Replace these values with your actual Supabase credentials

$config = [
    // Supabase Configuration - REQUIRED
    'supabase_url' => 'https://hjuxqjpgqacekqixiqol.supabase.co',
    'supabase_anon_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdXhxanBncWFjZWtxaXhpcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTc1MDIsImV4cCI6MjA1MTM5MzUwMn0.0R8s6MF_rA4gfqAPzGN8LMFEoVJjI2N2xzJNEwTqLYo',
    'supabase_service_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdXhxanBncWFjZWtxaXhpcW9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgxNzUwMiwiZXhwIjoyMDUxMzkzNTAyfQ.Ly6RN8Dqvz8FV7iJQkYhSVR7AHrIIGOhNbQJe8yLOPw',
    
    // Optional API Keys
    'openai_key' => '',
    'stripe_key' => '',
    
    // Application Settings
    'app_name' => 'Maritime Oil Brokerage Platform',
    'app_version' => '1.0.0',
    'timezone' => 'UTC'
];

return $config;
?>