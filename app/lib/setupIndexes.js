import { connectDB } from './mongodb';
import Item from '../models/items';
import User from '../models/user';

/**
 * Setup MongoDB indexes for optimal search performance
 * Run this once during deployment or app initialization
 */
export async function setupIndexes() {
  try {
    await connectDB();

    console.log('Setting up MongoDB indexes...');

    // Create indexes for Item collection
    await Item.createIndexes();
    console.log('✓ Item indexes created');

    // Create indexes for User collection
    await User.createIndexes();
    console.log('✓ User indexes created');

    // List all indexes for verification
    const itemIndexes = await Item.collection.getIndexes();
    console.log('Item indexes:', Object.keys(itemIndexes));

    const userIndexes = await User.collection.getIndexes();
    console.log('User indexes:', Object.keys(userIndexes));

    console.log('✓ All indexes setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up indexes:', error);
    return false;
  }
}

/**
 * Drop and recreate all indexes
 * Use with caution - only for development or migration
 */
export async function recreateIndexes() {
  try {
    await connectDB();

    console.log('Dropping existing indexes...');

    // Drop all indexes except _id
    await Item.collection.dropIndexes();
    await User.collection.dropIndexes();

    console.log('✓ Indexes dropped');

    // Recreate indexes
    await setupIndexes();

    return true;
  } catch (error) {
    console.error('Error recreating indexes:', error);
    return false;
  }
}

/**
 * Check if text index exists
 */
export async function checkTextIndex() {
  try {
    await connectDB();

    const indexes = await Item.collection.getIndexes();
    const hasTextIndex = Object.values(indexes).some(
      index => index.textIndexVersion !== undefined
    );

    return hasTextIndex;
  } catch (error) {
    console.error('Error checking text index:', error);
    return false;
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats() {
  try {
    await connectDB();

    const itemStats = await Item.collection.stats();
    const userStats = await User.collection.stats();

    return {
      items: {
        count: itemStats.count,
        size: itemStats.size,
        indexes: itemStats.nindexes,
        indexSize: itemStats.totalIndexSize
      },
      users: {
        count: userStats.count,
        size: userStats.size,
        indexes: userStats.nindexes,
        indexSize: userStats.totalIndexSize
      }
    };
  } catch (error) {
    console.error('Error getting index stats:', error);
    return null;
  }
}
