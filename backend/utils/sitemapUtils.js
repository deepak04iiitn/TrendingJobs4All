import { clearSitemapCache } from '../controllers/sitemap.controller.js';

// Utility functions for sitemap management

/**
 * Clear sitemap cache when content changes
 * This should be called whenever dynamic content is created, updated, or deleted
 */
export const invalidateSitemapCache = () => {
  try {
    clearSitemapCache();
    console.log('Sitemap cache invalidated due to content change');
  } catch (error) {
    console.error('Error invalidating sitemap cache:', error);
  }
};

/**
 * Get sitemap statistics for monitoring
 */
export const getSitemapInfo = async () => {
  try {
    const response = await fetch('http://localhost:3000/sitemap-stats');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sitemap stats:', error);
    return null;
  }
};

/**
 * Schedule sitemap cache refresh (useful for cron jobs)
 */
export const scheduleSitemapRefresh = () => {
  // This can be called by cron jobs to refresh the sitemap cache
  // even if no content has changed, to ensure it's up to date
  clearSitemapCache();
  console.log('Sitemap cache refreshed by scheduled task');
};

/**
 * Validate sitemap URL structure
 */
export const validateSitemapUrl = (url) => {
  const validPatterns = [
    /^\/interview-experience\/[a-f0-9]{24}$/i, // MongoDB ObjectId
    /^\/salary\/[a-f0-9]{24}$/i,
    /^\/interview-questions\/[a-z0-9-]+$/i, // Slug format
    /^\/fulljd\/[a-z0-9-]+\/[a-f0-9]{24}$/i, // Job URL with slug and ID
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Generate SEO-friendly URL slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Calculate priority for different types of content
 */
export const calculatePriority = (contentType, additionalData = {}) => {
  const priorityMap = {
    'home': 1.00,
    'jobs': 0.90,
    'interview-experiences': 0.80,
    'salary-records': 0.80,
    'interview-questions': 0.80,
    'static-pages': 0.70,
    'user-content': 0.60,
    'admin-pages': 0.50
  };
  
  let basePriority = priorityMap[contentType] || 0.60;
  
  // Adjust priority based on additional data
  if (additionalData.likes && additionalData.likes > 10) {
    basePriority += 0.1;
  }
  
  if (additionalData.recent && additionalData.recent) {
    basePriority += 0.05;
  }
  
  return Math.min(basePriority, 1.00); // Cap at 1.00
};

/**
 * Format lastmod date for sitemap
 */
export const formatLastMod = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
};
