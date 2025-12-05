<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReverseGeocodeService
{
    /**
        * Reverse geocode lat/lon to human-readable name (cached).
        */
    public function reverse(float $lat, float $lon): string
    {
        $lat = round($lat, 4);
        $lon = round($lon, 4);
        $cacheKey = "reverse_geocode:{$lat}:{$lon}";
        $ttl = config('services.reverse_geocode_cache_ttl', 86400);

        return Cache::remember($cacheKey, $ttl, function () use ($lat, $lon) {
            $apiKey = config('services.opencage.key');
            $endpoint = config('services.opencage.endpoint', 'https://api.opencagedata.com/geocode/v1/json');

            // If no API key configured, fall back to coordinate string
            if (empty($apiKey)) {
                return $this->fallbackName($lat, $lon);
            }

            try {
                $response = Http::timeout(5)->get($endpoint, [
                    'q' => "{$lat}+{$lon}",
                    'language' => 'vi',
                    'limit' => 1,
                    'key' => $apiKey,
                ]);

                if (!$response->ok()) {
                    return $this->fallbackName($lat, $lon);
                }

                $components = data_get($response->json(), 'results.0.components', []);
                $name = $components['city']
                    ?? $components['town']
                    ?? $components['village']
                    ?? $components['state']
                    ?? $components['country']
                    ?? null;

                return $name ? $name : $this->fallbackName($lat, $lon);
            } catch (\Throwable $e) {
                Log::warning('Reverse geocode failed', [
                    'lat' => $lat,
                    'lon' => $lon,
                    'error' => $e->getMessage(),
                ]);

                return $this->fallbackName($lat, $lon);
            }
        });
    }

    private function fallbackName(float $lat, float $lon): string
    {
        return "Vị trí ({$lat}, {$lon})";
    }
}

