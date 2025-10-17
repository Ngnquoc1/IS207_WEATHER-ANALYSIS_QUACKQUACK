<?php
/**
 * Test script for bulk weather API endpoint
 * Run this script to test the new bulk weather endpoint
 */

// Test the bulk weather API endpoint
$apiUrl = 'http://localhost:8000/api/weather/bulk';

echo "🧪 Testing Bulk Weather API Endpoint\n";
echo "=====================================\n";
echo "URL: $apiUrl\n\n";

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

echo "⏳ Sending request...\n";
$startTime = microtime(true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$endTime = microtime(true);
$duration = round(($endTime - $startTime) * 1000, 2);

curl_close($ch);

echo "📊 Response Details:\n";
echo "-------------------\n";
echo "HTTP Code: $httpCode\n";
echo "Response Time: {$duration}ms\n";
echo "Response Size: " . strlen($response) . " bytes\n\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ SUCCESS!\n";
        echo "Total Cities: " . $data['total_cities'] . "\n";
        echo "Timestamp: " . $data['timestamp'] . "\n\n";
        
        if (isset($data['errors']) && count($data['errors']) > 0) {
            echo "⚠️ Errors:\n";
            foreach ($data['errors'] as $error) {
                echo "  - " . $error['city'] . ": " . $error['error'] . "\n";
            }
            echo "\n";
        }
        
        echo "🌍 Sample Cities Data:\n";
        echo "---------------------\n";
        $sampleCities = array_slice($data['data'], 0, 5);
        foreach ($sampleCities as $city) {
            echo sprintf(
                "📍 %s, %s\n   🌡️ %s°C | 💧 %smm | 💨 %s km/h | %s\n\n",
                $city['name'],
                $city['country'],
                $city['temperature'],
                $city['precipitation'],
                $city['wind_speed'],
                $city['weather_description']
            );
        }
        
        // Performance analysis
        echo "📈 Performance Analysis:\n";
        echo "-----------------------\n";
        echo "Cities per second: " . round($data['total_cities'] / ($duration / 1000), 2) . "\n";
        echo "Average time per city: " . round($duration / $data['total_cities'], 2) . "ms\n";
        
        if ($duration < 5000) {
            echo "🚀 Excellent performance! (< 5 seconds)\n";
        } elseif ($duration < 10000) {
            echo "✅ Good performance! (< 10 seconds)\n";
        } else {
            echo "⚠️ Slow performance (> 10 seconds)\n";
        }
        
    } else {
        echo "❌ FAILED: Invalid response format\n";
        echo "Response: " . substr($response, 0, 500) . "...\n";
    }
} else {
    echo "❌ FAILED: HTTP Error $httpCode\n";
    echo "Response: " . substr($response, 0, 500) . "...\n";
}

echo "\n🔚 Test completed!\n";
?>
