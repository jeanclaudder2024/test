<?php
// Maritime Platform - Production PHP Version
require_once 'config.php';

// Handle API routes
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

if (strpos($path, '/api/') === 0) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    
    switch(true) {
        case $path === '/api/vessels':
            echo json_encode(fetchFromSupabase('vessels'));
            break;
        case $path === '/api/ports':
            echo json_encode(fetchFromSupabase('ports'));
            break;
        case $path === '/api/refineries':
            echo json_encode(fetchFromSupabase('refineries'));
            break;
        case $path === '/api/brokers':
            echo json_encode(fetchFromSupabase('brokers'));
            break;
        case $path === '/api/companies':
            echo json_encode(fetchFromSupabase('companies'));
            break;
        case $path === '/api/documents':
            echo json_encode(fetchFromSupabase('documents'));
            break;
        case preg_match('/\/api\/vessels\/(\d+)/', $path, $matches):
            $vessel = fetchFromSupabase("vessels?id=eq.{$matches[1]}");
            echo json_encode($vessel ? $vessel[0] : null);
            break;
        case preg_match('/\/api\/ports\/(\d+)/', $path, $matches):
            $port = fetchFromSupabase("ports?id=eq.{$matches[1]}");
            echo json_encode($port ? $port[0] : null);
            break;
        case preg_match('/\/api\/refineries\/(\d+)/', $path, $matches):
            $refinery = fetchFromSupabase("refineries?id=eq.{$matches[1]}");
            echo json_encode($refinery ? $refinery[0] : null);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
            break;
    }
    exit;
}

// Serve the main application
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime Oil Brokerage Platform</title>
    <link rel="icon" type="image/x-icon" href="./favicon.ico">
    <link rel="icon" type="image/png" href="./petrodeal-logo.png">
    
    <!-- Load your actual application CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        /* Your actual application styling */
        .maritime-gradient {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0369a1 50%, #0284c7 75%, #0891b2 100%);
        }
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        /* Load your actual maritime platform styles */
        @import url('dist/main.css');
    </style>
</head>
<body>
    <div id="root"></div>
    
    <!-- Load React and dependencies -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- Load your actual application -->
    <script>
        // This will load your actual built application
        const script = document.createElement('script');
        script.src = './dist/main.js';
        script.onload = function() {
            console.log('Maritime Platform loaded successfully');
        };
        script.onerror = function() {
            console.error('Failed to load application');
            // Fallback to display error message
            document.getElementById('root').innerHTML = `
                <div class="maritime-gradient min-h-screen flex items-center justify-center">
                    <div class="text-white text-center">
                        <h1 class="text-4xl font-bold mb-4">Maritime Platform</h1>
                        <p class="text-lg">Application files not found. Please ensure all files are uploaded correctly.</p>
                    </div>
                </div>
            `;
        };
        document.head.appendChild(script);
    </script>
</body>
</html>

<?php
function fetchFromSupabase($table) {
    global $config;
    
    $url = $config['supabase_url'] . '/rest/v1/' . $table;
    
    $headers = [
        'apikey: ' . $config['supabase_anon_key'],
        'Authorization: Bearer ' . $config['supabase_anon_key'],
        'Content-Type: application/json'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    
    return [];
}
?>