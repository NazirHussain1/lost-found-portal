/**
 * Rate Limiter for Next.js App Router
 * IP-based request tracking with configurable limits
 */

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client IP address from request
 * @param {Request} req - Next.js request object
 * @returns {string} - Client IP address
 */
function getClientIp(req) {
  // Check various headers for IP (handles proxies, load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  
  // Fallback to a default (shouldn't happen in production)
  return 'unknown';
}

/**
 * Rate limiter middleware
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.maxRequests - Maximum requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Error message to return
 * @returns {Function} - Middleware function
 */
export function rateLimit(options = {}) {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes default
    message = 'Too many requests. Please try again later.',
  } = options;

  return async function rateLimitMiddleware(req) {
    const ip = getClientIp(req);
    const key = `${ip}:${req.url}`;
    const now = Date.now();

    // Get or create rate limit entry
    let rateLimitEntry = rateLimitStore.get(key);

    if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
      // Create new entry or reset expired entry
      rateLimitEntry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, rateLimitEntry);
    }

    // Increment request count
    rateLimitEntry.count++;

    // Check if limit exceeded
    if (rateLimitEntry.count > maxRequests) {
      const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000);
      
      return Response.json(
        {
          success: false,
          error: message,
          retryAfter: `${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitEntry.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const remaining = maxRequests - rateLimitEntry.count;
    
    return {
      rateLimitHeaders: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitEntry.resetTime).toISOString(),
      },
    };
  };
}

/**
 * Predefined rate limiters for different API types
 */

// General API routes: 100 requests per 15 minutes
export const generalRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests. Please try again later.',
});

// Auth API routes: 5 requests per 15 minutes
export const authRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again later.',
});

// Admin API routes: 200 requests per 15 minutes
export const adminRateLimit = rateLimit({
  maxRequests: 200,
  windowMs: 15 * 60 * 1000,
  message: 'Too many admin requests. Please try again later.',
});

// Upload API routes: 10 requests per 15 minutes
export const uploadRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many upload attempts. Please try again later.',
});

// Strict rate limit for sensitive operations: 3 requests per hour
export const strictRateLimit = rateLimit({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Rate limit exceeded for this sensitive operation. Please try again later.',
});

/**
 * Helper function to apply rate limiting to API route handlers
 * @param {Function} handler - API route handler
 * @param {Function} limiter - Rate limiter function
 * @returns {Function} - Wrapped handler with rate limiting
 */
export function withRateLimit(handler, limiter) {
  return async function (req, context) {
    // Apply rate limiting
    const rateLimitResult = await limiter(req);

    // If rate limit exceeded, return error response
    if (rateLimitResult instanceof Response) {
      return rateLimitResult;
    }

    // Execute the original handler
    const response = await handler(req, context);

    // Add rate limit headers to successful response
    if (response instanceof Response && rateLimitResult.rateLimitHeaders) {
      Object.entries(rateLimitResult.rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

/**
 * Get current rate limit status for an IP
 * @param {string} ip - IP address
 * @param {string} url - Request URL
 * @returns {Object} - Rate limit status
 */
export function getRateLimitStatus(ip, url) {
  const key = `${ip}:${url}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      count: 0,
      resetTime: null,
      isLimited: false,
    };
  }
  
  return {
    count: entry.count,
    resetTime: new Date(entry.resetTime).toISOString(),
    isLimited: entry.count > 100, // Default limit
  };
}

/**
 * Clear rate limit for specific IP (admin function)
 * @param {string} ip - IP address
 * @param {string} url - Request URL (optional)
 */
export function clearRateLimit(ip, url = null) {
  if (url) {
    const key = `${ip}:${url}`;
    rateLimitStore.delete(key);
  } else {
    // Clear all entries for this IP
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${ip}:`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Get all rate limit entries (admin function)
 * @returns {Array} - All rate limit entries
 */
export function getAllRateLimits() {
  const entries = [];
  const now = Date.now();
  
  for (const [key, value] of rateLimitStore.entries()) {
    const [ip, url] = key.split(':');
    entries.push({
      ip,
      url,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString(),
      isExpired: now > value.resetTime,
    });
  }
  
  return entries;
}
