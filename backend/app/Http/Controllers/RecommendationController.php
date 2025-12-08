<?php

namespace App\Http\Controllers;

use App\Services\AffiliateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecommendationController extends Controller
{
    protected AffiliateService $affiliateService;

    /**
     * Inject AffiliateService
     */
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
        try {
            // Validate request
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

            // Get recommendations
            $recommendations = $this->affiliateService->getRecommendations(
                $request->input('weather_main'),
                $request->integer('current_temp'),
                $request->integer('limit', 5)
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
