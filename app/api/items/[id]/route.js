import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { updateItemSchema, itemIdSchema } from "@/app/lib/validations/items";
import { validateData, createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { withRateLimit, generalRateLimit } from "@/app/lib/rateLimiter";

async function deleteHandler(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate item ID
    const idValidation = validateData(itemIdSchema, id);
    if (!idValidation.success) {
      return createErrorResponse([
        { field: 'id', message: 'Invalid item ID format' }
      ]);
    }

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
    } catch (e) {
      return createErrorResponse([
        { field: 'auth', message: 'Invalid or expired token' }
      ], 401);
    }

    // Find item
    const item = await Item.findById(id);
    if (!item) {
      return createErrorResponse([
        { field: 'id', message: 'Item not found' }
      ], 404);
    }

    // Check ownership
    if (item.user.toString() !== decoded.id) {
      return createErrorResponse([
        { field: 'auth', message: 'Forbidden - You can only delete your own items' }
      ], 403);
    }

    // Delete item
    await Item.findByIdAndDelete(id);

    return createSuccessResponse(
      { itemId: id },
      'Item deleted successfully'
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

async function putHandler(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Validate item ID
    const idValidation = validateData(itemIdSchema, id);
    if (!idValidation.success) {
      return createErrorResponse([
        { field: 'id', message: 'Invalid item ID format' }
      ]);
    }

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
    } catch (e) {
      return createErrorResponse([
        { field: 'auth', message: 'Invalid or expired token' }
      ], 401);
    }

    // Find item
    const item = await Item.findById(id);
    if (!item) {
      return createErrorResponse([
        { field: 'id', message: 'Item not found' }
      ], 404);
    }

    // Check ownership
    if (item.user.toString() !== decoded.id) {
      return createErrorResponse([
        { field: 'auth', message: 'Forbidden - You can only update your own items' }
      ], 403);
    }

    const body = await req.json();

    // Validate update data
    const validation = validateData(updateItemSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    // Prepare update object (only include provided fields)
    const updateData = {};
    if (validation.data.title) updateData.title = validation.data.title;
    if (validation.data.description) updateData.description = validation.data.description;
    if (validation.data.category) updateData.category = validation.data.category.toLowerCase();
    if (validation.data.type) updateData.type = validation.data.type.toLowerCase();
    if (validation.data.location) updateData.location = validation.data.location;
    if (validation.data.date) updateData.date = validation.data.date;
    if (validation.data.imageUrl !== undefined) updateData.imageUrl = validation.data.imageUrl;

    // Update item
    const updated = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    return createSuccessResponse(
      updated,
      'Item updated successfully'
    );
  } catch (error) {
    console.error('Update item error:', error);
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export handlers with rate limiting
export const DELETE = withRateLimit(deleteHandler, generalRateLimit);
export const PUT = withRateLimit(putHandler, generalRateLimit);
