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
            'is_active' => $request->is_active ?? true, // Default to active
            'is_hot' => $request->is_hot ?? false, // Default to not hot
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
        $filter = $request->get('filter'); // 'hot', 'warning', 'info', 'normal', null
        
        $query = Story::where('is_active', true);
        
        // Apply filter
        if ($filter === 'hot') {
            $query->where('is_hot', true);
        } elseif (in_array($filter, ['warning', 'info', 'normal'])) {
            $query->where('category', $filter);
        }
        // If filter is null, show all stories
        
        $stories = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
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
            'hot_count' => Story::where('is_active', true)->where('is_hot', true)->count(),
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
     * Check which stories already exist in database
     */
    public function checkStoriesExist(Request $request)
    {
        $request->validate([
            'urls' => 'required|array',
            'urls.*' => 'required|url'
        ]);

        $urls = $request->urls;
        
        // Get existing URLs from database
        $existingUrls = Story::whereIn('url', $urls)
            ->pluck('url')
            ->toArray();
        
        return response()->json([
            'success' => true,
            'existing_urls' => $existingUrls
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

    /**
     * Update story hot status
     */
    public function updateStoryStatus(Request $request, $id)
    {
        $request->validate([
            'is_hot' => 'required|boolean',
        ]);

        $story = Story::findOrFail($id);
        $story->is_hot = $request->is_hot;
        $story->save();

        return response()->json([
            'success' => true,
            'message' => 'Story hot status updated successfully',
            'story' => $story
        ]);
    }

    /**
     * Update story details (is_hot and category)
     */
    public function updateStory(Request $request, $id)
    {
        $request->validate([
            'is_hot' => 'nullable|boolean',
            'category' => 'nullable|in:warning,info,normal',
        ]);

        $story = Story::findOrFail($id);
        
        if ($request->has('is_hot')) {
            $story->is_hot = $request->is_hot;
        }
        
        if ($request->has('category')) {
            $story->category = $request->category;
        }
        
        $story->save();

        return response()->json([
            'success' => true,
            'message' => 'Story updated successfully',
            'story' => $story
        ]);
    }

    /**
     * Get hot stories
     */
    public function getHotStories(Request $request)
    {
        $limit = $request->get('limit', 5);
        
        $stories = Story::where('is_active', true)
            ->where('is_hot', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'success' => true,
            'stories' => $stories
        ]);
    }
}
