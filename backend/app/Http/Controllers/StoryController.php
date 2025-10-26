<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class StoryController extends Controller
{
    /**
     * Search news from NewsAPI
     */
    public function searchNews(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string',
            'language' => 'nullable|string|in:vi,en',
        ]);

        try {
            $client = new Client();
            $apiKey = env('NEWS_API_KEY', 'your-api-key-here');
            
            $response = $client->get('https://newsapi.org/v2/everything', [
                'query' => [
                    'q' => $request->keyword,
                    'language' => $request->language ?? 'vi',
                    'sortBy' => 'publishedAt',
                    'pageSize' => 20,
                    'apiKey' => $apiKey
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            return response()->json([
                'success' => true,
                'articles' => $data['articles'] ?? []
            ]);

        } catch (\Exception $e) {
            Log::error('NewsAPI Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch news',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new story (save selected news article)
     */
    public function createStory(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'url' => 'required|url',
            'image_url' => 'nullable|url',
            'author' => 'nullable|string',
            'source' => 'nullable|string',
            'published_at' => 'nullable|date',
            'category' => 'nullable|in:warning,info,normal',
            'location' => 'nullable|string',
        ]);

        $story = Story::create([
            'title' => $request->title,
            'description' => $request->description,
            'url' => $request->url,
            'image_url' => $request->image_url,
            'author' => $request->author,
            'source' => $request->source,
            'published_at' => $request->published_at,
            'category' => $request->category ?? 'normal',
            'location' => $request->location,
            'created_by' => $request->user()->id
        ]);

        return response()->json([
            'success' => true,
            'story' => $story
        ], 201);
    }

    /**
     * Get all active stories with pagination
     */
    public function getStories(Request $request)
    {
        $perPage = $request->get('per_page', 10); // Default 10 items per page
        $page = $request->get('page', 1);
        
        $stories = Story::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'stories' => $stories->items(),
            'pagination' => [
                'current_page' => $stories->currentPage(),
                'per_page' => $stories->perPage(),
                'total' => $stories->total(),
                'last_page' => $stories->lastPage(),
                'from' => $stories->firstItem(),
                'to' => $stories->lastItem(),
            ]
        ]);
    }

    /**
     * Get story statistics
     */
    public function getStoryStatistics(Request $request)
    {
        $totalStories = Story::where('is_active', true)->count();
        
        $statistics = [
            'total' => $totalStories,
            'by_category' => [
                'warning' => Story::where('is_active', true)->where('category', 'warning')->count(),
                'info' => Story::where('is_active', true)->where('category', 'info')->count(),
                'normal' => Story::where('is_active', true)->where('category', 'normal')->count(),
            ]
        ];
        
        return response()->json([
            'success' => true,
            'statistics' => $statistics
        ]);
    }

    /**
     * Delete a story
     */
    public function deleteStory(Request $request, $id)
    {
        $story = Story::findOrFail($id);
        $story->delete();

        return response()->json([
            'success' => true,
            'message' => 'Story deleted successfully'
        ]);
    }
}
