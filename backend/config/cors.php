<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost',
        'http://127.0.0.1',
        'http://frontend',
        'http://weather-frontend',
        'https://frontend.is207-weather-analysis-quackquack.orb.local',
        'https://localhost',
        '*', // Allow all origins for Docker setup
    ],
    
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.orb\.local$/',
        '/^http:\/\/.*\.orb\.local$/',
        '/^http:\/\/localhost.*$/',
        '/^http:\/\/127\.0\.0\.1.*$/',
    ],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 86400, // 24 hours
    
    'supports_credentials' => true,
];