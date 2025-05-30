<?php
// Maritime Platform - Complete Version with Build Structure
require_once 'config.php';

// Simple routing for API calls
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

if (strpos($path, '/api/') === 0) {
    header('Content-Type: application/json');
    
    switch($path) {
        case '/api/vessels':
            echo json_encode(fetchFromSupabase('vessels'));
            break;
        case '/api/ports':
            echo json_encode(fetchFromSupabase('ports'));
            break;
        case '/api/refineries':
            echo json_encode(fetchFromSupabase('refineries'));
            break;
        default:
            if (preg_match('/\/api\/vessels\/(\d+)/', $path, $matches)) {
                $vessel = fetchFromSupabase("vessels?id=eq.{$matches[1]}");
                echo json_encode($vessel ? $vessel[0] : null);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
            }
            break;
    }
    exit;
}

// Serve the built application
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime Oil Brokerage Platform</title>
    <link href="./dist/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="./dist/main.js"></script>
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
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    
    return [];
}
?>