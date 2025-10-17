<?php

require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;

try {
    $client = new Client(['timeout' => 10, 'verify' => false]);
    $response = $client->get('https://api.open-meteo.com/v1/forecast', [
        'query' => [
            'latitude' => 10.98,
            'longitude' => 106.75,
            'current' => 'temperature_2m'
        ]
    ]);
    
    echo "Success! Status: " . $response->getStatusCode() . "\n";
    echo "Body: " . substr($response->getBody(), 0, 200) . "...\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Type: " . get_class($e) . "\n";
}
