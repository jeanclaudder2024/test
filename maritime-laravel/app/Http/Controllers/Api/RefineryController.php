<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refinery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RefineryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Refinery::query();

        // Filter by region
        if ($request->has('region')) {
            $query->byRegion($request->region);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $refineries = $query->get();

        return response()->json([
            'data' => $refineries
        ]);
    }

    public function show($id): JsonResponse
    {
        $refinery = Refinery::findOrFail($id);

        return response()->json([
            'data' => $refinery
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
            'operator' => 'nullable|string',
            'owner' => 'nullable|string',
            'type' => 'nullable|string',
            'products' => 'nullable|string',
            'year_built' => 'nullable|integer',
            'utilization' => 'nullable|numeric'
        ]);

        $refinery = Refinery::create($validated);

        return response()->json([
            'data' => $refinery,
            'message' => 'Refinery created successfully'
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $refinery = Refinery::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'country' => 'sometimes|string',
            'region' => 'sometimes|string',
            'lat' => 'sometimes|numeric',
            'lng' => 'sometimes|numeric',
            'capacity' => 'nullable|integer',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'operator' => 'nullable|string',
            'owner' => 'nullable|string',
            'type' => 'nullable|string',
            'products' => 'nullable|string',
            'year_built' => 'nullable|integer',
            'utilization' => 'nullable|numeric'
        ]);

        $refinery->update($validated);

        return response()->json([
            'data' => $refinery,
            'message' => 'Refinery updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $refinery = Refinery::findOrFail($id);
        $refinery->delete();

        return response()->json([
            'message' => 'Refinery deleted successfully'
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_refineries' => Refinery::count(),
            'operational_refineries' => Refinery::operational()->count(),
            'by_region' => Refinery::selectRaw('region, COUNT(*) as count')
                ->groupBy('region')
                ->get(),
            'total_capacity' => Refinery::sum('capacity'),
            'average_utilization' => Refinery::avg('utilization')
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}