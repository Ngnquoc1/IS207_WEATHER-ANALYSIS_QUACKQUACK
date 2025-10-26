# Stories Feature Implementation

## Overview

The Stories feature allows admins to search for news articles from NewsAPI and curate them for display to customers on the weather dashboard.

## What Was Implemented

### Backend (Laravel)

#### 1. Database

- **Migration**: `2025_10_25_093115_create_stories_table.php`
- **Table**: `stories` with fields:
  - `id`, `title`, `description`, `source`, `url`, `image_url`
  - `author`, `published_at`, `category` (warning/info/normal)
  - `location`, `is_active`, `created_by`, `timestamps`

#### 2. Model

- **File**: `backend/app/Models/Story.php`
- Includes relationship to User model (creator)

#### 3. Controller

- **File**: `backend/app/Http/Controllers/StoryController.php`
- **Methods**:
  - `searchNews()` - Search NewsAPI by keyword
  - `createStory()` - Save selected article to database
  - `getStories()` - Get all active stories
  - `deleteStory()` - Delete a story

#### 4. Routes

- Added to `backend/routes/api.php`:
  - `GET /api/stories` - Get all stories (all users)
  - `GET /api/stories/search` - Search news (admin only)
  - `POST /api/stories` - Create story (admin only)
  - `DELETE /api/stories/{id}` - Delete story (admin only)

### Frontend (React)

#### 1. Service

- **File**: `frontend/src/services/newsService.js`
- Methods to interact with stories API

#### 2. Components

- **Stories.js** - Customer view displaying curated stories
  - Shows up to 3 featured stories
  - "View More" button opens modal with all stories
  - Color-coded by category (warning=red, info=blue, normal=gray)
- **StoryManagement.js** - Admin tool to search and curate stories
  - Search NewsAPI by keyword
  - View article previews
  - Add selected articles to stories

#### 3. Integration

- **DashboardPage.js** - Added Stories component below location banner
- **AdminPage.js** - Added StoryManagement component in admin section

## Setup Instructions

### 1. Get NewsAPI Key

1. Visit https://newsapi.org/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Update `backend/.env`:
   ```env
   NEWS_API_KEY=your-actual-api-key-here
   ```

### 2. Run Migration

```bash
cd backend
php artisan migrate
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Frontend
cd frontend
npm start
```

## How to Use

### For Admin

1. **Search for News**:

   - Go to Admin Dashboard
   - Scroll to "Manage Stories" section
   - Enter keywords (e.g., "thời tiết", "weather")
   - Click "Tìm kiếm"
   - View results

2. **Add a Story**:

   - Review articles in search results
   - Click "➕ Thêm" button on desired article
   - Story is added to database

3. **Manage Stories**:
   - Stories are displayed automatically to customers
   - To remove, you can add delete functionality later

### For Customer

1. **View Stories**:
   - Stories appear on Dashboard page
   - Shows up to 3 featured stories
   - Click on a story card to open article in new tab
   - Click "Xem Thêm Tin Tức" to see all stories

## API Endpoints

### Get Stories (Customer)

```http
GET /api/stories
Authorization: Bearer {token}
```

### Search News (Admin Only)

```http
GET /api/stories/search?keyword=weather&language=vi
Authorization: Bearer {admin_token}
```

### Create Story (Admin Only)

```http
POST /api/stories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Article Title",
  "description": "Article description",
  "url": "https://example.com/article",
  "image_url": "https://example.com/image.jpg",
  "author": "Author Name",
  "source": "Source Name",
  "published_at": "2024-10-25T10:00:00Z",
  "category": "normal",
  "location": "TP.HCM"
}
```

### Delete Story (Admin Only)

```http
DELETE /api/stories/{id}
Authorization: Bearer {admin_token}
```

## Design Features

### Story Cards

- **Warning** (Red `#dc3545`): Critical weather alerts
- **Info** (Blue `#0dcaf0`): General information
- **Normal** (Gray `#6c757d`): Regular news

### Badge

- "Vừa xong" badge on recent stories

### Update Time

- Shows current timestamp in Vietnamese format

## Notes

### NewsAPI Free Tier Limits

- **100 requests per day**
- Only works on localhost (development)
- For production, you need a paid plan

### Recommended Keywords

- Vietnamese: "thời tiết", "khí hậu", "cảnh báo", "bão"
- English: "weather", "climate", "forecast", "storm"

## Future Enhancements

1. **Story Categories**: Allow admins to set custom categories
2. **Priority**: Sort stories by importance
3. **Expiry**: Auto-archive old stories
4. **Analytics**: Track which stories are viewed most
5. **Bulk Import**: Import multiple stories at once
6. **Image Upload**: Allow custom images
7. **Draft Mode**: Save stories before publishing

## Troubleshooting

### No news articles found

- Check if NEWS_API_KEY is correct in `.env`
- Verify you have remaining API quota
- Try different keywords

### Stories not displaying

- Check database: `php artisan tinker` → `Story::all()`
- Verify migration ran: `php artisan migrate:status`
- Check browser console for errors

### Search not working

- Ensure you're logged in as admin
- Check network tab for API errors
- Verify backend server is running
