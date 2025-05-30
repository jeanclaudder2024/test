<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VesselController;
use App\Http\Controllers\Api\PortController;
use App\Http\Controllers\Api\RefineryController;
use App\Http\Controllers\Api\SupabaseProxyController;

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

// Supabase proxy routes for authentic data
Route::get('vessels', [SupabaseProxyController::class, 'vessels']);
Route::get('ports', [SupabaseProxyController::class, 'ports']);
Route::get('refineries', [SupabaseProxyController::class, 'refineries']);
Route::get('dashboard/stats', [SupabaseProxyController::class, 'dashboardStats']);

// Additional vessel routes
Route::get('vessels/stats', [SupabaseProxyController::class, 'dashboardStats']);
Route::get('vessels/tracking', [SupabaseProxyController::class, 'vessels']);

// Additional port routes
Route::get('ports/stats', [SupabaseProxyController::class, 'dashboardStats']);

// Additional refinery routes
Route::get('refineries/stats', [SupabaseProxyController::class, 'dashboardStats']);

// Fallback Laravel model routes (if needed)
Route::prefix('laravel')->group(function () {
    Route::apiResource('vessels', VesselController::class);
    Route::apiResource('ports', PortController::class);
    Route::apiResource('refineries', RefineryController::class);
});