<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include configuration and database connection
require_once 'config/database.php';
require_once 'config/supabase.php';

// Include all route handlers
require_once 'routes/vessels.php';
require_once 'routes/ports.php';
require_once 'routes/refineries.php';
require_once 'routes/auth.php';

// Simple router
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get clean path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove base path if running in subdirectory
$path = str_replace('/api', '', $path);

try {
    switch (true) {
        // Vessel routes
        case preg_match('/^\/vessels$/', $path) && $request_method === 'GET':
            handleGetVessels();
            break;
        case preg_match('/^\/vessels\/(\d+)$/', $path, $matches) && $request_method === 'GET':
            handleGetVessel($matches[1]);
            break;
        case preg_match('/^\/vessels$/', $path) && $request_method === 'POST':
            handleCreateVessel();
            break;
        case preg_match('/^\/vessels\/batch$/', $path) && $request_method === 'GET':
            handleBatchVessels();
            break;
            
        // Port routes
        case preg_match('/^\/ports$/', $path) && $request_method === 'GET':
            handleGetPorts();
            break;
        case preg_match('/^\/ports\/(\d+)$/', $path, $matches) && $request_method === 'GET':
            handleGetPort($matches[1]);
            break;
            
        // Refinery routes
        case preg_match('/^\/refineries$/', $path) && $request_method === 'GET':
            handleGetRefineries();
            break;
        case preg_match('/^\/refineries\/(\d+)$/', $path, $matches) && $request_method === 'GET':
            handleGetRefinery($matches[1]);
            break;
            
        // Health check
        case preg_match('/^\/health$/', $path) && $request_method === 'GET':
            echo json_encode(['status' => 'healthy', 'timestamp' => date('c')]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>