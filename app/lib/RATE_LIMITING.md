# Rate Limiting Implementation

## Overview

Custom IP-based rate limiting middleware for Next.js App Router that prevents API abuse and ensures fair resource usage.

## Features

- ✅ IP-based request tracking
- ✅ Configurable limits per route
- ✅ Automatic cleanup of expired entries
- ✅ Rate limit headers in responses
- ✅ Works with Next.js App Router
- ✅ No external dependencies
- ✅ Production-ready

## Rate Limit Configuration

### 1. Authentication Routes (5 requests / 15 minutes)
- `/api/signup`
- `/api/login`

### 2. General API Routes (100 requests / 15 minutes)
- `/api/items` (GET, POST)
- `/api/items/[id]` (PUT, DELETE)

### 3. Admin Routes (200 requests / 15 minutes)
- `/api/admin`
- `/api/admin/[id]`

### 4. Upload Routes (10 requests / 15 minutes)
- `/api/upload`

### 5. Strict Rate Limit (3 requests / hour)
- For sensitive operations (custom implementation)

## Usage

### Basic Usage

```javascript
import { withRateLimit, generalRateLimit } from '@/app/lib/rateLimiter';

async function handler(req) {
  // Your API logic here
  return Response.json({ success: true });
}

// Export with rate limiting
export const GET = withRateLimit(handler, generalRateLimit);
```

### Custom Rate Limit

```javascript
import { rateLimit, withRateLimit } from '@/app/lib/rateLimiter';

// Create custom rate limiter
const customLimit = rateLimit({
  maxRequests: 50,
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: 'Custom rate limit exceeded',
});

async function handler(req) {
  return Response.json({ success: true });
}

export const POST = withRateLimit(handler, customLimit);
```

### Multiple HTTP Methods

```javascript
import { withRateLimit, generalRateLimit, authRateLimit } from '@/app/lib/rateLimiter';

async function getHandler(req) {
  // GET logic
}

async function postHandler(req) {
  // POST logic
}

// Different limits for different methods
export const GET = withRateLimit(getHandler, generalRateLimit);
export const POST = withRateLimit(postHandler, authRateLimit);
```

## Response Format

### Success Response (with headers)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-04-17T12:15:00.000Z
Content-Type: application/json

{
  "success": true,
  "data": { ... }
}
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 847
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-04-17T12:15:00.000Z
Content-Type: application/json

{
  "success": false,
  "error": "Too many authentication attempts. Please try again later.",
  "retryAfter": "847 seconds"
}
```

## Rate Limit Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the time window |
| `X-RateLimit-Remaining` | Number of requests remaining in current window |
| `X-RateLimit-Reset` | ISO timestamp when the rate limit resets |
| `Retry-After` | Seconds until the rate limit resets (only on 429) |

## IP Detection

The rate limiter checks the following headers in order:

1. `x-forwarded-for` (proxy/load balancer)
2. `x-real-ip` (nginx)
3. `cf-connecting-ip` (Cloudflare)
4. Fallback to 'unknown'

## Predefined Rate Limiters

### generalRateLimit
```javascript
{
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests. Please try again later.'
}
```

### authRateLimit
```javascript
{
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
}
```

### adminRateLimit
```javascript
{
  maxRequests: 200,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many admin requests. Please try again later.'
}
```

### uploadRateLimit
```javascript
{
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many upload attempts. Please try again later.'
}
```

### strictRateLimit
```javascript
{
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Rate limit exceeded for this sensitive operation.'
}
```

## Admin Functions

### Get Rate Limit Status

```javascript
import { getRateLimitStatus } from '@/app/lib/rateLimiter';

const status = getRateLimitStatus('192.168.1.1', '/api/items');
console.log(status);
// {
//   count: 45,
//   resetTime: '2026-04-17T12:15:00.000Z',
//   isLimited: false
// }
```

### Clear Rate Limit

```javascript
import { clearRateLimit } from '@/app/lib/rateLimiter';

// Clear specific route for IP
clearRateLimit('192.168.1.1', '/api/items');

// Clear all routes for IP
clearRateLimit('192.168.1.1');
```

### Get All Rate Limits

```javascript
import { getAllRateLimits } from '@/app/lib/rateLimiter';

const allLimits = getAllRateLimits();
console.log(allLimits);
// [
//   {
//     ip: '192.168.1.1',
//     url: '/api/items',
//     count: 45,
//     resetTime: '2026-04-17T12:15:00.000Z',
//     isExpired: false
//   },
//   ...
// ]
```

## Testing

### Test with cURL

```bash
# Test general API (100 requests allowed)
for i in {1..105}; do
  curl -X GET http://localhost:3000/api/items
  echo "Request $i"
done

# Test auth API (5 requests allowed)
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}'
  echo "Request $i"
done
```

### Test with JavaScript

```javascript
async function testRateLimit() {
  for (let i = 1; i <= 10; i++) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!'
      })
    });
    
    const data = await res.json();
    const remaining = res.headers.get('X-RateLimit-Remaining');
    
    console.log(`Request ${i}: Status ${res.status}, Remaining: ${remaining}`);
    
    if (res.status === 429) {
      console.log('Rate limit exceeded:', data);
      break;
    }
  }
}

testRateLimit();
```

## Production Considerations

### 1. Use Redis for Distributed Systems

For multi-server deployments, replace the in-memory Map with Redis:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Store rate limit data in Redis
await redis.setex(`ratelimit:${key}`, windowMs / 1000, JSON.stringify(data));
```

### 2. Adjust Limits Based on Usage

Monitor your API usage and adjust limits accordingly:

```javascript
// Development
const devRateLimit = rateLimit({ maxRequests: 1000, windowMs: 60000 });

// Production
const prodRateLimit = rateLimit({ maxRequests: 100, windowMs: 900000 });

export const limit = process.env.NODE_ENV === 'production' 
  ? prodRateLimit 
  : devRateLimit;
```

### 3. Whitelist Trusted IPs

```javascript
const WHITELISTED_IPS = ['192.168.1.100', '10.0.0.1'];

export function rateLimit(options = {}) {
  return async function rateLimitMiddleware(req) {
    const ip = getClientIp(req);
    
    // Skip rate limiting for whitelisted IPs
    if (WHITELISTED_IPS.includes(ip)) {
      return { rateLimitHeaders: {} };
    }
    
    // Continue with rate limiting...
  };
}
```

### 4. Add Logging

```javascript
if (rateLimitEntry.count > maxRequests) {
  console.warn(`Rate limit exceeded for IP: ${ip}, URL: ${req.url}`);
  // Send to monitoring service (e.g., Sentry, DataDog)
}
```

## Security Benefits

1. **DDoS Protection** - Prevents overwhelming the server
2. **Brute Force Prevention** - Limits login attempts
3. **Resource Protection** - Ensures fair API usage
4. **Cost Control** - Prevents excessive cloud costs
5. **API Abuse Prevention** - Stops malicious actors

## Troubleshooting

### Rate Limit Not Working

1. Check if middleware is properly imported
2. Verify IP detection is working
3. Check if rate limit store is being populated

### False Positives

1. Check if multiple users share the same IP (NAT)
2. Consider using user ID + IP for authenticated routes
3. Adjust limits based on legitimate usage patterns

### Memory Issues

1. Implement Redis for production
2. Reduce cleanup interval
3. Set shorter time windows

## Migration from express-rate-limit

If migrating from Express:

```javascript
// Before (Express)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// After (Next.js App Router)
import { withRateLimit, generalRateLimit } from '@/app/lib/rateLimiter';
export const GET = withRateLimit(handler, generalRateLimit);
```

## Best Practices

1. ✅ Use stricter limits for authentication endpoints
2. ✅ Add rate limit headers to all responses
3. ✅ Log rate limit violations
4. ✅ Monitor rate limit metrics
5. ✅ Adjust limits based on actual usage
6. ✅ Use Redis in production for distributed systems
7. ✅ Whitelist trusted IPs (admin, monitoring services)
8. ✅ Provide clear error messages
9. ✅ Include retry-after information
10. ✅ Test rate limits before deployment
