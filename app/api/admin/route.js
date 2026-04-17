import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { withRateLimit, adminRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse } from "@/app/lib/validations/helper";

async function getHandler(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    // Validate pagination parameters
    if (page < 1) {
      return createErrorResponse([
        { field: 'page', message: 'Page must be greater than 0' }
      ], 400);
    }

    if (limit < 1 || limit > 100) {
      return createErrorResponse([
        { field: 'limit', message: 'Limit must be between 1 and 100' }
      ], 400);
    }

    // Build filter
    const filter = {};
    if (type && type !== "all") filter.type = type.toLowerCase();
    if (category && category !== "all") filter.category = category.toLowerCase();

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated items
    const items = await Item.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Build response
    const response = {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      filters: {
        type: type || null,
        category: category || null,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin get items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export GET handler with admin rate limiting (200 requests per 15 minutes)
export const GET = withRateLimit(getHandler, adminRateLimit);
