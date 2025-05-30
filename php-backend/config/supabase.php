<?php
// Supabase configuration
class SupabaseConfig {
    public static function getUrl() {
        return getenv('SUPABASE_URL') ?: $_ENV['SUPABASE_URL'] ?? '';
    }
    
    public static function getAnonKey() {
        return getenv('SUPABASE_ANON_KEY') ?: $_ENV['SUPABASE_ANON_KEY'] ?? '';
    }
    
    public static function getServiceKey() {
        return getenv('SUPABASE_SERVICE_KEY') ?: $_ENV['SUPABASE_SERVICE_KEY'] ?? '';
    }
    
    public static function validateConfig() {
        $url = self::getUrl();
        $key = self::getAnonKey();
        
        if (empty($url) || empty($key)) {
            throw new Exception('Supabase URL and ANON_KEY are required');
        }
        
        return true;
    }
}

// Supabase API client for external calls
class SupabaseClient {
    private $url;
    private $key;
    
    public function __construct() {
        $this->url = SupabaseConfig::getUrl();
        $this->key = SupabaseConfig::getAnonKey();
    }
    
    public function request($endpoint, $method = 'GET', $data = null) {
        $curl = curl_init();
        
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->url . '/rest/v1/' . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
        ]);
        
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        if (curl_error($curl)) {
            throw new Exception('Curl error: ' . curl_error($curl));
        }
        
        curl_close($curl);
        
        if ($httpCode >= 400) {
            throw new Exception('Supabase API error: ' . $response);
        }
        
        return json_decode($response, true);
    }
}
?>