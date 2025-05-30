<?php
// Port route handlers

function handleGetPorts() {
    $db = getDB();
    
    // Get query parameters
    $region = $_GET['region'] ?? null;
    $limit = (int)($_GET['limit'] ?? 100);
    $offset = (int)($_GET['offset'] ?? 0);
    
    try {
        $sql = "SELECT * FROM ports";
        $params = [];
        
        if ($region) {
            $sql .= " WHERE region = ?";
            $params[] = $region;
        }
        
        $sql .= " ORDER BY id LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $ports = $db->fetchAll($sql, $params);
        
        // Convert lat/lng to numbers for compatibility
        foreach ($ports as &$port) {
            if (isset($port['lat'])) {
                $port['lat'] = (float)$port['lat'];
            }
            if (isset($port['lng'])) {
                $port['lng'] = (float)$port['lng'];
            }
        }
        
        echo json_encode($ports);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch ports: ' . $e->getMessage()]);
    }
}

function handleGetPort($id) {
    $db = getDB();
    
    try {
        $port = $db->fetchOne("SELECT * FROM ports WHERE id = ?", [$id]);
        
        if (!$port) {
            http_response_code(404);
            echo json_encode(['error' => 'Port not found']);
            return;
        }
        
        // Convert lat/lng to numbers
        if (isset($port['lat'])) {
            $port['lat'] = (float)$port['lat'];
        }
        if (isset($port['lng'])) {
            $port['lng'] = (float)$port['lng'];
        }
        
        // Get vessels near this port
        $nearbyVessels = $db->fetchAll("
            SELECT v.* FROM vessels v 
            JOIN vessel_port_connections vpc ON v.id = vpc.vessel_id 
            WHERE vpc.port_id = ? 
            LIMIT 10
        ", [$id]);
        
        $port['nearby_vessels'] = $nearbyVessels;
        
        echo json_encode($port);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch port: ' . $e->getMessage()]);
    }
}
?>