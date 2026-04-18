/**
 * Item Matching Algorithm
 * Matches lost items with found items based on multiple criteria
 * 
 * Scoring Weights:
 * - Category Match: 40%
 * - Location Similarity: 20%
 * - Date Proximity: 20%
 * - Keywords Similarity: 20%
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Levenshtein distance
  const matrix = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  
  return 1 - (distance / maxLength);
}

/**
 * Calculate category match score
 * @param {string} category1 - First item category
 * @param {string} category2 - Second item category
 * @returns {number} - Score (0-40)
 */
function calculateCategoryScore(category1, category2) {
  if (!category1 || !category2) return 0;
  
  const c1 = category1.toLowerCase().trim();
  const c2 = category2.toLowerCase().trim();
  
  // Exact match
  if (c1 === c2) return 40;
  
  // Partial match (e.g., "electronics" contains "electronic")
  if (c1.includes(c2) || c2.includes(c1)) return 20;
  
  return 0;
}

/**
 * Calculate location similarity score
 * @param {string} location1 - First item location
 * @param {string} location2 - Second item location
 * @returns {number} - Score (0-20)
 */
function calculateLocationScore(location1, location2) {
  if (!location1 || !location2) return 0;
  
  const l1 = location1.toLowerCase().trim();
  const l2 = location2.toLowerCase().trim();
  
  // Exact match
  if (l1 === l2) return 20;
  
  // Check if locations contain common words
  const words1 = l1.split(/\s+/);
  const words2 = l2.split(/\s+/);
  
  const commonWords = words1.filter(word => 
    word.length > 2 && words2.some(w => w.includes(word) || word.includes(w))
  );
  
  if (commonWords.length > 0) {
    // Partial match based on common words
    const ratio = commonWords.length / Math.max(words1.length, words2.length);
    return Math.round(20 * ratio);
  }
  
  // Use string similarity as fallback
  const similarity = calculateStringSimilarity(l1, l2);
  return Math.round(20 * similarity);
}

/**
 * Calculate date proximity score
 * @param {Date} date1 - First item date
 * @param {Date} date2 - Second item date
 * @returns {number} - Score (0-20)
 */
function calculateDateScore(date1, date2) {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Calculate difference in days
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Scoring based on day difference
  if (diffDays === 0) return 20;      // Same day
  if (diffDays <= 1) return 18;       // 1 day
  if (diffDays <= 3) return 15;       // 2-3 days
  if (diffDays <= 7) return 12;       // 4-7 days
  if (diffDays <= 14) return 8;       // 8-14 days
  if (diffDays <= 30) return 4;       // 15-30 days
  
  return 0; // More than 30 days
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} - Array of keywords
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // Common stop words to ignore
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'i', 'my', 'have', 'this', 'lost',
    'found', 'please', 'help', 'need', 'looking', 'anyone'
  ]);
  
  // Extract words (alphanumeric only)
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  return [...new Set(words)]; // Remove duplicates
}

/**
 * Calculate keywords similarity score
 * @param {string} text1 - First item text (title + description)
 * @param {string} text2 - Second item text (title + description)
 * @returns {number} - Score (0-20)
 */
function calculateKeywordsScore(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);
  
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  // Count matching keywords
  let matchCount = 0;
  let partialMatchCount = 0;
  
  for (const kw1 of keywords1) {
    for (const kw2 of keywords2) {
      if (kw1 === kw2) {
        matchCount++;
      } else if (kw1.includes(kw2) || kw2.includes(kw1)) {
        partialMatchCount++;
      }
    }
  }
  
  // Calculate score
  const totalKeywords = Math.max(keywords1.length, keywords2.length);
  const matchRatio = (matchCount + partialMatchCount * 0.5) / totalKeywords;
  
  return Math.round(20 * matchRatio);
}

/**
 * Calculate overall match score between two items
 * @param {Object} item1 - First item
 * @param {Object} item2 - Second item
 * @returns {Object} - Match result with score and breakdown
 */
export function calculateMatchScore(item1, item2) {
  // Calculate individual scores
  const categoryScore = calculateCategoryScore(item1.category, item2.category);
  const locationScore = calculateLocationScore(item1.location, item2.location);
  const dateScore = calculateDateScore(item1.date, item2.date);
  
  const text1 = `${item1.title} ${item1.description}`;
  const text2 = `${item2.title} ${item2.description}`;
  const keywordsScore = calculateKeywordsScore(text1, text2);
  
  // Calculate total score (out of 100)
  const totalScore = categoryScore + locationScore + dateScore + keywordsScore;
  
  return {
    totalScore,
    breakdown: {
      category: categoryScore,
      location: locationScore,
      date: dateScore,
      keywords: keywordsScore
    },
    percentage: totalScore
  };
}

/**
 * Find matching items for a given item
 * @param {Object} sourceItem - Item to find matches for
 * @param {Array<Object>} candidateItems - Array of potential matching items
 * @param {number} topN - Number of top matches to return (default: 5)
 * @returns {Array<Object>} - Array of matched items with scores
 */
export function findMatches(sourceItem, candidateItems, topN = 5) {
  if (!sourceItem || !candidateItems || candidateItems.length === 0) {
    return [];
  }
  
  // Calculate scores for all candidates
  const matches = candidateItems.map(candidate => {
    const matchResult = calculateMatchScore(sourceItem, candidate);
    
    return {
      item: candidate,
      score: matchResult.totalScore,
      breakdown: matchResult.breakdown,
      percentage: matchResult.percentage
    };
  });
  
  // Sort by score (descending) and return top N
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(match => match.score > 0); // Only return matches with score > 0
}

/**
 * Find potential matches for a lost item among found items
 * @param {Object} lostItem - Lost item to find matches for
 * @param {Array<Object>} foundItems - Array of found items
 * @param {number} topN - Number of top matches to return
 * @returns {Array<Object>} - Array of matched found items
 */
export function findMatchesForLostItem(lostItem, foundItems, topN = 5) {
  return findMatches(lostItem, foundItems, topN);
}

/**
 * Find potential matches for a found item among lost items
 * @param {Object} foundItem - Found item to find matches for
 * @param {Array<Object>} lostItems - Array of lost items
 * @param {number} topN - Number of top matches to return
 * @returns {Array<Object>} - Array of matched lost items
 */
export function findMatchesForFoundItem(foundItem, lostItems, topN = 5) {
  return findMatches(foundItem, lostItems, topN);
}

/**
 * Get match quality label based on score
 * @param {number} score - Match score (0-100)
 * @returns {string} - Quality label
 */
export function getMatchQuality(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Very Low';
}

/**
 * Get match quality color
 * @param {number} score - Match score (0-100)
 * @returns {string} - Color code
 */
export function getMatchQualityColor(score) {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#f59e0b'; // Orange
  if (score >= 20) return '#ef4444'; // Red
  return '#6b7280'; // Gray
}
