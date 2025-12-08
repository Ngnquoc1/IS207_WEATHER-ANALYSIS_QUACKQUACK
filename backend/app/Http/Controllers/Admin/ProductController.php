<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a paginated listing of products with optional filters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 10);
            $query = Product::query();

            // 1. TÌM KIẾM (Search) - Áp dụng cho name và description
            if ($request->filled('search')) {
                $search = $request->search;
                // Tạo Regex không phân biệt hoa thường ('i')
                // preg_quote giúp xử lý các ký tự đặc biệt nếu có
                $regex = new \MongoDB\BSON\Regex($search, 'i');
                
                $query->where(function($q) use ($regex) {
                    $q->where('name', 'regexp', $regex)
                    ->orWhere('description', 'regexp', $regex);
                });
            }

            // 2. LỌC WEATHER TAGS (Quan trọng: Xử lý chuỗi JSON)
            // Dữ liệu trong DB là chuỗi: "["clouds","fog"]"
            // Nên ta phải tìm chuỗi "clouds" nằm trong đó.
            if ($request->filled('weather_tag')) {
                $tag = $request->weather_tag;
                
                // Tìm chính xác từ khóa nằm trong ngoặc kép để tránh nhầm lẫn
                // Ví dụ: tìm "rain" thì regex sẽ là /"rain"/i
                // Điều này tránh tìm "rain" mà ra "rainbow"
                $tagRegex = new \MongoDB\BSON\Regex('"' . preg_quote($tag) . '"', 'i');
                
                $query->where('weather_tags', 'regexp', $tagRegex);
            }

            // 3. LỌC TRẠNG THÁI (Boolean)
            if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
                // Chuyển đổi mọi loại input (string "true", "1", 1...) về boolean chuẩn
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
                $query->where('is_active', $isActive);
            }

            // Sắp xếp và Phân trang
            $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform dữ liệu để thêm affiliate_link
            $products->getCollection()->transform(function ($product) {
                // Xử lý weather_tags để trả về Array chuẩn cho Frontend
                // Nếu trong DB là chuỗi, ta decode nó ra.
                $tags = $product->weather_tags;
                if (is_string($tags)) {
                    $tags = json_decode($tags, true) ?? []; 
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image_url' => $product->image_url,
                    'original_link' => $product->original_link,
                    'affiliate_link' => $product->affiliate_link,
                    'weather_tags' => $tags, // Trả về mảng chuẩn
                    'min_temp' => $product->min_temp,
                    'max_temp' => $product->max_temp,
                    'is_active' => $product->is_active,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'products' => [
                    'data' => $products->items(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created product in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'image_url' => 'required|url|max:500',
            'original_link' => 'required|url|max:500',
            'weather_tags' => 'required|array|min:1',
            'weather_tags.*' => 'string|in:rain,drizzle,thunderstorm,clear,sunny,clouds,fog,snow',
            'min_temp' => 'nullable|integer|min:-50|max:60',
            'max_temp' => 'nullable|integer|min:-50|max:60',
            'is_active' => 'boolean'
        ]);
        
        // Custom validation: max_temp must be >= min_temp
        $validator->after(function ($validator) use ($request) {
            if ($request->filled('min_temp') && $request->filled('max_temp')) {
                if ($request->max_temp < $request->min_temp) {
                    $validator->errors()->add('max_temp', 'Max temperature must be greater than or equal to min temperature.');
                }
            }
        });
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'image_url' => $request->image_url,
                'original_link' => $request->original_link,
                'weather_tags' => $request->weather_tags,
                'min_temp' => $request->min_temp,
                'max_temp' => $request->max_temp,
                'is_active' => $request->input('is_active', true),
            ]);
            
            Log::info('Product created', ['product_id' => $product->id, 'name' => $product->name]);
            
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image_url' => $product->image_url,
                    'original_link' => $product->original_link,
                    'affiliate_link' => $product->affiliate_link,
                    'weather_tags' => $product->weather_tags,
                    'min_temp' => $product->min_temp,
                    'max_temp' => $product->max_temp,
                    'is_active' => $product->is_active,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ]
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $product = Product::find($id);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image_url' => $product->image_url,
                    'original_link' => $product->original_link,
                    'affiliate_link' => $product->affiliate_link,
                    'weather_tags' => $product->weather_tags,
                    'min_temp' => $product->min_temp,
                    'max_temp' => $product->max_temp,
                    'is_active' => $product->is_active,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified product in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::find($id);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }
            
            // Validation - all fields optional for update
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:1000',
                'image_url' => 'sometimes|url|max:500',
                'original_link' => 'sometimes|url|max:500',
                'weather_tags' => 'sometimes|array|min:1',
                'weather_tags.*' => 'string|in:rain,drizzle,thunderstorm,clear,sunny,clouds,fog,snow',
                'min_temp' => 'nullable|integer|min:-50|max:60',
                'max_temp' => 'nullable|integer|min:-50|max:60',
                'is_active' => 'boolean'
            ]);
            
            // Custom validation: max_temp must be >= min_temp
            $validator->after(function ($validator) use ($request, $product) {
                $minTemp = $request->filled('min_temp') ? $request->min_temp : $product->min_temp;
                $maxTemp = $request->filled('max_temp') ? $request->max_temp : $product->max_temp;
                
                if ($minTemp !== null && $maxTemp !== null && $maxTemp < $minTemp) {
                    $validator->errors()->add('max_temp', 'Max temperature must be greater than or equal to min temperature.');
                }
            });
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Update only provided fields
            if ($request->has('name')) $product->name = $request->name;
            if ($request->has('description')) $product->description = $request->description;
            if ($request->has('image_url')) $product->image_url = $request->image_url;
            if ($request->has('original_link')) $product->original_link = $request->original_link;
            if ($request->has('weather_tags')) $product->weather_tags = $request->weather_tags;
            if ($request->has('min_temp')) $product->min_temp = $request->min_temp;
            if ($request->has('max_temp')) $product->max_temp = $request->max_temp;
            if ($request->has('is_active')) $product->is_active = $request->is_active;
            
            $product->save();
            
            Log::info('Product updated', ['product_id' => $product->id, 'name' => $product->name]);
            
            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image_url' => $product->image_url,
                    'original_link' => $product->original_link,
                    'affiliate_link' => $product->affiliate_link,
                    'weather_tags' => $product->weather_tags,
                    'min_temp' => $product->min_temp,
                    'max_temp' => $product->max_temp,
                    'is_active' => $product->is_active,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified product from the database.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $product = Product::find($id);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }
            
            $productName = $product->name;
            $product->delete();
            
            Log::info('Product deleted', ['product_id' => $id, 'name' => $productName]);
            
            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Toggle the is_active status of the specified product.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleActive(string $id): JsonResponse
    {
        try {
            $product = Product::find($id);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }
            
            $product->is_active = !$product->is_active;
            $product->save();
            
            Log::info('Product status toggled', [
                'product_id' => $id,
                'name' => $product->name,
                'is_active' => $product->is_active
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Product status updated',
                'is_active' => $product->is_active
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error toggling product status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle product status',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
