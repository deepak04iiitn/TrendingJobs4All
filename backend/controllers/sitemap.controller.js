import InterviewExperience from '../models/interview.model.js';
import Salary from '../models/salary.model.js';
import InterviewQuestion from '../models/interviewQuestion.model.js';
import Blog from '../models/blog.model.js';
import mongoose from 'mongoose';

// In-memory cache for sitemap
let sitemapCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Helper function to create slug from text
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Helper function to generate XML sitemap
const generateSitemapXML = (urls) => {
  const baseUrl = 'https://route2hire.com';
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
                      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  // Public, indexable canonical URLs only (no private/admin/deleted/orphan paths)
  const staticUrls = [
    { url: '/', priority: '1.00' },
    { url: '/about', priority: '0.80' },
    { url: '/jobs', priority: '0.90' },
    { url: '/premium-jobs', priority: '0.90' },
    { url: '/interview-experiences', priority: '0.80' },
    { url: '/salary-structures', priority: '0.80' },
    { url: '/interview-questions', priority: '0.80' },
    { url: '/qa-sdet-dsa-sheet', priority: '0.80' },
    { url: '/resume-builder', priority: '0.70' },
    { url: '/blogs', priority: '0.80' },
    { url: '/contact-us', priority: '0.60' },
    { url: '/sign-in', priority: '0.40' },
    { url: '/sign-up', priority: '0.40' },
    { url: '/privacy-policy', priority: '0.30' },
    { url: '/terms-of-service', priority: '0.30' },
    { url: '/cookie-policy', priority: '0.30' },
  ];

  // Add static URLs
  staticUrls.forEach(staticUrl => {
    xml += `  <url>
    <loc>${baseUrl}${staticUrl.url}</loc>
    <priority>${staticUrl.priority}</priority>
  </url>

`;
  });

  // Add dynamic URLs
  urls.forEach(urlData => {
    xml += `  <url>
    <loc>${baseUrl}${urlData.url}</loc>
    <priority>${urlData.priority || '0.60'}</priority>
    <lastmod>${urlData.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
  </url>

`;
  });

  xml += `</urlset>`;
  return xml;
};

// Main function to generate sitemap
export const generateSitemap = async (req, res) => {
  try {
    // Check cache first
    if (sitemapCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      res.set('Content-Type', 'application/xml');
      return res.send(sitemapCache);
    }

    console.log('Generating fresh sitemap...');
    
    // Fetch all dynamic content in parallel with optimized queries
    const [
      interviewExperiences,
      salaryRecords,
      interviewQuestions,
      jobs,
      blogs
    ] = await Promise.all([
      InterviewExperience.find({}, '_id company position updatedAt').lean().limit(10000), // Include fields for slug
      Salary.find({}, '_id company position updatedAt').lean().limit(10000),
      InterviewQuestion.find({}, '_id topic updatedAt').lean().limit(10000),
      mongoose.connection.db.collection('naukri').find(
        { 
          apply_link: { $exists: true, $ne: null, $ne: '' },
          apply_link: { $ne: 'Not Found' },
          apply_link: { $ne: 'about:blank' },
          apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } },
          apply_link: { $regex: /^https?:\/\/.+\..+/i }
        },
        { projection: { _id: 1, time: 1 } }
      ).limit(10000).toArray(), // Limit to prevent huge sitemaps
      Blog.find({ status: 'published' }, 'slug updatedAt').lean().limit(10000)
    ]);

    const dynamicUrls = [];

    // Add interview experience URLs
    interviewExperiences.forEach(exp => {
      const slug = createSlug(`${exp.company || 'company'}-${exp.position || 'role'}`);
      dynamicUrls.push({
        url: `/interview-experience/${slug}/${exp._id}`,
        priority: '0.70',
        lastmod: exp.updatedAt ? new Date(exp.updatedAt).toISOString().split('T')[0] : null
      });
    });

    // Add salary record URLs
    salaryRecords.forEach(salary => {
      dynamicUrls.push({
        url: `/salary/${salary._id}`,
        priority: '0.70',
        lastmod: salary.updatedAt ? new Date(salary.updatedAt).toISOString().split('T')[0] : null
      });
    });

    // Add interview question URLs
    interviewQuestions.forEach(question => {
      const topicSlug = createSlug(question.topic);
      dynamicUrls.push({
        url: `/interview-questions/${topicSlug}/${question._id}`,
        priority: '0.70',
        lastmod: question.updatedAt ? new Date(question.updatedAt).toISOString().split('T')[0] : null
      });
    });

    // Add job URLs (using the existing job structure)
    jobs.forEach(job => {
      // Create a URL-friendly slug from job title and company
      const jobSlug = createSlug(`${job._id}`);
      dynamicUrls.push({
        url: `/fulljd/${jobSlug}/${job._id}`,
        priority: '0.80',
        lastmod: job.time ? new Date(job.time).toISOString().split('T')[0] : null
      });
    });

    // Add blog URLs
    blogs.forEach(blog => {
      dynamicUrls.push({
        url: `/blogs/${blog.slug}`,
        priority: '0.80',
        lastmod: blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : null
      });
    });

    // Generate XML
    const sitemapXML = generateSitemapXML(dynamicUrls);

    // Cache the result
    sitemapCache = sitemapXML;
    cacheTimestamp = Date.now();

    // Set appropriate headers for SEO and performance
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.set('ETag', `"${Date.now()}"`); // Simple ETag for caching
    res.set('Last-Modified', new Date().toUTCString());
    res.set('X-Content-Type-Options', 'nosniff');
    
    res.send(sitemapXML);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate sitemap',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Function to clear sitemap cache (useful for webhooks)
export const clearSitemapCache = () => {
  sitemapCache = null;
  cacheTimestamp = null;
  console.log('Sitemap cache cleared');
};

// Function to get sitemap statistics
export const getSitemapStats = async (req, res) => {
  try {
    const [
      interviewCount,
      salaryCount,
      questionCount,
      jobCount,
      blogCount
    ] = await Promise.all([
      InterviewExperience.countDocuments(),
      Salary.countDocuments(),
      InterviewQuestion.countDocuments(),
      mongoose.connection.db.collection('naukri').countDocuments({
        apply_link: { $exists: true, $ne: null, $ne: '' },
        apply_link: { $ne: 'Not Found' },
        apply_link: { $ne: 'about:blank' },
        apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } },
        apply_link: { $regex: /^https?:\/\/.+\..+/i }
      }),
      Blog.countDocuments({ status: 'published' })
    ]);

    const totalDynamicUrls = interviewCount + salaryCount + questionCount + jobCount + blogCount;
    const staticUrlCount = 25; // Count of static URLs (removed referrals/resume-templates)
    const totalUrls = staticUrlCount + totalDynamicUrls;

    res.json({
      success: true,
      stats: {
        staticUrls: staticUrlCount,
        dynamicUrls: {
          interviewExperiences: interviewCount,
          salaryRecords: salaryCount,
          interviewQuestions: questionCount,
          jobs: jobCount,
          blogs: blogCount,
          total: totalDynamicUrls
        },
        totalUrls,
        cacheStatus: sitemapCache ? 'cached' : 'not cached',
        cacheAge: cacheTimestamp ? Math.floor((Date.now() - cacheTimestamp) / 1000) : null
      }
    });
  } catch (error) {
    console.error('Error getting sitemap stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get sitemap statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
