import { v2 as cloudinary } from "cloudinary";
import { withRateLimit, uploadRateLimit } from "@/app/lib/rateLimiter";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadHandler(req) {
  try {
    const data = await req.json();
    const { image } = data; 

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "lost_found_portal",
    });

    return new Response(
      JSON.stringify({ url: uploadResponse.secure_url }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Export POST handler with upload rate limiting (10 requests per 15 minutes)
export const POST = withRateLimit(uploadHandler, uploadRateLimit);
