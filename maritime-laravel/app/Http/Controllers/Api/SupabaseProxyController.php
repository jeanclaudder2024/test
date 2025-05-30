<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class SupabaseProxyController extends Controller
{
    private $supabaseUrl = 'https://hjuxqjpgqacekqixiqol.supabase.co';
    private $supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdXhxanBncWFjZWtxaXhpcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTc1MDIsImV4cCI6MjA1MTM5MzUwMn0.0R8s6MF_rA4gfqAPzGN8LMFEoVJjI2N2xzJNEwTqLYo';

    public function vessels(Request $request): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/vessels?select=*');

            if ($response->successful()) {
                return response()->json([
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'error' => 'Failed to fetch vessels',
                'message' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database connection error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function ports(Request $request): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/ports?select=*');

            if ($response->successful()) {
                return response()->json([
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'error' => 'Failed to fetch ports',
                'message' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database connection error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function refineries(Request $request): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/refineries?select=*');

            if ($response->successful()) {
                return response()->json([
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'error' => 'Failed to fetch refineries',
                'message' => $response->body()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database connection error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function dashboardStats(): JsonResponse
    {
        try {
            // Fetch all data in parallel
            $vesselsResponse = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/vessels?select=*');

            $portsResponse = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/ports?select=*');

            $refineriesResponse = Http::withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'Content-Type' => 'application/json'
            ])->get($this->supabaseUrl . '/rest/v1/refineries?select=*');

            $vessels = $vesselsResponse->successful() ? $vesselsResponse->json() : [];
            $ports = $portsResponse->successful() ? $portsResponse->json() : [];
            $refineries = $refineriesResponse->successful() ? $refineriesResponse->json() : [];

            // Calculate statistics
            $stats = [
                'vessels' => [
                    'total' => count($vessels),
                    'active' => count(array_filter($vessels, fn($v) => isset($v['status']) && $v['status'] === 'active')),
                    'in_transit' => count(array_filter($vessels, fn($v) => isset($v['status']) && $v['status'] === 'in_transit')),
                    'by_type' => $this->groupByField($vessels, 'vesselType')
                ],
                'ports' => [
                    'total' => count($ports),
                    'operational' => count(array_filter($ports, fn($p) => isset($p['status']) && $p['status'] === 'operational')),
                    'by_region' => $this->groupByField($ports, 'region')
                ],
                'refineries' => [
                    'total' => count($refineries),
                    'operational' => count(array_filter($refineries, fn($r) => isset($r['status']) && $r['status'] === 'operational')),
                    'by_region' => $this->groupByField($refineries, 'region')
                ]
            ];

            return response()->json([
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch dashboard stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function groupByField($data, $field): array
    {
        $grouped = [];
        foreach ($data as $item) {
            if (isset($item[$field])) {
                $key = $item[$field];
                $grouped[$key] = ($grouped[$key] ?? 0) + 1;
            }
        }
        return $grouped;
    }
}