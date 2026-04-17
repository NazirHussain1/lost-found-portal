import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import { cookies } from "next/headers";
import { createItemSchema } from "@/app/lib/validations/items";
import { validateData, createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { withRateLimit, generalRateLimit } from "@/app/lib/rateLimiter";

async function getHandler(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const myItems = searchParams.get("myItems");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

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

    let filter = {};

    if (type && type !== "all") filter.type = type.toLowerCase();
    if (category && category !== "all") filter.category = category.toLowerCase();

    if (myItems === "true" && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        filter.user = decoded.id;
      } catch (err) {
        console.error("Invalid token in MyItems request");
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated items
    const items = await Item.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Build pagination response
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
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get items error:", error);
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

async function postHandler(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return createErrorResponse([
        { field: 'auth', message: 'Unauthorized - Please login' }
      ], 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return createErrorResponse([
        { field: 'auth', message: 'Invalid or expired token' }
      ], 401);
    }

    const userId = decoded.id;
    const body = await req.json();

    // Validate input data
    const validation = validateData(createItemSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { title, description, category, type, location, date, imageUrl } = validation.data;

    // Create item
    const newItem = await Item.create({
      title,
      description,
      category: category.toLowerCase(),
      type: type.toLowerCase(),
      location,
      date,
      imageUrl: imageUrl || "",
      user: userId,
    });

    // Populate user data
    await newItem.populate("user", "name email phone");

    return createSuccessResponse(
      newItem,
      'Item created successfully',
      201
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export handlers with rate limiting
export const GET = withRateLimit(getHandler, generalRateLimit);
export const POST = withRateLimit(postHandler, generalRateLimit);