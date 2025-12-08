<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Product extends Model
{
    protected $connection = 'mongodb';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'image_url',
        'original_link',
        'weather_tags',
        'min_temp',
        'max_temp',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weather_tags' => 'array',
        'is_active' => 'boolean',
        'min_temp' => 'integer',
        'max_temp' => 'integer',
    ];

    /**
     * Generate AccessTrade deep link from original product URL
     * 
     * Uses the formula: https://go.isclix.com/deep_link/{AFFILIATE_ID}?url={encoded_url}
     * 
     * @return string
     */
    public function getAffiliateLinkAttribute(): string
    {
        $affiliateId = config('services.accesstrade.id');
        
        if (!$affiliateId) {
            \Log::warning('ACCESSTRADE_ID not configured in services.php');
            return $this->original_link; // Fallback to original link if not configured
        }
        
        // Decode first to handle pre-encoded URLs, then encode properly
        $decodedUrl = urldecode($this->original_link);
        $encodedUrl = urlencode($decodedUrl);
        
        return "https://go.isclix.com/deep_link/{$affiliateId}?url={$encodedUrl}";
    }
}
