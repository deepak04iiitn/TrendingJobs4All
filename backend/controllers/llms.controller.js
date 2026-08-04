import InterviewExperience from '../models/interview.model.js';
import Salary from '../models/salary.model.js';
import InterviewQuestion from '../models/interviewQuestion.model.js';
import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// In-memory cache for llms.txt
let llmsCache = null;
let llmsCacheTimestamp = null;
const LLMS_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Helper function to create slug from text
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Helper function to generate llms.txt content
const generateLLMSText = (dynamicContent) => {
  const baseUrl = 'https://route2hire.com';
  
  let content = `# route2hire.com llms.txt

## Core Features

`;

  // Static content with descriptions
  const staticContent = [
    {
      url: '/',
      title: 'QA & SDET Career Hub',
      description: 'Route2Hire connects QA, SDET and Test Automation professionals with curated jobs, interview prep, DSA practice, salary insights and resume tools.'
    },
    {
      url: '/about',
      title: 'About Route2Hire',
      description: 'Learn how Route2Hire helps software testing professionals find jobs, prepare for interviews and grow their careers.'
    },
    {
      url: '/jobs',
      title: 'QA & SDET Job Listings',
      description: 'Browse curated Quality Assurance, SDET and Test Automation job openings refreshed for software testing professionals.'
    },
    {
      url: '/interview-experiences',
      title: 'Interview Experiences',
      description: 'Explore and share detailed QA and SDET interview experiences and insights by company and role.'
    },
    {
      url: '/salary-structures',
      title: 'Salary Insights',
      description: 'Browse and share QA/SDET salary data to support pay transparency and informed career decisions.'
    },
    {
      url: '/resume-builder',
      title: 'Resume Builder',
      description: 'Create ATS-friendly resumes for QA and SDET roles with live preview and PDF download.'
    },
    {
      url: '/interview-questions',
      title: 'Interview Questions Bank',
      description: 'Practice categorized real interview questions and explanations for QA, SDET and Test Automation interviews.'
    },
    {
      url: '/qa-sdet-dsa-sheet',
      title: 'QA SDET DSA Sheet',
      description: 'Master Data Structures and Algorithms with curated QA/SDET interview problems, progress tracking and leaderboard.'
    },
    {
      url: '/blogs',
      title: 'Blogs & Articles',
      description: 'Read professional blogs covering QA, SDET careers, automation and interview strategy on Route2Hire.'
    },
    {
      url: '/contact-us',
      title: 'Contact Route2Hire',
      description: 'Contact Route2Hire via Instagram, Telegram, email or LinkedIn for support and collaborations.'
    },
    {
      url: '/sign-in',
      title: 'Route2Hire Sign In',
      description: 'Sign in to access saved jobs, resume drafts and personalized career tools.'
    },
    {
      url: '/sign-up',
      title: 'Route2Hire Sign-Up',
      description: 'Create a free Route2Hire account for QA and SDET career tools.'
    },
    {
      url: '/terms-of-service',
      title: 'Terms of Service',
      description: 'Terms, user rights and guidelines for using Route2Hire.'
    },
    {
      url: '/privacy-policy',
      title: 'Privacy Policy',
      description: 'How Route2Hire collects, uses and protects personal data.'
    },
    {
      url: '/cookie-policy',
      title: 'Cookie Policy',
      description: 'How Route2Hire uses cookies and how users can manage preferences.'
    }
  ];

  // Add static content
  staticContent.forEach(item => {
    content += `- [${item.title}](${baseUrl}${item.url}): ${item.description}\n`;
  });

  // Add dynamic content sections
  if (dynamicContent.interviewExperiences.length > 0) {
    content += `\n## Interview Experiences\n\n`;
    dynamicContent.interviewExperiences.slice(0, 20).forEach(exp => {
      const company = exp.company || 'Unknown Company';
      const position = exp.position || 'Unknown Position';
      const slug = createSlug(`${company}-${position}`);
      content += `- [${company} - ${position} Interview Experience](${baseUrl}/interview-experience/${slug}/${exp._id}): Real interview experience shared by ${exp.fullName || 'Anonymous'} for ${position} position at ${company}.\n`;
    });
  }

  if (dynamicContent.salaryRecords.length > 0) {
    content += `\n## Salary Insights & Compensation Data\n\n`;
    dynamicContent.salaryRecords.slice(0, 20).forEach(salary => {
      const company = salary.company || 'Unknown Company';
      const position = salary.position || 'Unknown Position';
      const ctc = salary.ctc || 'Not disclosed';
      const slug = createSlug(`${company}-${position}`);
      content += `- [${company} - ${position} Salary Data](${baseUrl}/salaryStructures/${slug}/${salary._id}): Salary information for ${position} at ${company} with CTC of ${ctc}.\n`;
    });
  }

  if (dynamicContent.interviewQuestions.length > 0) {
    content += `\n## Interview Questions & Preparation\n\n`;
    dynamicContent.interviewQuestions.slice(0, 20).forEach(question => {
      const topic = question.topic || 'Interview Questions';
      const topicSlug = createSlug(topic);
      content += `- [${topic} Interview Questions](${baseUrl}/interview-questions/${topicSlug}/${question._id}): Real interview questions and answers for ${topic} preparation.\n`;
    });
  }

  if (dynamicContent.jobs.length > 0) {
    content += `\n## Current Job Opportunities\n\n`;
    dynamicContent.jobs.slice(0, 30).forEach(job => {
      const title = job.title || 'Job Opportunity';
      const company = job.company || 'Company';
      const location = Array.isArray(job.location)
        ? (job.location.length > 0 ? job.location.join(', ') : 'Location not specified')
        : (job.location || 'Location not specified');
      const jobSlug = createSlug(`${job._id}`);
      content += `- [${title} at ${company}](${baseUrl}/fulljd/${jobSlug}/${job._id}): ${title} position at ${company} in ${location}.\n`;
    });
  }

  if (dynamicContent.blogs.length > 0) {
    content += `\n## Professional Blogs & Articles\n\n`;
    dynamicContent.blogs.slice(0, 20).forEach(blog => {
      const title = blog.title || 'Blog Article';
      const category = blog.category || 'General';
      const excerpt = blog.excerpt || 'Professional insights and industry knowledge.';
      content += `- [${title}](${baseUrl}/blogs/${blog.slug}): ${excerpt} - Category: ${category}.\n`;
    });
  }

  content += `\n## About Route2Hire\n\n`;
  content += `Route2Hire is a comprehensive career platform designed for tech professionals. We provide:\n\n`;
  content += `- **Job Listings**: Curated high-quality job opportunities in tech and QA roles\n`;
  content += `- **Interview Preparation**: Real interview experiences and question banks\n`;
  content += `- **Salary Transparency**: Anonymous salary data for informed career decisions\n`;
  content += `- **Career Resources**: Resume builder, interview tips, and career guidance\n`;
  content += `- **Professional Blogs**: Expert articles on technology, development, QA, and SDET careers\n\n`;
  content += `Our platform helps professionals make informed career decisions, prepare for interviews, and connect with opportunities that match their skills and aspirations.\n\n`;
  content += `Last updated: ${new Date().toISOString().split('T')[0]}\n`;

  return content;
};

// Main function to generate llms.txt
export const generateLLMS = async (req, res) => {
  try {
    // Check cache first
    if (llmsCache && llmsCacheTimestamp && (Date.now() - llmsCacheTimestamp < LLMS_CACHE_DURATION)) {
      res.set('Content-Type', 'text/plain; charset=utf-8');
      return res.send(llmsCache);
    }

    console.log('Generating fresh llms.txt...');
    
    // Fetch all dynamic content in parallel with optimized queries
    const [
      interviewExperiences,
      salaryRecords,
      interviewQuestions,
      jobs,
      blogs
    ] = await Promise.all([
      InterviewExperience.find({}, '_id company position fullName').lean().limit(20),
      Salary.find({}, '_id company position ctc').lean().limit(20),
      InterviewQuestion.find({}, '_id topic').lean().limit(20),
      mongoose.connection.db.collection('naukri').find(
        { 
          apply_link: { $exists: true, $ne: null, $ne: '' },
          apply_link: { $ne: 'Not Found' },
          apply_link: { $ne: 'about:blank' },
          apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } },
          apply_link: { $regex: /^https?:\/\/.+\..+/i }
        },
        { projection: { _id: 1, title: 1, company: 1, location: 1 } }
      ).limit(30).toArray(),
      Blog.find({ status: 'published' }, 'title slug excerpt category').lean().limit(20)
    ]);

    const dynamicContent = {
      interviewExperiences,
      salaryRecords,
      interviewQuestions,
      jobs,
      blogs
    };

    // Generate llms.txt content
    const llmsContent = generateLLMSText(dynamicContent);

    // Cache the result
    llmsCache = llmsContent;
    llmsCacheTimestamp = Date.now();

    // Set appropriate headers for SEO and performance
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.set('ETag', `"${Date.now()}"`); // Simple ETag for caching
    res.set('Last-Modified', new Date().toUTCString());
    res.set('X-Content-Type-Options', 'nosniff');
    
    res.send(llmsContent);

  } catch (error) {
    console.error('Error generating llms.txt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate llms.txt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Function to clear llms.txt cache (useful for webhooks)
export const clearLLMSCache = () => {
  llmsCache = null;
  llmsCacheTimestamp = null;
  console.log('LLMS cache cleared');
};

// Function to get llms.txt statistics
export const getLLMSStats = async (req, res) => {
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

    const totalDynamicItems = interviewCount + salaryCount + questionCount + jobCount + blogCount;
    const staticItemCount = 21; // Count of static items (removed referrals/resume templates)
    const totalItems = staticItemCount + totalDynamicItems;

    res.json({
      success: true,
      stats: {
        staticItems: staticItemCount,
        dynamicItems: {
          interviewExperiences: interviewCount,
          salaryRecords: salaryCount,
          interviewQuestions: questionCount,
          jobs: jobCount,
          blogs: blogCount,
          total: totalDynamicItems
        },
        totalItems,
        cacheStatus: llmsCache ? 'cached' : 'not cached',
        cacheAge: llmsCacheTimestamp ? Math.floor((Date.now() - llmsCacheTimestamp) / 1000) : null
      }
    });
  } catch (error) {
    console.error('Error getting llms stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get llms statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Public endpoint to get users count
export const getUsersCount = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    res.json({
      success: true,
      usersCount
    });
  } catch (error) {
    console.error('Error getting users count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get users count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};