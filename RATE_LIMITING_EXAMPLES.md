# Rate Limiting - Usage Examples

## Complete Implementation Examples

### Example 1: Basic API Route with Rate Limiting

```javascript
// app/api/items/route.js
import { withRateLimit, generalRateLimit } from '@/app/lib/rateLimiter';

async function getHandler(req) {
  // Your API logic
  const items = await fetchItems();
  return Response.json({ success: true, data: items });
}

// Export with rate limiting (100 requests / 15 minutes)
export const GET = withRateLimit(getHandler, generalRateLimit);
```

### Example 2: Authentication Route with Strict Limiting

```javascript
// app/api/login/route.js
import { withRateLimit, authRateLimit } from '@/app/lib/rateLimiter';

async function loginHandler(req) {
  const { email, password } = await req.json();
  
  // Validate credentials
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return Response.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  return Response.json({ success: true, data: user });
}

// Export with auth rate limiting (5 requests / 15 minutes)
export const POST = withRateLimit(loginHandler, authRateLimit);
```

### Example 3: Custom Rate Limit

```javascript
// app/api/newsletter/route.js
import { rateLimit, withRateLimit } from '@/app/lib/rateLimiter';

// Custom: 2 requests per hour
const newsletterLimit = rateLimit({
  maxRequests: 2,
  windowMs: 60 * 60 * 1000,
  message: 'You can only subscribe twice per hour.',
});

async function subscribeHandler(req) {
  const { email } = await req.json();
  await subscribeToNewsletter(email);
  return Response.json({ success: true });
}

export const POST = withRateLimit(subscribeHandler, newsletterLimit);
```

### Example 4: Different Limits for Different Methods

```javascript
// app/api/posts/route.js
import { withRateLimit, generalRateLimit, rateLimit } from '@/app/lib/rateLimiter';

// Stricter limit for POST
const createPostLimit = rateLimit({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many posts created. Please slow down.',
});

async function getHandler(req) {
  const posts = await fetchPosts();
  return Response.json({ success: true, data: posts });
}

async function postHandler(req) {
  const post = await req.json();
  const created = await createPost(post);
  return Response.json({ success: true, data: created }, { status: 201 });
}

// Different limits for different methods
export const GET = withRateLimit(getHandler, generalRateLimit); // 100/15min
export const POST = withRateLimit(postHandler, createPostLimit); // 10/15min
```

### Example 5: Admin Route with Higher Limits

```javascript
// app/api/admin/users/route.js
import { withRateLimit, adminRateLimit } from '@/app/lib/rateLimiter';

async function getHandler(req) {
  // Verify admin
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const users = await fetchAllUsers();
  return Response.json({ success: true, data: users });
}

// Admin routes get higher limits (200 requests / 15 minutes)
export const GET = withRateLimit(getHandler, adminRateLimit);
```

### Example 6: Upload Route with Strict Limits

```javascript
// app/api/upload/route.js
import { withRateLimit, uploadRateLimit } from '@/app/lib/rateLimiter';
import { v2 as cloudinary } from 'cloudinary';

async function uploadHandler(req) {
  const { image } = await req.json();
  
  const result = await cloudinary.uploader.upload(image, {
    folder: 'uploads'
  });
  
  return Response.json({ success: true, url: result.secure_url });
}

// Upload routes get strict limits (10 requests / 15 minutes)
export const POST = withRateLimit(uploadHandler, uploadRateLimit);
```

### Example 7: Dynamic Route with Rate Limiting

```javascript
// app/api/items/[id]/route.js
import { withRateLimit, generalRateLimit } from '@/app/lib/rateLimiter';

async function getHandler(req, context) {
  const { id } = await context.params;
  const item = await fetchItemById(id);
  
  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json({ success: true, data: item });
}

async function putHandler(req, context) {
  const { id } = await context.params;
  const updates = await req.json();
  
  const updated = await updateItem(id, updates);
  return Response.json({ success: true, data: updated });
}

async function deleteHandler(req, context) {
  const { id } = await context.params;
  await deleteItem(id);
  return Response.json({ success: true, message: 'Deleted' });
}

// All methods use general rate limiting
export const GET = withRateLimit(getHandler, generalRateLimit);
export const PUT = withRateLimit(putHandler, generalRateLimit);
export const DELETE = withRateLimit(deleteHandler, generalRateLimit);
```

## Client-Side Handling

### Example 8: React Component with Rate Limit Handling

```javascript
'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRetryAfter(null);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // Check rate limit headers
    const remaining = res.headers.get('X-RateLimit-Remaining');
    const limit = res.headers.get('X-RateLimit-Limit');

    if (res.status === 429) {
      const data = await res.json();
      setError(data.error);
      setRetryAfter(data.retryAfter);
      return;
    }

    if (remaining && parseInt(remaining) < 2) {
      console.warn(`Only ${remaining} login attempts remaining`);
    }

    // Handle success...
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger">
          {error}
          {retryAfter && <p>Please wait {retryAfter}</p>}
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### Example 9: Automatic Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, options);

    if (res.status !== 429) {
      return res;
    }

    // Rate limited - check retry-after header
    const retryAfter = res.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;

    console.log(`Rate limited. Retrying in ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  throw new Error('Max retries exceeded');
}

// Usage
try {
  const res = await fetchWithRetry('/api/items', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await res.json();
} catch (error) {
  console.error('Failed after retries:', error);
}
```

## Testing Examples

### Example 10: Test Rate Limiting

```javascript
// test/rateLimit.test.js
describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Test123!' })
      });
      
      expect(res.status).not.toBe(429);
    }
  });

  it('should block requests exceeding limit', async () => {
    // Make 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Test123!' })
      });
      
      if (i === 5) {
        expect(res.status).toBe(429);
        const data = await res.json();
        expect(data.error).toContain('Too many');
      }
    }
  });

  it('should include rate limit headers', async () => {
    const res = await fetch('http://localhost:3000/api/items');
    
    expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(res.headers.has('X-RateLimit-Remaining')).toBe(true);
    expect(res.headers.has('X-RateLimit-Reset')).toBe(true);
  });
});
```

## Advanced Examples

### Example 11: User-Based Rate Limiting (Authenticated)

```javascript
import { rateLimit } from '@/app/lib/rateLimiter';
import jwt from 'jsonwebtoken';

// Custom rate limiter that uses user ID instead of IP
function userBasedRateLimit(options = {}) {
  const limiter = rateLimit(options);
  
  return async function (req) {
    // Try to get user ID from token
    const token = req.cookies.get('token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Override IP with user ID for authenticated users
        req.headers.set('x-user-id', decoded.id);
      } catch (error) {
        // Invalid token, fall back to IP-based limiting
      }
    }
    
    return limiter(req);
  };
}

// Usage
const userLimit = userBasedRateLimit({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000
});

export const POST = withRateLimit(handler, userLimit);
```

### Example 12: Conditional Rate Limiting

```javascript
import { withRateLimit, generalRateLimit, strictRateLimit } from '@/app/lib/rateLimiter';

async function handler(req) {
  const { action } = await req.json();
  
  // Apply different logic based on action
  if (action === 'sensitive') {
    // Check if this would exceed strict limit
    // (This is a simplified example)
    return Response.json({ success: true });
  }
  
  return Response.json({ success: true });
}

// Use general limit, but you could implement conditional logic inside
export const POST = withRateLimit(handler, generalRateLimit);
```

### Example 13: Rate Limit Dashboard (Admin)

```javascript
// app/api/admin/rate-limits/route.js
import { getAllRateLimits, clearRateLimit } from '@/app/lib/rateLimiter';
import { withRateLimit, adminRateLimit } from '@/app/lib/rateLimiter';

async function getHandler(req) {
  // Verify admin access
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const limits = getAllRateLimits();
  return Response.json({ success: true, data: limits });
}

async function deleteHandler(req) {
  // Verify admin access
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { ip, url } = await req.json();
  clearRateLimit(ip, url);
  
  return Response.json({ success: true, message: 'Rate limit cleared' });
}

export const GET = withRateLimit(getHandler, adminRateLimit);
export const DELETE = withRateLimit(deleteHandler, adminRateLimit);
```

## Response Examples

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-04-17T12:15:00.000Z
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": "847 seconds"
}
```

**Headers:**
```
Status: 429 Too Many Requests
Retry-After: 847
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-04-17T12:15:00.000Z
```
