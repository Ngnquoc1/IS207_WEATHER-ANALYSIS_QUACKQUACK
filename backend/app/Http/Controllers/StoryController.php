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
     * Get all active stories
     */
    public function getStories(Request $request)
    {
        $stories = Story::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'stories' => $stories
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
