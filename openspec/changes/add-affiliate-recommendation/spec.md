# Weather-Based Affiliate Recommendation Specification

## Overview

This feature adds intelligent product recommendations based on current weather conditions to generate affiliate revenue through AccessTrade's deep link system. The system analyzes temperature and weather conditions to suggest relevant products (raincoats, sunscreen, umbrellas, etc.) with automatic affiliate link generation.

**Key Principles:**
- Business logic isolated in Service layer (`AffiliateService`)
- Deep links generated server-side using Model accessors
- Two-tier matching: exact match (weather + temp) → fallback (weather only)
- No external API calls for link generation

---

## Database Schema

### Migration: `create_products_table`

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('image_url');
    $table->text('original_link'); // Original product URL
    $table->json('weather_tags'); // ['rain', 'sunny', 'cloudy', etc.]
    $table->integer('min_temp')->nullable(); // Min temperature for relevance
    $table->integer('max_temp')->nullable(); // Max temperature for relevance
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

**Field Descriptions:**
- `weather_tags`: JSON array of weather conditions (e.g., `["rain", "storm"]`)
- `min_temp`/`max_temp`: Temperature range for product relevance (nullable for weather-only products)
- `original_link`: Non-affiliate product URL (will be wrapped with deep link)

**Indexes:**
```php
$table->index('is_active');
$table->index(['min_temp', 'max_temp']);
```

---

## Backend Implementation

### 1. Model: `Product`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
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

    protected $casts = [
        'weather_tags' => 'array',
        'is_active' => 'boolean',
        'min_temp' => 'integer',
        'max_temp' => 'integer',
    ];

    /**
     * Generate AccessTrade deep link
     * 
     * @return string
     */
    public function getAffiliateLinkAttribute(): string
    {
        $affiliateId = config('services.accesstrade.id'); // Store in config/services.php
        $encodedUrl = urlencode($this->original_link);
        
        return "https://go.isclix.com/deep_link/{$affiliateId}?url={$encodedUrl}";
    }
}
```

**Configuration:**
```php
// config/services.php
'accesstrade' => [
    'id' => env('ACCESSTRADE_ID'),
],
```

---

### 2. Service: `AffiliateService`

```php
<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AffiliateService
{
    /**
     * Recommend products based on weather conditions
     * 
     * Priority 1: Match weather_tags AND temperature range
     * Priority 2: Match weather_tags only (fallback)
     * 
     * @param string $weatherMain Weather condition (e.g., 'Rain', 'Clear')
     * @param int $currentTemp Current temperature in Celsius
     * @param int $limit Maximum number of recommendations
     * @return Collection
     */
    public function getRecommendations(
        string $weatherMain,
        int $currentTemp,
        int $limit = 5
    ): Collection {
        $weatherTag = strtolower($weatherMain);
        
        Log::info('Fetching affiliate recommendations', [
            'weather' => $weatherTag,
            'temp' => $currentTemp,
            'limit' => $limit,
        ]);

        // Priority 1: Exact match (weather + temperature range)
        $exactMatches = Product::where('is_active', true)
            ->whereJsonContains('weather_tags', $weatherTag)
            ->where(function ($query) use ($currentTemp) {
                $query->where(function ($q) use ($currentTemp) {
                    // Match temperature range
                    $q->where('min_temp', '<=', $currentTemp)
                      ->where('max_temp', '>=', $currentTemp);
                })->orWhere(function ($q) {
                    // Or no temperature restriction (both null)
                    $q->whereNull('min_temp')
                      ->whereNull('max_temp');
                });
            })
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        if ($exactMatches->isNotEmpty()) {
            Log::info('Priority 1: Exact matches found', ['count' => $exactMatches->count()]);
            return $this->formatRecommendations($exactMatches);
        }

        // Priority 2: Fallback to weather-only match
        Log::info('Priority 1 empty, using Priority 2: Weather-only match');
        
        $weatherMatches = Product::where('is_active', true)
            ->whereJsonContains('weather_tags', $weatherTag)
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        return $this->formatRecommendations($weatherMatches);
    }

    /**
     * Format products with affiliate links
     * 
     * @param Collection $products
     * @return Collection
     */
    private function formatRecommendations(Collection $products): Collection
    {
        return $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'image_url' => $product->image_url,
                'affiliate_link' => $product->affiliate_link, // Uses accessor
                'weather_tags' => $product->weather_tags,
                'temp_range' => [
                    'min' => $product->min_temp,
                    'max' => $product->max_temp,
                ],
            ];
        });
    }

    /**
     * Get all active products (admin listing)
     * 
     * @return Collection
     */
    public function getAllProducts(): Collection
    {
        return Product::where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
```

---

### 3. Controller: `RecommendationController`

```php
<?php

namespace App\Http\Controllers;

use App\Services\AffiliateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecommendationController extends Controller
{
    private AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * Get product recommendations based on weather
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'weather_main' => 'required|string|max:50',
            'current_temp' => 'required|integer|min:-50|max:60',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 400);
        }

        try {
            $recommendations = $this->affiliateService->getRecommendations(
                weatherMain: $request->input('weather_main'),
                currentTemp: $request->input('current_temp'),
                limit: $request->input('limit', 5)
            );

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'count' => $recommendations->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recommendations',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
```

**Route Registration:**
```php
// routes/api.php
use App\Http\Controllers\RecommendationController;

Route::get('/recommendations', [RecommendationController::class, 'getRecommendations']);
```

---

## Seeding Strategy

### Database Seeder

```php
<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Rain Protection
            [
                'name' => 'Premium Waterproof Raincoat',
                'description' => 'Durable raincoat with hood, perfect for heavy rain',
                'image_url' => 'https://example.com/raincoat.jpg',
                'original_link' => 'https://shopee.vn/product-raincoat-123',
                'weather_tags' => ['rain', 'drizzle', 'thunderstorm'],
                'min_temp' => 15,
                'max_temp' => 35,
            ],
            
            // Sun Protection (High Temp)
            [
                'name' => 'SPF 50+ Sunscreen Lotion',
                'description' => 'Broad-spectrum UV protection for hot sunny days',
                'image_url' => 'https://example.com/sunscreen.jpg',
                'original_link' => 'https://lazada.vn/sunscreen-spf50-456',
                'weather_tags' => ['clear', 'sunny'],
                'min_temp' => 30,
                'max_temp' => 45,
            ],
            
            // Cold Weather
            [
                'name' => 'Winter Thermal Jacket',
                'description' => 'Insulated jacket for cold weather',
                'image_url' => 'https://example.com/jacket.jpg',
                'original_link' => 'https://tiki.vn/thermal-jacket-789',
                'weather_tags' => ['clear', 'clouds', 'snow'],
                'min_temp' => -10,
                'max_temp' => 15,
            ],
            
            // Universal Umbrella (Weather-only match)
            [
                'name' => 'Compact Travel Umbrella',
                'description' => 'Foldable umbrella for rain or sun',
                'image_url' => 'https://example.com/umbrella.jpg',
                'original_link' => 'https://sendo.vn/umbrella-compact-321',
                'weather_tags' => ['rain', 'drizzle', 'sunny'],
                'min_temp' => null, // No temp restriction
                'max_temp' => null,
            ],
            
            // Cloudy Day Item
            [
                'name' => 'UV-Blocking Sunglasses',
                'description' => 'Polarized sunglasses for bright cloudy days',
                'image_url' => 'https://example.com/sunglasses.jpg',
                'original_link' => 'https://shopee.vn/sunglasses-654',
                'weather_tags' => ['clouds', 'clear'],
                'min_temp' => 20,
                'max_temp' => 38,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
```

**Run Seeder:**
```bash
php artisan db:seed --class=ProductSeeder
```

---

## Testing Examples

### API Request Examples

**1. Rain + Moderate Temperature (25°C)**
```bash
GET /api/recommendations?weather_main=Rain&current_temp=25&limit=3
```
**Expected:** Premium Raincoat, Compact Umbrella

**2. Sunny + Hot (35°C)**
```bash
GET /api/recommendations?weather_main=Clear&current_temp=35
```
**Expected:** SPF 50+ Sunscreen, UV-Blocking Sunglasses

**3. Clear + Cold (10°C)**
```bash
GET /api/recommendations?weather_main=Clear&current_temp=10
```
**Expected:** Winter Thermal Jacket

**4. Edge Case: No Exact Match (Rain at 5°C)**
```bash
GET /api/recommendations?weather_main=Rain&current_temp=5
```
**Expected (Fallback):** Compact Umbrella (weather-only match)

---

## Frontend Integration Guide

### React Service Layer

```javascript
// src/services/affiliateService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchRecommendations = async (weatherMain, currentTemp, limit = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations`, {
            params: {
                weather_main: weatherMain,
                current_temp: currentTemp,
                limit: limit,
            },
            timeout: 10000,
        });
        return response.data;
    } catch (error) {
        console.error('Affiliate recommendations error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
    }
};
```

### React Component Example

```jsx
// src/components/ProductRecommendations.js
import React, { useState, useEffect } from 'react';
import { fetchRecommendations } from '../services/affiliateService';

const ProductRecommendations = ({ weatherData }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const data = await fetchRecommendations(
                    weatherData.current_weather.weather_main,
                    Math.round(weatherData.current_weather.temperature)
                );
                setRecommendations(data.recommendations);
            } catch (error) {
                console.error('Failed to load recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (weatherData) {
            loadRecommendations();
        }
    }, [weatherData]);

    if (loading) return <div>Loading recommendations...</div>;
    if (!recommendations.length) return null;

    return (
        <div className="product-recommendations">
            <h3>🛒 Sản phẩm gợi ý</h3>
            <div className="product-grid">
                {recommendations.map((product) => (
                    <div key={product.id} className="product-card">
                        <img src={product.image_url} alt={product.name} />
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <a 
                            href={product.affiliate_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="buy-button"
                        >
                            Mua ngay
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
```

### Integration in DashboardPage

```jsx
import ProductRecommendations from '../components/ProductRecommendations';

// Inside DashboardPage component, after weather data loads:
{weatherData && (
    <ProductRecommendations weatherData={weatherData} />
)}
```

---

## Configuration Checklist

### Backend Setup

1. **Environment Variables:**
   ```env
   ACCESSTRADE_ID=your_accesstrade_id_here
   ```

2. **Run Migrations:**
   ```bash
   php artisan migrate
   php artisan db:seed --class=ProductSeeder
   ```

3. **Cache Config:**
   ```bash
   php artisan config:cache
   ```

### Frontend Setup

1. Update `API_BASE_URL` in `affiliateService.js`
2. Add CSS for `.product-recommendations` and `.product-card`
3. Ensure weather data includes `weather_main` field

---

## Security Considerations

1. **Link Encoding:** All URLs properly encoded in `getAffiliateLinkAttribute`
2. **Input Validation:** Temperature range validated (-50°C to 60°C)
3. **Rate Limiting:** Consider adding rate limiting to `/recommendations` endpoint
4. **XSS Prevention:** Use `rel="noopener noreferrer"` on affiliate links

---

## Future Enhancements (Out of Scope)

- [ ] Click tracking analytics
- [ ] A/B testing for product ordering
- [ ] User preference learning (ML-based)
- [ ] Admin panel for product management
- [ ] Commission tracking integration

---

## Dependencies

- **Backend:** None (uses existing Laravel stack)
- **Frontend:** Axios (already in project)
- **External:** AccessTrade account with deep link access

---

## Approval Checklist

- [ ] Spec reviewed by backend team
- [ ] Affiliate ID obtained from AccessTrade
- [ ] Database schema approved
- [ ] Service layer pattern confirmed
- [ ] Frontend integration plan validated
