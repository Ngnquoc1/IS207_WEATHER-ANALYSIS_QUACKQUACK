<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeminiService
{
    private $apiKey;
    private $client;
    private const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        $this->client = new Client([
            'timeout' => 15,
            'verify' => false
        ]);
        
        // Log initialization
        Log::info('🤖 GeminiService initialized', [
            'api_key_configured' => !empty($this->apiKey),
            'api_key_length' => $this->apiKey ? strlen($this->apiKey) : 0,
            'endpoint' => self::API_ENDPOINT
        ]);
    }

    /**
     * Detect weather anomalies using Gemini AI
     * 
     * @param array $currentWeather Current weather data
     * @param array $historicalData 30-day historical temperature data
     * @return array Anomaly detection result
     */
    public function detectAnomaly($currentWeather, $historicalData)
    {
        // Create cache key based on location and current temp
        $cacheKey = 'anomaly_' . md5(json_encode([
            'temp' => $currentWeather['temperature_2m'],
            'historical' => array_slice($historicalData['temperature_2m_max'], 0, 5)
        ]));

        // Try to get from cache (1 hour)
        return Cache::remember($cacheKey, 3600, function () use ($currentWeather, $historicalData) {
            try {
                $prompt = $this->buildAnomalyPrompt($currentWeather, $historicalData);
                $response = $this->callGeminiAPI($prompt);
                
                return $this->parseAnomalyResponse($response, $currentWeather, $historicalData);
            } catch (\Exception $e) {
                Log::error('Gemini Anomaly Detection Error: ' . $e->getMessage());
                // Fallback to simple rule-based detection
                return $this->fallbackAnomalyDetection($currentWeather, $historicalData);
            }
        });
    }

    /**
     * Generate smart weather recommendations using Gemini AI
     * 
     * @param array $currentWeather Current weather data
     * @param array $dailyForecast Daily forecast data
     * @return string AI-generated recommendation
     */
    public function generateRecommendation($currentWeather, $dailyForecast)
    {
        Log::info('💡 Starting recommendation generation', [
            'temp' => $currentWeather['temperature_2m'] ?? 'N/A',
            'weather_code' => $currentWeather['weather_code'] ?? 'N/A',
            'uv_index' => $dailyForecast['uv_index_max'][0] ?? 'N/A'
        ]);

        // Create cache key
        $cacheKey = 'recommendation_v3_' . md5(json_encode([
            'temp' => $currentWeather['temperature_2m'],
            'weather' => $currentWeather['weather_code'],
            'uv' => $dailyForecast['uv_index_max'][0] ?? 0
        ]));
        
        Log::info('📦 Cache key generated for recommendation', ['cache_key' => $cacheKey]);

        // Try to get from cache (2 hours)
        return Cache::remember($cacheKey, 7200, function () use ($currentWeather, $dailyForecast, $cacheKey) {
            Log::info('❌ Cache MISS - Calling Gemini API for recommendation', ['cache_key' => $cacheKey]);
            
            try {
                $prompt = $this->buildRecommendationPrompt($currentWeather, $dailyForecast);
                
                Log::info('📝 Recommendation prompt built', [
                    'prompt_length' => strlen($prompt),
                    'prompt_preview' => substr($prompt, 0, 150) . '...'
                ]);
                
                $response = $this->callGeminiAPI($prompt);
                
                $result = $this->parseRecommendationResponse($response);
                
                Log::info('✅ Recommendation generated successfully via Gemini AI', [
                    'recommendation_length' => strlen($result),
                    'recommendation_preview' => substr($result, 0, 100) . '...'
                ]);
                
                return $result;
            } catch (\Exception $e) {
                Log::error('❌ Gemini Recommendation Error', [
                    'error_message' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'trace' => substr($e->getTraceAsString(), 0, 500)
                ]);
                // Fallback to simple rule-based recommendation
                return $this->fallbackRecommendation($currentWeather, $dailyForecast);
            }
        });
    }

    /**
     * Build anomaly detection prompt
     */
    private function buildAnomalyPrompt($currentWeather, $historicalData)
    {
        $currentTemp = $currentWeather['temperature_2m'];
        $avgTemp = array_sum($historicalData['temperature_2m_max']) / count($historicalData['temperature_2m_max']);
        $difference = $currentTemp - $avgTemp;

        $prompt = <<<PROMPT
Bạn là chuyên gia phân tích thời tiết. Hãy phân tích dữ liệu sau và cho biết liệu có bất thường không:

**Dữ liệu hiện tại:**
- Nhiệt độ hiện tại: {$currentTemp}°C
- Nhiệt độ trung bình 30 ngày qua: {$avgTemp}°C
- Chênh lệch: {$difference}°C

**Nhiệm vụ:**
1. Đánh giá xem có bất thường nhiệt độ không (ngưỡng: >5°C hoặc <-5°C)
2. Nếu có bất thường, giải thích nguyên nhân có thể (thay đổi thời tiết, mùa, hiện tượng khí hậu)
3. Đưa ra cảnh báo nếu cần thiết

**Định dạng trả về (JSON):**
{
    "is_anomaly": true/false,
    "message": "Mô tả ngắn gọn bằng tiếng Việt (1-2 câu)",
    "severity": "normal/warning/alert",
    "explanation": "Giải thích chi tiết hơn"
}

Chỉ trả về JSON, không thêm text khác.
PROMPT;

        return $prompt;
    }

    /**
     * Build recommendation prompt
     */
    private function buildRecommendationPrompt($currentWeather, $dailyForecast)
    {
        $temp = $currentWeather['temperature_2m'];
        $humidity = $currentWeather['relative_humidity_2m'];
        $windSpeed = $currentWeather['wind_speed_10m'];
        $weatherCode = $currentWeather['weather_code'];
        $uvIndex = $dailyForecast['uv_index_max'][0] ?? 0;

        $weatherCondition = $this->getWeatherDescription($weatherCode);

        $prompt = <<<PROMPT
Bạn là trợ lý thời tiết thông minh. Hãy đưa ra lời khuyên thực tế cho người dùng dựa trên dữ liệu:

**Điều kiện thời tiết:**
- Nhiệt độ: {$temp}°C
- Độ ẩm: {$humidity}%
- Tốc độ gió: {$windSpeed} km/h
- Tình trạng: {$weatherCondition}
- Chỉ số UV: {$uvIndex}

**Nhiệm vụ:**
Đưa ra 2-3 lời khuyên thực tế bằng tiếng Việt về:
1. Cách ăn mặc phù hợp
2. Hoạt động ngoài trời (nên/không nên)
3. Bảo vệ sức khỏe (chống nắng, giữ ấm, v.v.)
4. Mang theo đồ dùng cần thiết (ô, áo mưa, kem chống nắng, v.v.)

**Yêu cầu:**
- Ngắn gọn, dễ hiểu
- Sử dụng emoji phù hợp
- Không quá 3-4 câu
- Thực tế và hữu ích
- BẮT BUỘC: Ngăn cách các ý bằng chuỗi ký tự "|||". Không sử dụng xuống dòng.

Ví dụ: ☔ Mang theo ô nhé. ||| 🧥 Mặc áo ấm khi ra đường. ||| 🏠 Hạn chế ra ngoài.

Chỉ trả về text khuyên nghị, không thêm tiêu đề hay giải thích.
PROMPT;

        return $prompt;
    }

    /**
     * Call Gemini API
     */
    private function callGeminiAPI($prompt)
    {
        Log::info('🚀 Calling Gemini API', [
            'endpoint' => self::API_ENDPOINT,
            'prompt_length' => strlen($prompt),
            'timestamp' => now()->toIso8601String()
        ]);

        if (empty($this->apiKey)) {
            Log::error('❌ Gemini API key not configured');
            throw new \Exception('Gemini API key not configured');
        }

        $requestStartTime = microtime(true);

        try {
            $response = $this->client->post(self::API_ENDPOINT, [
            'query' => ['key' => $this->apiKey],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ],
            'headers' => [
                'Content-Type' => 'application/json'
            ]
            ]);

            $requestDuration = (microtime(true) - $requestStartTime) * 1000;

            Log::info('✅ Gemini API call successful', [
                'status_code' => $response->getStatusCode(),
                'response_size' => strlen($response->getBody()),
                'duration_ms' => round($requestDuration, 2)
            ]);

            $data = json_decode($response->getBody(), true);
            
            if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                Log::error('❌ Invalid Gemini API response structure', [
                    'response_keys' => array_keys($data ?? []),
                    'response_preview' => substr(json_encode($data), 0, 200)
                ]);
                throw new \Exception('Invalid Gemini API response');
            }

            $responseText = $data['candidates'][0]['content']['parts'][0]['text'];

            Log::info('📄 Gemini response extracted', [
                'response_length' => strlen($responseText),
                'response_preview' => substr($responseText, 0, 150) . '...'
            ]);

            return $responseText;

        } catch (GuzzleException $e) {
            $requestDuration = (microtime(true) - $requestStartTime) * 1000;

            Log::error('❌ Gemini API HTTP request failed', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'duration_ms' => round($requestDuration, 2),
                'response_body' => method_exists($e, 'getResponse') && $e->getResponse() 
                    ? substr($e->getResponse()->getBody(), 0, 500) 
                    : 'No response body'
            ]);

            throw $e;
        }
    }

    /**
     * Parse anomaly response from Gemini
     */
    private function parseAnomalyResponse($response, $currentWeather, $historicalData)
    {
        // Try to extract JSON from response
        $jsonMatch = [];
        if (preg_match('/\{[^}]+\}/', $response, $jsonMatch)) {
            $data = json_decode($jsonMatch[0], true);
            if ($data) {
                return [
                    'is_anomaly' => $data['is_anomaly'] ?? false,
                    'message' => $data['message'] ?? '',
                    'severity' => $data['severity'] ?? 'normal',
                    'current_temp' => $currentWeather['temperature_2m'],
                    'average_temp' => round(array_sum($historicalData['temperature_2m_max']) / count($historicalData['temperature_2m_max']), 1),
                    'difference' => round($currentWeather['temperature_2m'] - (array_sum($historicalData['temperature_2m_max']) / count($historicalData['temperature_2m_max'])), 1)
                ];
            }
        }

        // Fallback if parsing fails
        return $this->fallbackAnomalyDetection($currentWeather, $historicalData);
    }

    /**
     * Generate comprehensive detailed weather report using Gemini AI
     * 
     * @param array $weatherData Complete weather data including current, forecast, anomaly
     * @param float $lat Latitude
     * @param float $lon Longitude
     * @return array Detailed report with multiple sections
     */
    public function generateDetailedReport($weatherData, $lat, $lon)
    {
        $cacheKey = 'detailed_report_' . md5(json_encode([
            'lat' => $lat,
            'lon' => $lon,
            'temp' => $weatherData['current_weather']['temperature'] ?? 0,
            'date' => date('Y-m-d-H')
        ]));

        return Cache::remember($cacheKey, 3600, function () use ($weatherData, $lat, $lon) {
            try {
                $prompt = $this->buildDetailedReportPrompt($weatherData, $lat, $lon);
                $response = $this->callGeminiAPI($prompt);
                
                return [
                    'success' => true,
                    'report' => $this->parseDetailedReportResponse($response),
                    'source' => 'gemini_ai',
                    'model' => 'gemini-pro',
                    'generated_at' => now()->toIso8601String()
                ];
            } catch (\Exception $e) {
                Log::error('Gemini Detailed Report Error: ' . $e->getMessage());
                
                return [
                    'success' => false,
                    'report' => $this->generateFallbackReport($weatherData),
                    'source' => 'rule_based',
                    'error' => $e->getMessage(),
                    'generated_at' => now()->toIso8601String()
                ];
            }
        });
    }

    /**
     * Build detailed report prompt for Gemini
     */
    private function buildDetailedReportPrompt($weatherData, $lat, $lon)
    {
        $current = $weatherData['current_weather'];
        $anomaly = $weatherData['anomaly'];
        $dailyForecast = $weatherData['daily_forecast'];

        $temp = $current['temperature'];
        $humidity = $current['humidity'];
        $windSpeed = $current['wind_speed'];
        $weatherDesc = $current['weather_description'];
        
        $hasAnomaly = $anomaly['is_anomaly'] ?? false;
        $anomalyMessage = $hasAnomaly ? $anomaly['message'] : 'Không có bất thường';

        $prompt = <<<PROMPT
Bạn là chuyên gia phân tích thời tiết chuyên nghiệp. Hãy tạo một báo cáo chi tiết và toàn diện về tình hình thời tiết.

**DỮ LIỆU THỜI TIẾT:**
📍 Vị trí: {$lat}, {$lon}
🌡️ Nhiệt độ hiện tại: {$temp}°C
💧 Độ ẩm: {$humidity}%
💨 Tốc độ gió: {$windSpeed} km/h
☁️ Tình trạng: {$weatherDesc}
⚠️ Bất thường: {$anomalyMessage}

**NHIỆM VỤ:**
Tạo báo cáo chi tiết có cấu trúc như sau (sử dụng Markdown):

#  BÁO CÁO PHÂN TÍCH THỜI TIẾT CHI TIẾT

## 1.  TỔNG QUAN TÌNH HÌNH
- Mô tả tổng quan điều kiện thời tiết hiện tại
- Đánh giá chung về độ thuận lợi

## 2.  PHÂN TÍCH CHI TIẾT

### Nhiệt độ
- Phân tích nhiệt độ hiện tại
- So sánh với ngưỡng an toàn
- Xu hướng biến đổi

### Độ Ẩm
- Đánh giá mức độ ẩm
- Ảnh hưởng đến cơ thể
- Khuyến nghị

### Gió
- Phân tích tốc độ gió
- Mức độ ảnh hưởng
- Cảnh báo nếu cần

## 3.  PHÁT HIỆN BẤT THƯỜNG
{$anomalyMessage}
- Giải thích nguyên nhân có thể
- Tác động đến hoạt động hàng ngày
- Dự báo xu hướng

## 4.  KHUYẾN NGHỊ HÀNH ĐỘNG

### Đối với cá nhân:
- Lời khuyên cụ thể về ăn mặc
- Hoạt động ngoài trời
- Bảo vệ sức khỏe

### Đối với gia đình:
- Chuẩn bị cần thiết
- Lưu ý với người già, trẻ em
- An toàn trong nhà

### Đối với doanh nghiệp:
- Tác động đến hoạt động sản xuất
- Biện pháp phòng ngừa
- Kế hoạch dự phòng

## 5.  DỰ BÁO 7 NGÀY TỚI
- Xu hướng nhiệt độ
- Khả năng mưa
- Những ngày cần chú ý đặc biệt

## 6.  CẢNH BÁO & LƯU Ý
- Các nguy cơ tiềm ẩn
- Biện pháp phòng tránh
- Số điện thoại khẩn cấp (nếu cần)

## 7.  KẾT LUẬN
- Đánh giá tổng thể
- Xu hướng chung
- Khuyến nghị quan trọng nhất

---
**Lưu ý:**
- Sử dụng ngôn ngữ chuyên nghiệp nhưng dễ hiểu
- Đưa ra con số cụ thể khi có thể
- Thêm emoji phù hợp để dễ đọc
- Độ dài: 800-1000 từ
- Định dạng Markdown chuẩn

Chỉ trả về nội dung báo cáo, không thêm giải thích hay text khác, không thêm icon và thực hiện format chuyên nghiệp.
PROMPT;

        return $prompt;
    }

    /**
     * Parse detailed report response from Gemini
     */
    private function parseDetailedReportResponse($response)
    {
        // Clean and format the response
        $report = trim($response);
        
        // Remove any markdown code blocks if present
        $report = preg_replace('/```markdown\n?/', '', $report);
        $report = preg_replace('/```\n?$/', '', $report);
        
        return $report;
    }

    /**
     * Generate fallback detailed report (template-based)
     */
    private function generateFallbackReport($weatherData)
    {
        $current = $weatherData['current_weather'];
        $anomaly = $weatherData['anomaly'];

        $report = <<<MARKDOWN
#  BÁO CÁO PHÂN TÍCH THỜI TIẾT CHI TIẾT

## 1.  TỔNG QUAN TÌNH HÌNH

Thời tiết hiện tại: **{$current['weather_description']}**

Nhiệt độ: **{$current['temperature']}°C**
Độ ẩm: **{$current['humidity']}%**
Tốc độ gió: **{$current['wind_speed']} km/h**

## 2.  PHÂN TÍCH CHI TIẾT

### Nhiệt độ
Nhiệt độ hiện tại là {$current['temperature']}°C, nằm trong khoảng bình thường cho mùa này.

### Độ Ẩm
Độ ẩm {$current['humidity']}% cho thấy không khí có mức độ ẩm trung bình.

### Gió
Tốc độ gió {$current['wind_speed']} km/h ở mức độ nhẹ.

## 3.  PHÁT HIỆN BẤT THƯỜNG

{$anomaly['message']}

## 4.  KHUYẾN NGHỊ HÀNH ĐỘNG

- Mặc quần áo phù hợp với nhiệt độ hiện tại
- Uống đủ nước trong ngày
- Theo dõi thời tiết thường xuyên

## 5.  DỰ BÁO

Vui lòng theo dõi các cập nhật thời tiết mới nhất.

## 6.  KẾT LUẬN

Tình hình thời tiết hiện tại ổn định. Hãy chú ý theo dõi các thay đổi.

---
*Báo cáo tự động được tạo bởi hệ thống*
MARKDOWN;

        return $report;
    }

    /**
     * Parse recommendation response from Gemini
     */
    private function parseRecommendationResponse($response)
    {
        // Clean up response
        $recommendation = trim($response);
        $recommendation = preg_replace('/^["\']+|["\']+$/', '', $recommendation);
        
        return $recommendation;
    }

    /**
     * Fallback anomaly detection (rule-based)
     */
    private function fallbackAnomalyDetection($currentWeather, $historicalData)
    {
        $currentTemp = $currentWeather['temperature_2m'];
        $avgTemp = array_sum($historicalData['temperature_2m_max']) / count($historicalData['temperature_2m_max']);
        $difference = $currentTemp - $avgTemp;

        $isAnomaly = abs($difference) > 5;
        
        $message = '';
        $severity = 'normal';
        
        if ($isAnomaly) {
            if ($difference > 5) {
                $message = "⚠️ Nhiệt độ hiện tại cao hơn " . abs(round($difference, 1)) . "°C so với trung bình 30 ngày qua.";
                $severity = 'warning';
            } else {
                $message = "❄️ Nhiệt độ hiện tại thấp hơn " . abs(round($difference, 1)) . "°C so với trung bình 30 ngày qua.";
                $severity = 'warning';
            }
        } else {
            $message = "✅ Nhiệt độ hiện tại trong khoảng bình thường.";
        }

        return [
            'is_anomaly' => $isAnomaly,
            'message' => $message,
            'severity' => $severity,
            'current_temp' => $currentTemp,
            'average_temp' => round($avgTemp, 1),
            'difference' => round($difference, 1)
        ];
    }

    /**
     * Fallback recommendation (rule-based)
     */
    private function fallbackRecommendation($currentWeather, $dailyForecast)
    {
        Log::info('🔧 Using fallback recommendation (rule-based, NO AI)', [
            'temp' => $currentWeather['temperature_2m'] ?? 'N/A',
            'uv_index' => $dailyForecast['uv_index_max'][0] ?? 'N/A',
            'weather_code' => $currentWeather['weather_code'] ?? 'N/A'
        ]);

        $temp = $currentWeather['temperature_2m'];
        $uvIndex = $dailyForecast['uv_index_max'][0] ?? 0;
        $weatherCode = $currentWeather['weather_code'];
        
        $recommendations = [];

        // Temperature-based
        if ($temp > 35) {
            $recommendations[] = "🌡️ Nhiệt độ rất cao! Hạn chế ra ngoài, uống nhiều nước và nghỉ ngơi ở nơi mát mẻ.";
        } elseif ($temp > 30) {
            $recommendations[] = "☀️ Trời nóng, nên mặc quần áo thoáng mát và uống đủ nước.";
        } elseif ($temp < 15) {
            $recommendations[] = "🧥 Trời lạnh, nên mặc áo ấm và giữ gìn sức khỏe.";
        }

        // UV-based
        if ($uvIndex >= 8) {
            $recommendations[] = "🕶️ Chỉ số UV cao! Bôi kem chống nắng, đội mũ và đeo kính râm.";
        } elseif ($uvIndex >= 6) {
            $recommendations[] = "🧴 Chỉ số UV khá cao, nên sử dụng kem chống nắng khi ra ngoài.";
        }

        // Weather-based
        if (in_array($weatherCode, [61, 63, 65, 80, 81, 82])) {
            $recommendations[] = "☔ Có mưa, nhớ mang theo ô hoặc áo mưa.";
        } elseif (in_array($weatherCode, [95, 96, 99])) {
            $recommendations[] = "⚡ Cảnh báo giông bão! Tránh ra ngoài nếu không cần thiết.";
        }

        if (empty($recommendations)) {
            $recommendations[] = "✨ Thời tiết thuận lợi, thích hợp cho các hoạt động ngoài trời!";
        }

        $result = implode(' ', $recommendations);
        
        Log::info('✅ Fallback recommendation generated', [
            'recommendation_length' => strlen($result),
            'recommendation' => $result
        ]);

        return $result;
    }

    /**
     * Get weather description from code
     */
    private function getWeatherDescription($code)
    {
        $descriptions = [
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
            80 => 'Mưa rào nhẹ',
            81 => 'Mưa rào vừa',
            82 => 'Mưa rào dữ dội',
            95 => 'Giông bão',
            96 => 'Giông có mưa đá nhẹ',
            99 => 'Giông có mưa đá nặng',
        ];

        return $descriptions[$code] ?? 'Không xác định';
    }
}
