<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Weather API Routes
Route::prefix('weather')->group(function () {
    // Get comprehensive weather data for a specific location
    // Returns current weather, hourly forecast, daily forecast, anomaly detection, and recommendations
    Route::get('/{lat}/{lon}', [WeatherController::class, 'getWeatherData']);
    
    // Get weather data for multiple cities in bulk (for RainMap)
    // Returns weather data for 24 major cities worldwide
    Route::get('/bulk', [WeatherController::class, 'getBulkWeatherData']);
    
    // Compare weather data between two locations
    // Expects JSON body: { "location1": {"lat": ..., "lon": ..., "name": "..."}, "location2": {"lat": ..., "lon": ..., "name": "..."} }
    Route::post('/comparison', [WeatherController::class, 'compareLocations']);
    
    // Generate detailed AI-powered weather report
    Route::get('/report/{lat}/{lon}', [WeatherController::class, 'getDetailedReport']);
});
