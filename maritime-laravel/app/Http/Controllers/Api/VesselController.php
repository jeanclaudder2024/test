<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VesselController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vessel::query();

        // Filter by vessel type
        if ($request->has('vessel_type')) {
            $query->byVesselType($request->vessel_type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by region (based on current position)
        if ($request->has('region')) {
            // Add region filtering logic based on coordinates
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $vessels = $query->paginate($perPage);

        return response()->json([
            'data' => $vessels->items(),
            'meta' => [
                'current_page' => $vessels->currentPage(),
                'last_page' => $vessels->lastPage(),
                'per_page' => $vessels->perPage(),
                'total' => $vessels->total()
            ]
        ]);
    }

    public function show($id): JsonResponse
    {
        $vessel = Vessel::with(['departurePortRelation', 'destinationPortRelation'])
            ->findOrFail($id);

        return response()->json([
            'data' => $vessel
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'imo' => 'required|string|unique:vessels',
            'mmsi' => 'required|string|unique:vessels',
            'vessel_type' => 'required|string',
            'flag' => 'required|string',
            'built' => 'nullable|integer',
            'deadweight' => 'nullable|integer',
            'cargo_capacity' => 'nullable|integer',
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'course' => 'nullable|numeric',
            'status' => 'nullable|string',
            'departure_port' => 'nullable|string',
            'destination_port' => 'nullable|string',
            'departure_date' => 'nullable|date',
            'eta' => 'nullable|date'
        ]);

        $vessel = Vessel::create($validated);

        return response()->json([
            'data' => $vessel,
            'message' => 'Vessel created successfully'
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $vessel = Vessel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'vessel_type' => 'sometimes|string',
            'flag' => 'sometimes|string',
            'built' => 'nullable|integer',
            'deadweight' => 'nullable|integer',
            'cargo_capacity' => 'nullable|integer',
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'course' => 'nullable|numeric',
            'status' => 'nullable|string',
            'departure_port' => 'nullable|string',
            'destination_port' => 'nullable|string',
            'departure_date' => 'nullable|date',
            'eta' => 'nullable|date'
        ]);

        $vessel->update($validated);

        return response()->json([
            'data' => $vessel,
            'message' => 'Vessel updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $vessel = Vessel::findOrFail($id);
        $vessel->delete();

        return response()->json([
            'message' => 'Vessel deleted successfully'
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_vessels' => Vessel::count(),
            'active_vessels' => Vessel::active()->count(),
            'in_transit' => Vessel::inTransit()->count(),
            'by_type' => Vessel::selectRaw('vessel_type, COUNT(*) as count')
                ->groupBy('vessel_type')
                ->get(),
            'total_cargo_capacity' => Vessel::sum('cargo_capacity')
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    public function tracking(Request $request): JsonResponse
    {
        $vessels = Vessel::select(['id', 'name', 'current_lat', 'current_lng', 'status', 'vessel_type'])
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->get();

        return response()->json([
            'data' => $vessels
        ]);
    }
}