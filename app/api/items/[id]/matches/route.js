import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import { findMatchesForLostItem, findMatchesForFoundItem, getMatchQuality, getMatchQualityColor } from "@/app/lib/matching";
import { withRateLimit, generalRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { itemIdSchema } from "@/app/lib/validations/items";
import { validateData } from "@/app/lib/validations/helper";

/**
 * Find matching items for a specific item
 * GET /api/items/[id]/matches
 * 
 * Returns top 5 potential matches based on:
 * - Category (40%)
 * - Location (20%)
 * - Date proximity (20%)
 * - Keywords similarity (20%)
 */
async function getMatchesHandler(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate item ID
    const idValidation = validateData(itemIdSchema, id);
    if (!idValidation.success) {
      return createErrorResponse([
        { field: 'id', message: 'Invalid item ID format' }
      ], 400);
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    // Find the source item
    const sourceItem = await Item.findById(id).populate('user', 'name email phone');

    if (!sourceItem) {
      return createErrorResponse([
        { field: 'id', message: 'Item not found' }
      ], 404);
    }

    // Determine opposite type for matching
    let oppositeType;
    if (sourceItem.type === 'lost') {
      oppositeType = 'found';
    } else if (sourceItem.type === 'found') {
      oppositeType = 'lost';
    } else {
      // Resolved items don't need matches
      return createSuccessResponse({
        sourceItem: {
          _id: sourceItem._id,
          title: sourceItem.title,
          type: sourceItem.type
        },
        matches: [],
        message: 'Resolved items do not have matches'
      }, 'No matches available for resolved items');
    }

    // Find candidate items (opposite type, not resolved)
    const candidateItems = await Item.find({
      type: oppositeType,
      _id: { $ne: id } // Exclude the source item itself
    })
    .populate('user', 'name email phone')
    .lean();

    if (candidateItems.length === 0) {
      return createSuccessResponse({
        sourceItem: {
          _id: sourceItem._id,
          title: sourceItem.title,
          type: sourceItem.type,
          category: sourceItem.category
        },
        matches: [],
        message: `No ${oppositeType} items available for matching`
      }, 'No potential matches found');
    }

    // Find matches using the matching algorithm
    let matches;
    if (sourceItem.type === 'lost') {
      matches = findMatchesForLostItem(sourceItem, candidateItems, limit);
    } else {
      matches = findMatchesForFoundItem(sourceItem, candidateItems, limit);
    }

    // Format matches for response
    const formattedMatches = matches.map(match => ({
      item: {
        _id: match.item._id,
        title: match.item.title,
        description: match.item.description,
        category: match.item.category,
        type: match.item.type,
        location: match.item.location,
        date: match.item.date,
        imageUrl: match.item.imageUrl,
        createdAt: match.item.createdAt,
        user: match.item.user
      },
      matchScore: {
        total: match.score,
        percentage: match.percentage,
        quality: getMatchQuality(match.score),
        qualityColor: getMatchQualityColor(match.score),
        breakdown: {
          category: {
            score: match.breakdown.category,
            weight: '40%',
            percentage: Math.round((match.breakdown.category / 40) * 100)
          },
          location: {
            score: match.breakdown.location,
            weight: '20%',
            percentage: Math.round((match.breakdown.location / 20) * 100)
          },
          date: {
            score: match.breakdown.date,
            weight: '20%',
            percentage: Math.round((match.breakdown.date / 20) * 100)
          },
          keywords: {
            score: match.breakdown.keywords,
            weight: '20%',
            percentage: Math.round((match.breakdown.keywords / 20) * 100)
          }
        }
      }
    }));

    return createSuccessResponse({
      sourceItem: {
        _id: sourceItem._id,
        title: sourceItem.title,
        description: sourceItem.description,
        category: sourceItem.category,
        type: sourceItem.type,
        location: sourceItem.location,
        date: sourceItem.date
      },
      matches: formattedMatches,
      totalMatches: formattedMatches.length,
      searchedIn: candidateItems.length
    }, `Found ${formattedMatches.length} potential matches`);

  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Failed to find matches' }
    ], 500);
  }
}

// Export GET handler with rate limiting
export const GET = withRateLimit(getMatchesHandler, generalRateLimit);
