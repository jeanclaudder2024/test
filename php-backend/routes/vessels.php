<?php
// Vessel route handlers

function handleGetVessels() {
    $db = getDB();
    
    // Get query parameters
    $region = $_GET['region'] ?? null;
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    
    try {
        $sql = "SELECT * FROM vessels";
        $params = [];
        
        if ($region) {
            $sql .= " WHERE region = ?";
            $params[] = $region;
        }
        
        $sql .= " ORDER BY id LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $vessels = $db->fetchAll($sql, $params);
        
        // Convert lat/lng to numbers for compatibility
        foreach ($vessels as &$vessel) {
            if (isset($vessel['current_lat'])) {
                $vessel['current_lat'] = (float)$vessel['current_lat'];
            }
            if (isset($vessel['current_lng'])) {
                $vessel['current_lng'] = (float)$vessel['current_lng'];
            }
        }
        
        echo json_encode($vessels);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch vessels: ' . $e->getMessage()]);
    }
}

function handleGetVessel($id) {
    $db = getDB();
    
    try {
        $vessel = $db->fetchOne("SELECT * FROM vessels WHERE id = ?", [$id]);
        
        if (!$vessel) {
            http_response_code(404);
            echo json_encode(['error' => 'Vessel not found']);
            return;
        }
        
        // Convert lat/lng to numbers
        if (isset($vessel['current_lat'])) {
            $vessel['current_lat'] = (float)$vessel['current_lat'];
        }
        if (isset($vessel['current_lng'])) {
            $vessel['current_lng'] = (float)$vessel['current_lng'];
        }
        
        echo json_encode($vessel);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch vessel: ' . $e->getMessage()]);
    }
}

function handleCreateVessel() {
    $db = getDB();
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            return;
        }
        
        // Required fields
        $required = ['name', 'imo', 'mmsi', 'vessel_type'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing required field: $field"]);
                return;
            }
        }
        
        $sql = "INSERT INTO vessels (
            name, imo, mmsi, vessel_type, flag, built, deadweight, 
            cargo_capacity, current_lat, current_lng, speed, course, 
            status, departure_port, destination_port, departure_date, 
            eta, region, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $input['name'],
            $input['imo'],
            $input['mmsi'],
            $input['vessel_type'],
            $input['flag'] ?? null,
            $input['built'] ?? null,
            $input['deadweight'] ?? null,
            $input['cargo_capacity'] ?? null,
            $input['current_lat'] ?? null,
            $input['current_lng'] ?? null,
            $input['speed'] ?? null,
            $input['course'] ?? null,
            $input['status'] ?? 'active',
            $input['departure_port'] ?? null,
            $input['destination_port'] ?? null,
            $input['departure_date'] ?? null,
            $input['eta'] ?? null,
            $input['region'] ?? 'unknown',
            $input['metadata'] ?? null
        ];
        
        $db->execute($sql, $params);
        $vesselId = $db->lastInsertId();
        
        // Return the created vessel
        $vessel = $db->fetchOne("SELECT * FROM vessels WHERE id = ?", [$vesselId]);
        echo json_encode($vessel);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create vessel: ' . $e->getMessage()]);
    }
}

function handleBatchVessels() {
    $db = getDB();
    
    try {
        $mmsiList = $_GET['mmsi'] ?? '';
        $mmsiArray = array_filter(explode(',', $mmsiList));
        
        if (empty($mmsiArray)) {
            echo json_encode([]);
            return;
        }
        
        $placeholders = str_repeat('?,', count($mmsiArray) - 1) . '?';
        $sql = "SELECT * FROM vessels WHERE mmsi IN ($placeholders)";
        
        $vessels = $db->fetchAll($sql, $mmsiArray);
        
        // Convert lat/lng to numbers
        foreach ($vessels as &$vessel) {
            if (isset($vessel['current_lat'])) {
                $vessel['current_lat'] = (float)$vessel['current_lat'];
            }
            if (isset($vessel['current_lng'])) {
                $vessel['current_lng'] = (float)$vessel['current_lng'];
            }
        }
        
        echo json_encode($vessels);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch vessels: ' . $e->getMessage()]);
    }
}
?>