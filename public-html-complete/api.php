<?php
// Maritime Platform API - PHP Backend for Supabase Integration
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
        'Content-Type: application/json',
        'User-Agent: Maritime-Platform/1.0'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        return ['error' => 'CURL Error: ' . $curlError];
    }
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $decoded = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        } else {
            return ['error' => 'JSON decode error: ' . json_last_error_msg()];
        }
    } else {
        return ['error' => 'HTTP Error', 'code' => $httpCode, 'response' => $response];
    }
}

// Route handling
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("API Request: " . $request_uri . " Method: " . $method);

// Handle different routing scenarios
if (strpos($path, '/api.php') !== false) {
    $path = str_replace('/api.php', '', $path);
} else {
    // Direct access to api.php
    $path = isset($_GET['endpoint']) ? '/' . $_GET['endpoint'] : '/test';
}

// Log the processed path
error_log("Processed path: " . $path);

try {
    switch ($path) {
        case '/vessels':
        case '/vessel':
            if ($method === 'GET') {
                $vessels = supabaseRequest('vessels?select=*');
                if (isset($vessels['error'])) {
                    throw new Exception($vessels['error']);
                }
                echo json_encode($vessels);
            }
            break;
            
        case '/ports':
        case '/port':
            if ($method === 'GET') {
                $ports = supabaseRequest('ports?select=*');
                if (isset($ports['error'])) {
                    throw new Exception($ports['error']);
                }
                echo json_encode($ports);
            }
            break;
            
        case '/refineries':
        case '/refinery':
            if ($method === 'GET') {
                $refineries = supabaseRequest('refineries?select=*');
                if (isset($refineries['error'])) {
                    throw new Exception($refineries['error']);
                }
                echo json_encode($refineries);
            }
            break;
            
        case '/brokers':
        case '/broker':
            if ($method === 'GET') {
                $brokers = supabaseRequest('brokers?select=*');
                if (isset($brokers['error'])) {
                    throw new Exception($brokers['error']);
                }
                echo json_encode($brokers);
            }
            break;
            
        case '/stats':
            if ($method === 'GET') {
                $vessels = supabaseRequest('vessels?select=*');
                $ports = supabaseRequest('ports?select=*');
                
                if (isset($vessels['error']) || isset($ports['error'])) {
                    throw new Exception('Error fetching data');
                }
                
                $stats = [
                    'vessels' => is_array($vessels) ? count($vessels) : 0,
                    'ports' => is_array($ports) ? count($ports) : 0,
                    'activeVoyages' => 0,
                    'totalCargo' => 0
                ];
                
                if (is_array($vessels)) {
                    foreach ($vessels as $vessel) {
                        if (isset($vessel['status']) && $vessel['status'] === 'In Transit') {
                            $stats['activeVoyages']++;
                        }
                        if (isset($vessel['cargoCapacity'])) {
                            $stats['totalCargo'] += $vessel['cargoCapacity'];
                        }
                    }
                }
                
                echo json_encode($stats);
            }
            break;
            
        case '/test':
        case '':
        default:
            // Test endpoint to verify API is working
            echo json_encode([
                'status' => 'ok',
                'message' => 'Maritime Platform API is working',
                'timestamp' => date('Y-m-d H:i:s'),
                'supabase_url' => $supabase_url,
                'path' => $path,
                'method' => $method
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database Connection Error',
        'message' => 'Failed to load data. Please check your database configuration.',
        'details' => $e->getMessage()
    ]);
}
?>