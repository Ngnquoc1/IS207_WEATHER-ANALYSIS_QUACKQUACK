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
    $weatherTag = strtolower($weatherMain); // 'rain'
    
    Log::info("--- START DEBUG RECOMMENDATION ---");
    Log::info("Input: Weather=$weatherTag, Temp=$currentTemp");

    // BƯỚC 1: Lấy TOÀN BỘ sản phẩm về (Bỏ qua mọi logic lọc của DB để tránh lỗi)
    $allProducts = Product::all();
    
    Log::info("Total products fetched: " . $allProducts->count());

    // BƯỚC 2: Lọc bằng PHP 
    // Lọc ra danh sách các sản phẩm có Tag thời tiết phù hợp và đang Active
    $candidates = $allProducts->filter(function ($p) use ($weatherTag) {
        // 1. Check Active (So sánh lỏng lẻo != để bắt cả 1, '1', true)
        if ($p->is_active != 1) return false;

        // 2. Check Tag: Đảm bảo weather_tags là mảng và có chứa tag
        $tags = $p->weather_tags ?? [];
        if (!is_array($tags)) return false;
        
        return in_array($weatherTag, $tags);
    });

    Log::info("Products matching tag '$weatherTag': " . $candidates->count());

    // BƯỚC 3: Phân loại Ưu tiên (Priority)
    
    // Priority 1: Khớp cả nhiệt độ
    $exactMatches = $candidates->filter(function ($p) use ($currentTemp) {
        // Nếu không set nhiệt độ (null) -> Coi như khớp
        if (is_null($p->min_temp) && is_null($p->max_temp)) return true;
        
        // Nếu có set -> Phải nằm trong khoảng
        return ($currentTemp >= $p->min_temp && $currentTemp <= $p->max_temp);
    });

    // Priority 2: Các sản phẩm còn lại (chỉ khớp tag, ko khớp nhiệt)
    
    $finalList = $exactMatches;

    if ($exactMatches->isEmpty()) {
        Log::info("Priority 1 empty. Fallback to Tag matches.");
        $finalList = $candidates;
    }

    // BƯỚC 4: Format và trả về
    // take($limit): Giới hạn số lượng
    // values(): Reset key mảng về 0,1,2... để React không lỗi
    return $this->formatRecommendations($finalList->take($limit))->values();
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
