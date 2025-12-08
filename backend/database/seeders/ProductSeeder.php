<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Seeds 5 products for different weather conditions:
     * - Rain protection (moderate temp)
     * - Sun protection (hot weather)
     * - Cold weather protection
     * - Universal umbrella (no temp restriction)
     * - Cloudy day accessories
     */
    public function run(): void
    {
        $products = [
            // 1. Rain Protection - Moderate Temperature
            [
                'name' => 'Áo Mưa Poncho Dày Dặn',
                'description' => 'Áo mưa poncho cao cấp, chống thấm tuyệt đối, có mũ trùm đầu. Phù hợp cho mùa mưa nhiệt đới.',
                'image_url' => 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=400',
                'original_link' => 'https://shopee.vn/%C3%81o-M%C6%B0a-Poncho-3-Trong-1-%C4%90a-N%C4%83ng-Ch%E1%BB%91ng-N%C6%B0%E1%BB%9Bc-%E2%80%93-K%C3%A8m-M%C5%A9-Tr%C3%B9m-D%C3%B9ng-L%C3%A0m-Ch%C4%83n-D%C3%A3-Ngo%E1%BA%A1i-T%E1%BA%A5m-Che-N%E1%BA%AFng-%E2%98%94-i.1516952957.44308158974',
                'weather_tags' => ['rain', 'drizzle', 'thunderstorm'],
                'min_temp' => 15,
                'max_temp' => 35,
                'is_active' => true,
            ],

            // 2. Sun Protection - Hot Weather
            [
                'name' => 'Kem Chống Nắng Biore UV SPF 50+',
                'description' => 'Kem chống nắng Biore Aqua Rich Watery Essence SPF 50+ PA++++, bảo vệ da khỏi tia UV, thấm nhanh không nhờn dính.',
                'image_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
                'original_link' => 'https://shopee.vn/Kem-Chống-Nắng-Biore-UV-Aqua-Rich-Watery-Essence-SPF50-PA-i.234567890.876543210',
                'weather_tags' => ['clear', 'sunny'],
                'min_temp' => 30,
                'max_temp' => 45,
                'is_active' => true,
            ],

            // 3. Cold Weather Protection
            [
                'name' => 'Áo Khoác Phao Lông Vũ Uniqlo',
                'description' => 'Áo khoác phao lông vũ siêu nhẹ, giữ ấm tốt, thiết kế gọn nhẹ dễ gấp. Thích hợp cho thời tiết lạnh.',
                'image_url' => 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
                'original_link' => 'https://shopee.vn/Áo-Khoác-Phao-Lông-Vũ-Siêu-Nhẹ-Uniqlo-Hàn-Quốc-i.345678901.765432109',
                'weather_tags' => ['clear', 'clouds', 'snow'],
                'min_temp' => -10,
                'max_temp' => 15,
                'is_active' => true,
            ],

            // 4. Universal Umbrella - No Temperature Restriction
            [
                'name' => 'Ô Dù Tự Động Gấp Gọn 2 Chiều',
                'description' => 'Ô dù tự động mở/đóng, chống tia UV, chống mưa, thiết kế nhỏ gọn tiện lợi. Phù hợp mọi thời tiết.',
                'image_url' => 'https://images.unsplash.com/photo-1608889825146-fc0b5174832a?w=400',
                'original_link' => 'https://shopee.vn/Ô-Dù-Tự-Động-Gấp-Gọn-Chống-Tia-UV-Chống-Mưa-i.456789012.654321098',
                'weather_tags' => ['rain', 'drizzle', 'sunny'],
                'min_temp' => null, // No temperature restriction
                'max_temp' => null,
                'is_active' => true,
            ],

            // 5. Cloudy Day Accessories
            [
                'name' => 'Kính Mát Rayban Chống UV',
                'description' => 'Kính râm thời trang Rayban Aviator, chống tia UV 100%, phân cực, bảo vệ mắt trong điều kiện ánh sáng mạnh.',
                'image_url' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
                'original_link' => 'https://shopee.vn/M%E1%BA%AFt-K%C3%ADnh-RAY-BAN-RB4260D-601-1-K%C3%ADnh-m%C3%A1t-i.567113617.14434938937?extraParams=%7B%22display_model_id%22%3A141645442360%7D',
                'weather_tags' => ['clouds', 'clear'],
                'min_temp' => 20,
                'max_temp' => 38,
                'is_active' => true,
            ],
        ];

        // Insert products into database
        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('✅ Seeded 5 products successfully!');
        $this->command->table(
            ['ID', 'Product Name', 'Weather Tags', 'Temp Range'],
            Product::all()->map(function ($p) {
                return [
                    $p->id,
                    $p->name,
                    implode(', ', $p->weather_tags),
                    $p->min_temp && $p->max_temp 
                        ? "{$p->min_temp}°C - {$p->max_temp}°C" 
                        : 'No restriction',
                ];
            })
        );
    }
}
