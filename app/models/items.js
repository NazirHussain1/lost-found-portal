import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["lost", "found", "resolved"],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Text index for search functionality
// Weights: title (highest priority), description, location
ItemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    location: 3
  },
  name: 'item_text_search'
});

// Compound indexes for efficient filtering
ItemSchema.index({ category: 1, type: 1 });
ItemSchema.index({ date: -1 });
ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ user: 1 });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
