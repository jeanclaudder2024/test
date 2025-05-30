<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VesselController;
use App\Http\Controllers\Api\PortController;
use App\Http\Controllers\Api\RefineryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Vessel routes
Route::apiResource('vessels', VesselController::class);
Route::get('vessels/stats', [VesselController::class, 'stats']);
Route::get('vessels/tracking', [VesselController::class, 'tracking']);

// Port routes
Route::apiResource('ports', PortController::class);
Route::get('ports/stats', [PortController::class, 'stats']);

// Refinery routes
Route::apiResource('refineries', RefineryController::class);
Route::get('refineries/stats', [RefineryController::class, 'stats']);

// Dashboard stats
Route::get('dashboard/stats', function () {
    $vesselController = new VesselController();
    $portController = new PortController();
    $refineryController = new RefineryController();
    
    $vesselStats = $vesselController->stats()->getData()->data;
    $portStats = $portController->stats()->getData()->data;
    $refineryStats = $refineryController->stats()->getData()->data;
    
    return response()->json([
        'vessels' => $vesselStats,
        'ports' => $portStats,
        'refineries' => $refineryStats
    ]);
});