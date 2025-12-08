<?php

echo "Testing Affiliate Recommendations API\n";
echo "=====================================\n\n";

// Test cases
$tests = [
    [
        'name' => 'Rain at 25°C (Priority 1: Weather + Temp)',
        'url' => 'http://127.0.0.1:8000/api/recommendations?weather_main=Rain&current_temp=25&limit=3',
    ],
    [
        'name' => 'Clear/Sunny at 35°C (Hot weather)',
        'url' => 'http://127.0.0.1:8000/api/recommendations?weather_main=Clear&current_temp=35',
    ],
    [
        'name' => 'Clear at 10°C (Cold weather)',
        'url' => 'http://127.0.0.1:8000/api/recommendations?weather_main=Clear&current_temp=10',
    ],
    [
        'name' => 'Rain at 5°C (Priority 2: Weather only fallback)',
        'url' => 'http://127.0.0.1:8000/api/recommendations?weather_main=Rain&current_temp=5',
    ],
];

foreach ($tests as $test) {
    echo "Test: {$test['name']}\n";
    echo "URL: {$test['url']}\n";
    
    $response = @file_get_contents($test['url']);
    
    if ($response === false) {
        echo "❌ Connection failed\n\n";
        continue;
    }
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "✅ Success! Found {$data['count']} recommendations\n";
        foreach ($data['recommendations'] as $product) {
            echo "  - {$product['name']}\n";
            echo "    Tags: " . implode(', ', $product['weather_tags']) . "\n";
            echo "    Temp: {$product['temp_range']['min']}°C - {$product['temp_range']['max']}°C\n";
            echo "    Link: {$product['affiliate_link']}\n";
        }
    } else {
        echo "❌ Failed: " . json_encode($data) . "\n";
    }
    
    echo "\n" . str_repeat("-", 70) . "\n\n";
}
