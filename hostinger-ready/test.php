<?php
// Quick deployment verification test
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'PHP is working correctly',
    'php_version' => phpversion(),
    'curl_available' => extension_loaded('curl'),
    'json_available' => extension_loaded('json'),
    'timestamp' => date('Y-m-d H:i:s')
]);
?>