<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Port;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PortController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Port::query();

        // Filter by region
        if ($request->has('region')) {
            $query->byRegion($request->region);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $ports = $query->get();

        return response()->json([
            'data' => $ports
        ]);
    }

    public function show($id): JsonResponse
    {
        $port = Port::with(['vesselsDeparting', 'vesselsArriving'])
            ->findOrFail($id);

        return response()->json([
            'data' => $port
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string',
            'region' => 'required|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'capacity' => 'nullable|integer',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'nullable|string'
        ]);

        $port = Port::create($validated);

        return response()->json([
            'data' => $port,
            'message' => 'Port created successfully'
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $port = Port::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'country' => 'sometimes|string',
            'region' => 'sometimes|string',
            'lat' => 'sometimes|numeric',
            'lng' => 'sometimes|numeric',
            'capacity' => 'nullable|integer',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'nullable|string'
        ]);

        $port->update($validated);

        return response()->json([
            'data' => $port,
            'message' => 'Port updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $port = Port::findOrFail($id);
        $port->delete();

        return response()->json([
            'message' => 'Port deleted successfully'
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_ports' => Port::count(),
            'operational_ports' => Port::operational()->count(),
            'by_region' => Port::selectRaw('region, COUNT(*) as count')
                ->groupBy('region')
                ->get(),
            'by_type' => Port::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            'total_capacity' => Port::sum('capacity')
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}