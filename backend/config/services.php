<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'opencage' => [
        'key' => env('OPENCAGE_API_KEY'),
        'endpoint' => env('OPENCAGE_API_ENDPOINT', 'https://api.opencagedata.com/geocode/v1/json'),
    ],

    // Reverse geocoding cache TTL in seconds (default 24h)
    'reverse_geocode_cache_ttl' => env('REVERSE_GEOCODE_CACHE_TTL', 86400),

    // AccessTrade Affiliate Configuration
    'accesstrade' => [
        'id' => env('ACCESSTRADE_ID'),
    ],

];
