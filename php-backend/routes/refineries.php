<?php
// Refinery route handlers

function handleGetRefineries() {
    $db = getDB();
    
    // Get query parameters
    $region = $_GET['region'] ?? null;
    $limit = (int)($_GET['limit'] ?? 100);
    $offset = (int)($_GET['offset'] ?? 0);
    
    try {
        $sql = "SELECT * FROM refineries";
        $params = [];
        
        if ($region) {
            $sql .= " WHERE region = ?";
            $params[] = $region;
        }
        
        $sql .= " ORDER BY id LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $refineries = $db->fetchAll($sql, $params);
        
        // Convert lat/lng to numbers for compatibility
        foreach ($refineries as &$refinery) {
            if (isset($refinery['lat'])) {
                $refinery['lat'] = (float)$refinery['lat'];
            }
            if (isset($refinery['lng'])) {
                $refinery['lng'] = (float)$refinery['lng'];
            }
        }
        
        echo json_encode($refineries);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch refineries: ' . $e->getMessage()]);
    }
}

function handleGetRefinery($id) {
    $db = getDB();
    
    try {
        $refinery = $db->fetchOne("SELECT * FROM refineries WHERE id = ?", [$id]);
        
        if (!$refinery) {
            http_response_code(404);
            echo json_encode(['error' => 'Refinery not found']);
            return;
        }
        
        // Convert lat/lng to numbers
        if (isset($refinery['lat'])) {
            $refinery['lat'] = (float)$refinery['lat'];
        }
        if (isset($refinery['lng'])) {
            $refinery['lng'] = (float)$refinery['lng'];
        }
        
        echo json_encode($refinery);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch refinery: ' . $e->getMessage()]);
    }
}
?>