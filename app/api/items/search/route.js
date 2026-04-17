import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import { withRateLimit, generalRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";

/**
 * Advanced search API for items
 * Supports: text search, category filter, type filter, date range, pagination
 * 
 * Query Parameters:
 * - q: Search query (searches title, description, location)
 * - category: Filter by category (electronics, stationary, etc.)
 * - type: Filter by type (lost, found, resolved)
 * - dateFrom: Start date (ISO format)
 * - dateTo: End date (ISO format)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sortBy: Sort field (relevance, date, createdAt)
 * - sortOrder: Sort order (asc, desc)
 */
async function searchHandler(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Validate page and limit
    if (page < 1) {
      return createErrorResponse([
        { field: 'page', message: 'Page must be greater than 0' }
      ], 400);
    }

    if (limit < 1) {
      return createErrorResponse([
        { field: 'limit', message: 'Limit must be greater than 0' }
      ], 400);
    }

    // Build MongoDB query
    const filter = {};

    // Text search
    if (query.trim()) {
      filter.$text = { $search: query.trim() };
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    // Type filter
    if (type && type !== 'all') {
      filter.type = type.toLowerCase();
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          filter.date.$gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          // Set to end of day
          toDate.setHours(23, 59, 59, 999);
          filter.date.$lte = toDate;
        }
      }
    }

    // Build sort options
    let sortOptions = {};
    
    if (query.trim() && sortBy === 'relevance') {
      // Sort by text search score (relevance)
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'date') {
      sortOptions = { date: sortOrder };
    } else if (sortBy === 'createdAt') {
      sortOptions = { createdAt: sortOrder };
    } else {
      // Default: newest first
      sortOptions = { createdAt: -1 };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for better performance
    const pipeline = [
      { $match: filter },
    ];

    // Add text score projection if searching
    if (query.trim()) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' }
        }
      });
    }

    // Add sort
    pipeline.push({ $sort: sortOptions });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Lookup user information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    });

    // Unwind user array
    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    });

    // Project only necessary user fields
    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        category: 1,
        type: 1,
        location: 1,
        date: 1,
        imageUrl: 1,
        createdAt: 1,
        updatedAt: 1,
        score: 1,
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
        'user.phone': 1
      }
    });

    // Execute search
    const items = await Item.aggregate(pipeline);

    // Get total count for pagination
    const totalCount = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    return createSuccessResponse({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        query: query || null,
        category: category || null,
        type: type || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc'
      }
    }, 'Search completed successfully');

  } catch (error) {
    console.error('Search error:', error);
    return createErrorResponse([
      { field: 'server', message: 'Search failed. Please try again.' }
    ], 500);
  }
}

// Export GET handler with rate limiting
export const GET = withRateLimit(searchHandler, generalRateLimit);
