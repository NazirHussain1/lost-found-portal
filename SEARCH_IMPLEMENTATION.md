# MongoDB Search Implementation

## Overview

Advanced server-side search system with MongoDB text indexing, multiple filters, and pagination for the Lost & Found Portal.

## ✅ Implementation Status

**Status:** COMPLETE
**Build:** Ready for testing
**Features:** Text search, filters, pagination, sorting
**Performance:** Optimized with indexes

## 📁 Files Created/Modified

### New Files

1. **`app/api/items/search/route.js`** - Main search API endpoint
   - Text search across title, description, location
   - Category and type filters
   - Date range filtering
   - Pagination (20 items per page, max 100)
   - Multiple sort options
   - Rate limited (100 requests/15min)

2. **`app/lib/setupIndexes.js`** - Index management utilities
   - `setupIndexes()` - Create all indexes
   - `recreateIndexes()` - Drop and recreate indexes
   - `checkTextIndex()` - Verify text index exists
   - `getIndexStats()` - Get collection statistics

3. **`app/api/admin/setup-indexes/route.js`** - Admin endpoint
   - Setup indexes via API
   - Admin-only access
   - Returns index statistics

4. **`app/lib/validations/search.js`** - Search validation schemas
   - Query parameter validation
   - Advanced search filters
   - Autocomplete schema

### Modified Files

1. **`app/models/items.js`** - Added indexes and timestamps
   - Text index on title, description, location (weighted)
   - Compound indexes for filtering
   - Timestamps (createdAt, updatedAt)

## 🔍 Search Features

### 1. Text Search

Searches across three fields with different weights:
- **Title** (weight: 10) - Highest priority
- **Description** (weight: 5) - Medium priority
- **Location** (weight: 3) - Lower priority

```javascript
// Example: Search for "phone"
GET /api/items/search?q=phone
```

### 2. Category Filter

Filter by item category:
- electronics
- stationary
- documents
- jewelry
- clothing
- keys
- bags
- other

```javascript
GET /api/items/search?q=phone&category=electronics
```

### 3. Type Filter

Filter by item type:
- lost
- found
- resolved

```javascript
GET /api/items/search?q=phone&type=lost
```

### 4. Date Range Filter

Filter items by date:

```javascript
// Items from specific date
GET /api/items/search?dateFrom=2026-04-01

// Items within date range
GET /api/items/search?dateFrom=2026-04-01&dateTo=2026-04-17
```

### 5. Pagination

Default: 20 items per page, Maximum: 100 items per page

```javascript
// Page 1 (default)
GET /api/items/search?q=phone&page=1

// Page 2 with 50 items
GET /api/items/search?q=phone&page=2&limit=50
```

### 6. Sorting

Sort by:
- **relevance** (default for text search) - Text score
- **date** - Item date
- **createdAt** - Creation timestamp

Sort order:
- **desc** (default) - Descending
- **asc** - Ascending

```javascript
// Sort by date, newest first
GET /api/items/search?sortBy=date&sortOrder=desc

// Sort by relevance (text score)
GET /api/items/search?q=phone&sortBy=relevance
```

## 📊 MongoDB Indexes

### Text Index

```javascript
{
  title: 'text',
  description: 'text',
  location: 'text'
}

// Weights
{
  title: 10,      // Highest priority
  description: 5,  // Medium priority
  location: 3      // Lower priority
}
```

### Compound Indexes

```javascript
// For category + type filtering
{ category: 1, type: 1 }

// For date sorting
{ date: -1 }

// For creation date sorting
{ createdAt: -1 }

// For user filtering
{ user: 1 }
```

## 🚀 API Endpoints

### 1. Search Items

**Endpoint:** `GET /api/items/search`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | - | Search query (max 200 chars) |
| `category` | string | No | all | Filter by category |
| `type` | string | No | all | Filter by type (lost/found/resolved) |
| `dateFrom` | string | No | - | Start date (ISO format) |
| `dateTo` | string | No | - | End date (ISO format) |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max 100) |
| `sortBy` | string | No | relevance | Sort field |
| `sortOrder` | string | No | desc | Sort order (asc/desc) |

**Example Requests:**

```bash
# Basic search
GET /api/items/search?q=phone

# Search with category filter
GET /api/items/search?q=wallet&category=bags

# Search with type filter
GET /api/items/search?q=keys&type=lost

# Search with date range
GET /api/items/search?dateFrom=2026-04-01&dateTo=2026-04-17

# Search with pagination
GET /api/items/search?q=phone&page=2&limit=50

# Search with sorting
GET /api/items/search?q=phone&sortBy=date&sortOrder=desc

# Combined filters
GET /api/items/search?q=phone&category=electronics&type=lost&page=1&limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Lost iPhone 14 Pro",
        "description": "Black iPhone 14 Pro with blue case",
        "category": "electronics",
        "type": "lost",
        "location": "Main Library, 2nd Floor",
        "date": "2026-04-15T10:30:00.000Z",
        "imageUrl": "https://cloudinary.com/image.jpg",
        "createdAt": "2026-04-15T12:00:00.000Z",
        "updatedAt": "2026-04-15T12:00:00.000Z",
        "score": 5.5,
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "03001234567"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "query": "phone",
      "category": "electronics",
      "type": "lost",
      "dateFrom": null,
      "dateTo": null,
      "sortBy": "relevance",
      "sortOrder": "desc"
    }
  }
}
```

### 2. Setup Indexes (Admin Only)

**Endpoint:** `POST /api/admin/setup-indexes`

**Authentication:** Admin JWT token required

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Indexes setup successfully",
  "data": {
    "stats": {
      "items": {
        "count": 150,
        "size": 245760,
        "indexes": 6,
        "indexSize": 98304
      },
      "users": {
        "count": 50,
        "size": 81920,
        "indexes": 3,
        "indexSize": 32768
      }
    }
  }
}
```

## 💻 Usage Examples

### Client-Side Implementation

```javascript
'use client';

import { useState, useEffect } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        category,
        type,
        page: page.toString(),
        limit: '20'
      });

      const res = await fetch(`/api/items/search?${params}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.data.items);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [page]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items..."
      />
      
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="bags">Bags</option>
        {/* ... */}
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="all">All Types</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Results */}
      <div>
        {results.map(item => (
          <div key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{item.category}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div>
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Server-Side Usage

```javascript
// In a server component or API route
import { connectDB } from '@/app/lib/mongodb';
import Item from '@/app/models/items';

export async function searchItems(query, filters = {}) {
  await connectDB();

  const filter = {};

  // Text search
  if (query) {
    filter.$text = { $search: query };
  }

  // Apply filters
  if (filters.category) {
    filter.category = filters.category;
  }

  if (filters.type) {
    filter.type = filters.type;
  }

  // Execute search
  const items = await Item.find(filter)
    .populate('user', 'name email phone')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  return items;
}
```

## 🧪 Testing

### Test Search API

```bash
# 1. Basic search
curl "http://localhost:3000/api/items/search?q=phone"

# 2. Search with category
curl "http://localhost:3000/api/items/search?q=wallet&category=bags"

# 3. Search with type filter
curl "http://localhost:3000/api/items/search?q=keys&type=lost"

# 4. Search with date range
curl "http://localhost:3000/api/items/search?dateFrom=2026-04-01&dateTo=2026-04-17"

# 5. Search with pagination
curl "http://localhost:3000/api/items/search?q=phone&page=2&limit=50"

# 6. Combined search
curl "http://localhost:3000/api/items/search?q=phone&category=electronics&type=lost&page=1"
```

### Setup Indexes (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/setup-indexes \
  -H "Cookie: token=YOUR_ADMIN_JWT_TOKEN"
```

### Test Search Performance

```javascript
// Create test script
import { connectDB } from './app/lib/mongodb';
import Item from './app/models/items';

async function testSearch() {
  await connectDB();

  console.time('Text Search');
  const results = await Item.find({
    $text: { $search: 'phone' }
  }).limit(20);
  console.timeEnd('Text Search');

  console.log(`Found ${results.length} items`);
}

testSearch();
```

## 📈 Performance Optimization

### Index Statistics

```javascript
// Check index usage
db.items.aggregate([
  { $indexStats: {} }
]);

// Explain query
db.items.find({
  $text: { $search: 'phone' }
}).explain('executionStats');
```

### Query Optimization Tips

1. **Use Text Index** - Always use text search for keyword queries
2. **Limit Results** - Use pagination to limit results
3. **Project Fields** - Only return necessary fields
4. **Use Compound Indexes** - For multiple filter combinations
5. **Cache Results** - Cache frequent searches (Redis)

## 🔧 Maintenance

### Rebuild Indexes

```javascript
import { recreateIndexes } from '@/app/lib/setupIndexes';

// Drop and recreate all indexes
await recreateIndexes();
```

### Monitor Index Size

```javascript
import { getIndexStats } from '@/app/lib/setupIndexes';

const stats = await getIndexStats();
console.log('Index size:', stats.items.indexSize);
```

### Update Text Index Weights

```javascript
// In items model
ItemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text'
}, {
  weights: {
    title: 15,      // Increase title weight
    description: 5,
    location: 2     // Decrease location weight
  }
});
```

## 🚀 Production Considerations

### 1. Use MongoDB Atlas Search

For advanced features:
- Fuzzy matching
- Synonyms
- Autocomplete
- Faceted search
- Highlighting

### 2. Implement Caching

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache search results
const cacheKey = `search:${query}:${category}:${page}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// Execute search and cache
const results = await searchItems(query);
await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min cache
```

### 3. Add Search Analytics

```javascript
// Track search queries
await SearchLog.create({
  query,
  filters,
  resultsCount,
  userId,
  timestamp: new Date()
});
```

### 4. Implement Autocomplete

```javascript
// Autocomplete endpoint
GET /api/items/autocomplete?q=pho

// Response
{
  "suggestions": [
    "phone",
    "phone case",
    "phone charger"
  ]
}
```

## ✅ Checklist

- [x] Text index created on items collection
- [x] Compound indexes for filtering
- [x] Search API endpoint created
- [x] Pagination implemented (20 items/page)
- [x] Category filter
- [x] Type filter
- [x] Date range filter
- [x] Sorting options
- [x] Rate limiting applied
- [x] Validation schemas
- [x] Index management utilities
- [x] Admin setup endpoint
- [x] Documentation created
- [x] Error handling

## 🎉 Summary

Advanced MongoDB search system is fully implemented with:

- Text search across title, description, location (weighted)
- Multiple filters (category, type, date range)
- Pagination (20 items per page, max 100)
- Sorting options (relevance, date, createdAt)
- Optimized indexes for performance
- Rate limiting protection
- Comprehensive validation
- Admin tools for index management

**Next Steps:**
1. Run index setup: `POST /api/admin/setup-indexes`
2. Test search functionality
3. Monitor performance
4. Consider caching for production
