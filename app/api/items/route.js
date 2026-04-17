import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import { cookies } from "next/headers";
import { createItemSchema } from "@/app/lib/validations/items";
import { validateData, createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { withRateLimit, generalRateLimit } from "@/app/lib/rateLimiter";

async function getHandler(req) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const myItems = searchParams.get("myItems");

  let filter = {};

  if (type) filter.type = type.toLowerCase();
  if (category) filter.category = category.toLowerCase();

  if (myItems === "true" && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      filter.user = decoded.id;
    } catch (err) {
      console.error("Invalid token in MyItems request");
    }
  }

  const items = await Item.find(filter).populate("user", "name email phone");

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
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