<?php
// Maritime Platform API - PHP Backend for Supabase Integration
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Supabase Configuration
$supabase_url = 'https://hjuxqjpgqacekqixiqol.supabase.co';
$supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdXhxanBncWFjZWtxaXhpcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTc1MDIsImV4cCI6MjA1MTM5MzUwMn0.0R8s6MF_rA4gfqAPzGN8LMFEoVJjI2N2xzJNEwTqLYo';

function supabaseRequest($endpoint, $method = 'GET', $data = null) {
    global $supabase_url, $supabase_key;
    
    $url = $supabase_url . '/rest/v1/' . $endpoint;
    
    $headers = [
        'apikey: ' . $supabase_key,
        'Authorization: Bearer ' . $supabase_key,
        'Content-Type: application/json'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        return json_decode($response, true);
    } else {
        return ['error' => 'Request failed', 'code' => $httpCode, 'response' => $response];
    }
}

// Route handling
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove base path if needed
$path = str_replace('/api.php', '', $path);

switch ($path) {
    case '/vessels':
        if ($method === 'GET') {
            $vessels = supabaseRequest('vessels?select=*');
            echo json_encode($vessels);
        }
        break;
        
    case '/ports':
        if ($method === 'GET') {
            $ports = supabaseRequest('ports?select=*');
            echo json_encode($ports);
        }
        break;
        
    case '/refineries':
        if ($method === 'GET') {
            $refineries = supabaseRequest('refineries?select=*');
            echo json_encode($refineries);
        }
        break;
        
    case '/brokers':
        if ($method === 'GET') {
            $brokers = supabaseRequest('brokers?select=*');
            echo json_encode($brokers);
        }
        break;
        
    case '/stats':
        if ($method === 'GET') {
            $vessels = supabaseRequest('vessels?select=*');
            $ports = supabaseRequest('ports?select=*');
            
            $stats = [
                'vessels' => count($vessels),
                'ports' => count($ports),
                'activeVoyages' => 0,
                'totalCargo' => 0
            ];
            
            foreach ($vessels as $vessel) {
                if (isset($vessel['status']) && $vessel['status'] === 'In Transit') {
                    $stats['activeVoyages']++;
                }
                if (isset($vessel['cargoCapacity'])) {
                    $stats['totalCargo'] += $vessel['cargoCapacity'];
                }
            }
            
            echo json_encode($stats);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>