import jwt from "jsonwebtoken";
import User from "@/app/models/user";
import { connectDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password -__v");
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

   return NextResponse.json({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,

  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  joinDate: user.createdAt,
});
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    // Validate that user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only update allowed fields
    const allowedUpdates = ['name', 'bio', 'location', 'avatar'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -__v");

    return NextResponse.json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      location: updatedUser.location,
      avatar: updatedUser.avatar,
      joinDate: updatedUser.createdAt,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token or update failed" }, { status: 401 });
  }
}
