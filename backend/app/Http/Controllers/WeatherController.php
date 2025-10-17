<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class WeatherController extends Controller
{
    /**
     * Weather code descriptions mapping (Vietnamese)
     */
    private const WEATHER_CODES = [
        0 => 'Trời quang đãng',
        1 => 'Chủ yếu quang đãng',
        2 => 'Có mây một phần',
        3 => 'Nhiều mây',
        45 => 'Sương mù',
        48 => 'Sương mù đóng băng',
        51 => 'Mưa phùn nhẹ',
        53 => 'Mưa phùn vừa',
        55 => 'Mưa phùn dày đặc',
        61 => 'Mưa nhỏ',
        63 => 'Mưa vừa',
        65 => 'Mưa to',
        71 => 'Tuyết rơi nhẹ',
        73 => 'Tuyết rơi vừa',
        75 => 'Tuyết rơi nặng',
        77 => 'Tuyết dạng hạt',
        80 => 'Mưa rào nhẹ',
        81 => 'Mưa rào vừa',
        82 => 'Mưa rào dữ dội',
        85 => 'Tuyết rơi nhẹ',
        86 => 'Tuyết rơi nặng',
        95 => 'Giông bão',
        96 => 'Giông có mưa đá nhẹ',
        99 => 'Giông có mưa đá nặng',
    ];

    /**
     * Get comprehensive weather data for a location
     * Includes current weather, forecasts, anomaly detection, and recommendations
     *
     * @param Request $request
     * @param float $lat Latitude
     * @param float $lon Longitude
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWeatherData(Request $request, $lat, $lon)
    {
        try {
            // Validate latitude and longitude
            if (!is_numeric($lat) || !is_numeric($lon)) {
                return response()->json([
                    'error' => 'Invalid latitude or longitude',
                    'message' => 'Latitude and longitude must be numeric values'
                ], 400);
            }

            // Validate ranges
            if ($lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
                return response()->json([
                    'error' => 'Coordinates out of range',
                    'message' => 'Latitude must be between -90 and 90, longitude between -180 and 180'
                ], 400);
            }

            // Build Open-Meteo API URL with all required parameters
            $apiUrl = "https://api.open-meteo.com/v1/forecast";
            $params = [
                'latitude' => $lat,
                'longitude' => $lon,
                'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation',
                'hourly' => 'temperature_2m,weather_code,precipitation_probability',
                'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,precipitation_probability_max,rain_sum,showers_sum,snowfall_sum,windspeed_10m_max,winddirection_10m_dominant,pressure_msl_max,pressure_msl_min,pressure_msl_mean,relative_humidity_2m_max,relative_humidity_2m_min,relative_humidity_2m_mean,uv_index_max,uv_index_clear_sky_max',
                'timezone' => 'auto',
                'past_days' => 30,
                'forecast_days' => 7
            ];

            // Make HTTP request to Open-Meteo API using Guzzle
            $client = new Client([
                'timeout' => 10,
                'verify' => false  // Disable SSL verification for development
            ]);
            $response = $client->get($apiUrl, ['query' => $params]);
            $data = json_decode($response->getBody(), true);

            // Process and structure the response data
            $processedData = [
                'location' => [
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'timezone' => $data['timezone'],
                    'elevation' => $data['elevation']
                ],
                'current_weather' => $this->processCurrentWeather($data['current']),
                'hourly_forecast' => $this->processHourlyForecast($data['hourly']),
                'daily_forecast' => $this->processDailyForecast($data['daily']),
                'anomaly' => $this->detectAnomaly($data['current'], $data['daily']),
                'recommendation' => $this->generateRecommendation($data['current'], $data['daily'])
            ];

            return response()->json($processedData);

        } catch (GuzzleException $e) {
            Log::error('Weather API Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch weather data',
                'message' => 'Could not connect to weather service. Please try again later.'
            ], 503);
        } catch (\Exception $e) {
            Log::error('Unexpected Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server error',
                'message' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * Compare weather data between two locations
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function compareLocations(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'location1' => 'required|array',
                'location1.lat' => 'required|numeric|between:-90,90',
                'location1.lon' => 'required|numeric|between:-180,180',
                'location1.name' => 'sometimes|string',
                'location2' => 'required|array',
                'location2.lat' => 'required|numeric|between:-90,90',
                'location2.lon' => 'required|numeric|between:-180,180',
                'location2.name' => 'sometimes|string',
            ]);

            $location1 = $validated['location1'];
            $location2 = $validated['location2'];

            // Fetch weather data for both locations
            $weather1 = $this->fetchWeatherForComparison($location1['lat'], $location1['lon']);
            $weather2 = $this->fetchWeatherForComparison($location2['lat'], $location2['lon']);

            // Structure comparison data
            $comparison = [
                'location1' => [
                    'name' => $location1['name'] ?? "Location 1",
                    'coordinates' => [
                        'lat' => $location1['lat'],
                        'lon' => $location1['lon']
                    ],
                    'current_weather' => $weather1['current_weather'],
                    'daily_summary' => $weather1['daily_summary']
                ],
                'location2' => [
                    'name' => $location2['name'] ?? "Location 2",
                    'coordinates' => [
                        'lat' => $location2['lat'],
                        'lon' => $location2['lon']
                    ],
                    'current_weather' => $weather2['current_weather'],
                    'daily_summary' => $weather2['daily_summary']
                ],
                'differences' => $this->calculateDifferences($weather1['current_weather'], $weather2['current_weather'])
            ];

            return response()->json($comparison);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Comparison Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to compare locations',
                'message' => 'An error occurred while comparing weather data'
            ], 500);
        }
    }

    /**
     * Fetch weather data specifically for comparison purposes
     *
     * @param float $lat
     * @param float $lon
     * @return array
     */
    private function fetchWeatherForComparison($lat, $lon)
    {
        $apiUrl = "https://api.open-meteo.com/v1/forecast";
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'current' => 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation',
            'daily' => 'weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,precipitation_probability_max,rain_sum,showers_sum,snowfall_sum,windspeed_10m_max,winddirection_10m_dominant,pressure_msl_max,pressure_msl_min,pressure_msl_mean,relative_humidity_2m_max,relative_humidity_2m_min,relative_humidity_2m_mean,uv_index_max,uv_index_clear_sky_max',
            'timezone' => 'auto',
            'forecast_days' => 1
        ];

        $client = new Client([
            'timeout' => 10,
            'verify' => false  // Disable SSL verification for development
        ]);
        $response = $client->get($apiUrl, ['query' => $params]);
        $data = json_decode($response->getBody(), true);

        return [
            'current_weather' => $this->processCurrentWeather($data['current']),
            'daily_summary' => [
                'max_temp' => $data['daily']['temperature_2m_max'][0],
                'min_temp' => $data['daily']['temperature_2m_min'][0],
                'uv_index' => $data['daily']['uv_index_max'][0],
                'weather_description' => $this->getWeatherDescription($data['daily']['weather_code'][0])
            ]
        ];
    }

    /**
     * Process current weather data into a structured format
     *
     * @param array $current
     * @return array
     */
    private function processCurrentWeather($current)
    {
        return [
            'time' => $current['time'],
            'temperature' => round($current['temperature_2m'], 1),
            'apparent_temperature' => round($current['apparent_temperature'], 1),
            'humidity' => $current['relative_humidity_2m'],
            'wind_speed' => round($current['wind_speed_10m'], 1),
            'precipitation' => $current['precipitation'] ?? 0,
            'weather_code' => $current['weather_code'],
            'weather_description' => $this->getWeatherDescription($current['weather_code'])
        ];
    }

    /**
     * Process hourly forecast data - returns next 24 hours
     * Converts time-series data into array of objects
     *
     * @param array $hourly
     * @return array
     */
    private function processHourlyForecast($hourly)
    {
        $forecast = [];
        $currentHourIndex = $this->findCurrentHourIndex($hourly['time']);
        
        // Get next 24 hours starting from current hour
        for ($i = $currentHourIndex; $i < $currentHourIndex + 24 && $i < count($hourly['time']); $i++) {
            $forecast[] = [
                'time' => $hourly['time'][$i],
                'temperature' => round($hourly['temperature_2m'][$i], 1),
                'weather_code' => $hourly['weather_code'][$i],
                'weather_description' => $this->getWeatherDescription($hourly['weather_code'][$i]),
                'precipitation_probability' => $hourly['precipitation_probability'][$i] ?? 0
            ];
        }

        return $forecast;
    }

    /**
     * Process daily forecast data - returns next 7 days
     * Converts time-series data into array of objects
     *
     * @param array $daily
     * @return array
     */
    private function processDailyForecast($daily)
    {
        $forecast = [];
        $totalDays = count($daily['time']);
        // Get the last 7 days (future forecast)
        $startIndex = max(0, $totalDays - 7);

        for ($i = $startIndex; $i < $totalDays; $i++) {
            $forecast[] = [
                'date' => $daily['time'][$i],
                'weather_code' => $daily['weather_code'][$i],
                'weather_description' => $this->getWeatherDescription($daily['weather_code'][$i]),
                
                // Nhiệt độ
                'temperature_2m_max' => round($daily['temperature_2m_max'][$i], 1),
                'temperature_2m_min' => round($daily['temperature_2m_min'][$i], 1),
                'temperature_2m_mean' => isset($daily['temperature_2m_mean'][$i]) ? round($daily['temperature_2m_mean'][$i], 1) : null,
                
                // Mưa
                'precipitation_sum' => round($daily['precipitation_sum'][$i] ?? 0, 1),
                'precipitation_probability_max' => $daily['precipitation_probability_max'][$i] ?? 0,
                'rain_sum' => round($daily['rain_sum'][$i] ?? 0, 1),
                'showers_sum' => round($daily['showers_sum'][$i] ?? 0, 1),
                'snowfall_sum' => round($daily['snowfall_sum'][$i] ?? 0, 1),
                
                // Gió
                'windspeed_10m_max' => round($daily['windspeed_10m_max'][$i] ?? 0, 1),
                'winddirection_10m_dominant' => $daily['winddirection_10m_dominant'][$i] ?? 0,
                
                // Áp suất
                'pressure_msl_max' => round($daily['pressure_msl_max'][$i] ?? 0, 1),
                'pressure_msl_min' => round($daily['pressure_msl_min'][$i] ?? 0, 1),
                'pressure_msl_mean' => isset($daily['pressure_msl_mean'][$i]) ? round($daily['pressure_msl_mean'][$i], 1) : null,
                
                // Độ ẩm
                'relative_humidity_2m_max' => $daily['relative_humidity_2m_max'][$i] ?? 0,
                'relative_humidity_2m_min' => $daily['relative_humidity_2m_min'][$i] ?? 0,
                'relative_humidity_2m_mean' => isset($daily['relative_humidity_2m_mean'][$i]) ? $daily['relative_humidity_2m_mean'][$i] : null,
                
                // UV
                'uv_index_max' => round($daily['uv_index_max'][$i] ?? 0, 1),
                'uv_index_clear_sky_max' => round($daily['uv_index_clear_sky_max'][$i] ?? 0, 1),
                
                // Backward compatibility
                'max_temperature' => round($daily['temperature_2m_max'][$i], 1),
                'min_temperature' => round($daily['temperature_2m_min'][$i], 1),
                'uv_index' => round($daily['uv_index_max'][$i] ?? 0, 1)
            ];
        }

        return $forecast;
    }

    /**
     * Detect temperature anomalies by comparing current temp with 30-day average
     * This is the anomaly detection algorithm
     *
     * @param array $current
     * @param array $daily
     * @return array
     */
    private function detectAnomaly($current, $daily)
    {
        // Calculate average max temperature from past 30 days (historical data)
        $totalDays = count($daily['temperature_2m_max']);
        // Get historical data (excluding forecast days)
        $historicalData = array_slice($daily['temperature_2m_max'], 0, min(30, $totalDays - 7));
        
        if (empty($historicalData)) {
            return [
                'is_anomaly' => false,
                'message' => 'Không đủ dữ liệu lịch sử để phát hiện bất thường'
            ];
        }

        // Calculate average
        $avgMaxTemp = array_sum($historicalData) / count($historicalData);
        $currentTemp = $current['temperature_2m'];
        $difference = $currentTemp - $avgMaxTemp;

        // Consider it an anomaly if difference is greater than 5°C
        if (abs($difference) > 5) {
            $direction = $difference > 0 ? 'cao hơn' : 'thấp hơn';
            return [
                'is_anomaly' => true,
                'type' => $difference > 0 ? 'hot' : 'cold',
                'difference' => round(abs($difference), 1),
                'average_temp' => round($avgMaxTemp, 1),
                'current_temp' => round($currentTemp, 1),
                'message' => "⚠️ Nhiệt độ hiện tại {$direction} " . round(abs($difference), 1) . "°C so với trung bình 30 ngày qua (" . round($avgMaxTemp, 1) . "°C)"
            ];
        }

        return [
            'is_anomaly' => false,
            'average_temp' => round($avgMaxTemp, 1),
            'current_temp' => round($currentTemp, 1),
            'message' => 'Nhiệt độ hiện tại nằm trong mức bình thường'
        ];
    }

    /**
     * Generate smart recommendations based on weather conditions
     * Analyzes multiple weather parameters to provide actionable advice
     *
     * @param array $current
     * @param array $daily
     * @return string
     */
    private function generateRecommendation($current, $daily)
    {
        $recommendations = [];
        
        // UV Index recommendation
        $todayUV = $daily['uv_index_max'][count($daily['uv_index_max']) - 7] ?? 0;
        if ($todayUV >= 8) {
            $recommendations[] = "☀️ Chỉ số UV rất cao ({$todayUV}). Nên sử dụng kem chống nắng SPF 50+, đội mũ và đeo kính râm.";
        } elseif ($todayUV >= 6) {
            $recommendations[] = "☀️ Chỉ số UV cao ({$todayUV}). Nên sử dụng kem chống nắng và hạn chế ra ngoài vào giữa trưa.";
        } elseif ($todayUV >= 3) {
            $recommendations[] = "🌤️ Chỉ số UV trung bình ({$todayUV}). Nên sử dụng kem chống nắng khi ra ngoài lâu.";
        }

        // Temperature recommendation
        $temp = $current['temperature_2m'];
        if ($temp >= 35) {
            $recommendations[] = "🌡️ Nhiệt độ rất cao ({$temp}°C). Hãy uống nhiều nước, tránh hoạt động ngoài trời và ở nơi mát mẻ.";
        } elseif ($temp <= 15) {
            $recommendations[] = "🧥 Nhiệt độ khá thấp ({$temp}°C). Nên mặc áo ấm khi ra ngoài.";
        }

        // Weather code based recommendations
        $weatherCode = $current['weather_code'];
        if (in_array($weatherCode, [61, 63, 65, 80, 81, 82])) {
            $recommendations[] = "☔ Trời đang mưa. Nhớ mang theo áo mưa hoặc ô.";
        } elseif (in_array($weatherCode, [95, 96, 99])) {
            $recommendations[] = "⛈️ Cảnh báo giông bão. Nên ở trong nhà và tránh xa cửa sổ.";
        } elseif (in_array($weatherCode, [45, 48])) {
            $recommendations[] = "🌫️ Sương mù dày. Lái xe cần thận trọng, bật đèn và giảm tốc độ.";
        }

        // Wind speed recommendation
        $windSpeed = $current['wind_speed_10m'];
        if ($windSpeed >= 40) {
            $recommendations[] = "💨 Gió rất mạnh ({$windSpeed} km/h). Tránh ra ngoài và cố định đồ vật có thể bị thổi bay.";
        } elseif ($windSpeed >= 25) {
            $recommendations[] = "🌬️ Gió mạnh ({$windSpeed} km/h). Cẩn thận khi di chuyển ngoài trời.";
        }

        // Humidity recommendation
        $humidity = $current['relative_humidity_2m'];
        if ($humidity >= 80) {
            $recommendations[] = "💧 Độ ẩm cao ({$humidity}%). Thời tiết oi bức, hãy giữ cơ thể khô ráo.";
        }

        // Default recommendation if weather is good
        if (empty($recommendations)) {
            $recommendations[] = "✅ Thời tiết thuận lợi cho các hoạt động ngoài trời!";
        }

        return implode("\n\n", $recommendations);
    }

    /**
     * Calculate differences between two locations' weather
     *
     * @param array $weather1
     * @param array $weather2
     * @return array
     */
    private function calculateDifferences($weather1, $weather2)
    {
        return [
            'temperature_diff' => round($weather1['temperature'] - $weather2['temperature'], 1),
            'humidity_diff' => $weather1['humidity'] - $weather2['humidity'],
            'wind_speed_diff' => round($weather1['wind_speed'] - $weather2['wind_speed'], 1),
            'apparent_temperature_diff' => round($weather1['apparent_temperature'] - $weather2['apparent_temperature'], 1)
        ];
    }

    /**
     * Get weather description in Vietnamese based on WMO weather code
     *
     * @param int $code
     * @return string
     */
    private function getWeatherDescription($code)
    {
        return self::WEATHER_CODES[$code] ?? 'Không xác định';
    }

    /**
     * Find the current hour index in the hourly data array
     *
     * @param array $times
     * @return int
     */
    private function findCurrentHourIndex($times)
    {
        $currentTime = now();
        
        foreach ($times as $index => $time) {
            $timeObj = \Carbon\Carbon::parse($time);
            if ($timeObj >= $currentTime) {
                return $index;
            }
        }
        
        return 0;
    }
}
