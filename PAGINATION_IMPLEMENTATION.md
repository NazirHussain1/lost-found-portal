# Pagination Implementation Guide

## Overview

Complete pagination system implemented for Browse page and Admin dashboard with 20 items per page limit.

## ✅ Implementation Status

**Status:** COMPLETE
**Limit:** 20 items per page (configurable up to 100)
**Features:** Previous/Next buttons, page numbers, total count
**Performance:** Optimized with MongoDB skip() and limit()

## 📁 Files Created/Modified

### New Files

1. **`app/components/Pagination/Pagination.js`** - Reusable pagination component
   - Previous/Next buttons
   - Page number buttons with ellipsis
   - Current page indicator
   - Total items display
   - Responsive design

### Modified Files

1. **`app/api/items/route.js`** - Added pagination to GET endpoint
   - Page and limit query parameters
   - Total count calculation
   - Pagination metadata in response

2. **`app/api/admin/route.js`** - Added pagination to admin endpoint
   - Same pagination logic
   - Admin-specific filters

3. **`app/store/slices/itemsSlice.js`** - Updated Redux slice
   - Added pagination state
   - Updated fetchItems and fetchAdminItems
   - Page change action

4. **`app/components/Browse/browse.js`** - Added pagination UI
   - Integrated Pagination component
   - Page change handler
   - Scroll to top on page change

## 🔄 How It Works

### Backend (API)

```javascript
// Request
GET /api/items?page=2&limit=20&type=lost&category=electronics

// Response
{
  "items": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

### MongoDB Query

```javascript
// Calculate skip
const skip = (page - 1) * limit; // (2 - 1) * 20 = 20

// Get total count
const totalItems = await Item.countDocuments(filter);

// Get paginated items
const items = await Item.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)      // Skip first 20 items
  .limit(limit);   // Return next 20 items
```

### Frontend (React/Redux)

```javascript
// Dispatch with page parameter
dispatch(fetchItems({
  type: 'lost',
  category: 'electronics',
  page: 2,
  limit: 20
}));

// Handle page change
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Render pagination
<Pagination
  pagination={pagination}
  onPageChange={handlePageChange}
  loading={status === "loading"}
/>
```

## 📊 API Endpoints

### 1. Browse Items (GET /api/items)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max 100) |
| `type` | string | No | all | Filter by type |
| `category` | string | No | all | Filter by category |

**Example Requests:**

```bash
# Page 1 (default)
GET /api/items

# Page 2 with 20 items
GET /api/items?page=2

# Page 3 with 50 items
GET /api/items?page=3&limit=50

# With filters
GET /api/items?page=1&type=lost&category=electronics
```

**Response:**

```json
{
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Lost iPhone 14 Pro",
      "description": "Black iPhone with blue case",
      "category": "electronics",
      "type": "lost",
      "location": "Main Library",
      "date": "2026-04-15T10:30:00.000Z",
      "imageUrl": "https://cloudinary.com/image.jpg",
      "createdAt": "2026-04-15T12:00:00.000Z",
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
  }
}
```

### 2. Admin Dashboard (GET /api/admin)

**Query Parameters:**

Same as Browse Items endpoint, plus admin authentication required.

**Example Requests:**

```bash
# Admin page 1
GET /api/admin?page=1

# Admin page 2 with filters
GET /api/admin?page=2&type=resolved&category=electronics
```

## 💻 Usage Examples

### Example 1: Basic Pagination Component

```javascript
'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/app/components/Pagination/Pagination';

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?page=${page}&limit=20`);
      const data = await res.json();
      
      setItems(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Items Grid */}
      <div className="items-grid">
        {items.map(item => (
          <div key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}
```

### Example 2: Admin Dashboard with Pagination

```javascript
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminItems } from '@/app/store/slices/itemsSlice';
import Pagination from '@/app/components/Pagination/Pagination';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.list);
  const pagination = useSelector((state) => state.items.pagination);
  const status = useSelector((state) => state.items.status);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchAdminItems({
      page: currentPage,
      limit: 20,
      type: typeFilter
    }));
  }, [dispatch, currentPage, typeFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Filters */}
      <select value={typeFilter} onChange={(e) => {
        setTypeFilter(e.target.value);
        setCurrentPage(1); // Reset to page 1 when filter changes
      }}>
        <option value="all">All Types</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
        <option value="resolved">Resolved</option>
      </select>

      {/* Items Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.type}</td>
              <td>{item.category}</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={status === 'loading'}
      />
    </div>
  );
}
```

### Example 3: Custom Pagination Logic

```javascript
// Custom hook for pagination
function usePagination(fetchFunction, dependencies = []) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchFunction(currentPage);
        setData(result.items);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, ...dependencies]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (pagination?.hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  };

  return {
    data,
    pagination,
    loading,
    currentPage,
    goToPage,
    nextPage,
    prevPage
  };
}

// Usage
function MyComponent() {
  const {
    data: items,
    pagination,
    loading,
    goToPage
  } = usePagination(
    (page) => fetch(`/api/items?page=${page}`).then(r => r.json()),
    []
  );

  return (
    <div>
      {items.map(item => <div key={item._id}>{item.title}</div>)}
      <Pagination
        pagination={pagination}
        onPageChange={goToPage}
        loading={loading}
      />
    </div>
  );
}
```

## 🎨 Pagination Component Features

### Visual Features

- **Page Numbers:** Shows current page and nearby pages
- **Ellipsis:** Shows "..." for skipped pages
- **Previous/Next Buttons:** Navigate between pages
- **Active State:** Highlights current page
- **Disabled State:** Disables buttons when not applicable
- **Loading State:** Disables all buttons during loading
- **Responsive:** Adapts to mobile screens

### Props

```typescript
interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  onPageChange: (page: number) => void;
  loading?: boolean;
}
```

## 📈 Performance Optimization

### Backend Optimization

```javascript
// Use indexes for sorting
ItemSchema.index({ createdAt: -1 });

// Use lean() for faster queries
const items = await Item.find(filter)
  .lean()  // Returns plain JavaScript objects
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

// Use select() to limit fields
const items = await Item.find(filter)
  .select('title description category type location date imageUrl')
  .populate('user', 'name email phone')
  .skip(skip)
  .limit(limit);
```

### Frontend Optimization

```javascript
// Cache pages in Redux
const cachedPages = {};

const fetchItems = async (page) => {
  if (cachedPages[page]) {
    return cachedPages[page];
  }

  const data = await fetch(`/api/items?page=${page}`).then(r => r.json());
  cachedPages[page] = data;
  return data;
};

// Prefetch next page
useEffect(() => {
  if (pagination?.hasNextPage) {
    const nextPage = pagination.currentPage + 1;
    fetch(`/api/items?page=${nextPage}`);
  }
}, [pagination]);
```

## 🧪 Testing

### Test Pagination API

```bash
# Test page 1
curl "http://localhost:3000/api/items?page=1&limit=20"

# Test page 2
curl "http://localhost:3000/api/items?page=2&limit=20"

# Test with filters
curl "http://localhost:3000/api/items?page=1&type=lost&category=electronics"

# Test invalid page
curl "http://localhost:3000/api/items?page=0"  # Should return error

# Test large limit
curl "http://localhost:3000/api/items?page=1&limit=200"  # Should cap at 100
```

### Test Admin Pagination

```bash
curl "http://localhost:3000/api/admin?page=1" \
  -H "Cookie: token=YOUR_ADMIN_JWT_TOKEN"
```

## 🚀 Production Considerations

### 1. Caching

```javascript
// Use Redis for caching
import Redis from 'ioredis';
const redis = new Redis();

const cacheKey = `items:${page}:${type}:${category}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await fetchItems(page);
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min cache
```

### 2. Cursor-Based Pagination

For better performance with large datasets:

```javascript
// Instead of skip/limit, use cursor
const items = await Item.find({
  _id: { $gt: lastId }  // Get items after last ID
})
.limit(20)
.sort({ _id: 1 });
```

### 3. Virtual Scrolling

For infinite scroll:

```javascript
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const data = await fetch(`/api/items?page=${page}`).then(r => r.json());
  setItems([...items, ...data.items]);
  setPage(page + 1);
  setHasMore(data.pagination.hasNextPage);
};

// Use with IntersectionObserver or react-infinite-scroll-component
```

## ✅ Checklist

- [x] Backend pagination implemented (skip/limit)
- [x] API returns pagination metadata
- [x] Redux slice updated with pagination state
- [x] Reusable Pagination component created
- [x] Browse page integrated with pagination
- [x] Admin dashboard supports pagination
- [x] Previous/Next buttons working
- [x] Page numbers displayed correctly
- [x] Total items count shown
- [x] Scroll to top on page change
- [x] Loading states handled
- [x] Error handling implemented
- [x] Responsive design
- [x] Documentation created

## 🎉 Summary

Complete pagination system implemented with:

- 20 items per page (configurable up to 100)
- Previous/Next navigation buttons
- Page number buttons with ellipsis
- Total items and pages display
- MongoDB skip() and limit() optimization
- Redux state management
- Reusable Pagination component
- Responsive design
- Loading states
- Error handling

**Ready for production use!**
