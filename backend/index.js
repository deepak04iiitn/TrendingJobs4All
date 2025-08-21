import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import commentRoutes from './routes/comment.route.js';
import savedJobsRoutes from './routes/savedJobs.route.js';
import pollRoutes from './routes/poll.route.js';
import interviewsRoutes from './routes/interview.route.js';
import referralRoutes from './routes/referral.route.js';
import salaryRoutes from './routes/salary.route.js';
import templateRoutes from './routes/template.route.js';
import interviewCommentRoutes from './routes/interviewComment.route.js';
import referralCommentRoutes from './routes/referralComment.route.js';
import salaryCommentRoutes from './routes/salaryComment.route.js';
import resumeCommentRoutes from './routes/resumeComment.route.js';
import testimonialRoutes from './routes/testimonial.route.js';
import adminRoutes from './routes/admin.route.js';
import interviewQuestionRoutes from './routes/interviewQuestion.route.js';
import interviewQuestionCommentRoutes from './routes/interviewQuestionComment.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import resumeRoutes from './routes/resumeRoutes.js';
import './utils/cloudinary.js';

dotenv.config();

mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log('MongoDB is connected!');
    })
    .catch((err) => {
        console.log(err);
    });

const __dirname = path.resolve();
const app = express();

// Configure CORS with specific options
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Middleware for error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error!';
    console.error('Error:', err);  // Add logging
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Mongoose schemas and models with indexing
const JobSchema = new mongoose.Schema({
    job_title: String,
    min_exp: mongoose.Schema.Types.Mixed, // stored as string/number in source, support both
    company: String,
    location: [String],
    jd: String,
    full_jd: String,
    date: String, // some records may have this as string
    time: Date,   // some records may have this as Date
    apply_link: String,
    category: String,
});

// Adding indexes for optimization
JobSchema.index({ company: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ min_exp: 1 });
JobSchema.index({ jd: 1 });
JobSchema.index({ apply_link: 1 });
JobSchema.index({ job_title: 1 });
JobSchema.index({ date: -1 });
JobSchema.index({ time: -1 });

const Naukri = mongoose.model('Naukri', JobSchema, 'naukri');

const PremiumSchema = new mongoose.Schema({
    prem_email: String,
});

const Premium = mongoose.model('Premium', PremiumSchema, 'premium');

// In-memory cache configuration
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  const key = `jobs:${req.originalUrl}`;
  const cachedData = cache.get(key);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return res.json(cachedData.data);
  }
  next();
};

// Cache response middleware
const cacheResponse = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Clear cache middleware
const clearCache = () => {
  cache.clear();
};

app.use('/backend/user', userRoutes);
app.use('/backend/auth', authRoutes);
app.use('/backend/comment', commentRoutes);
app.use('/backend/saved-jobs', savedJobsRoutes);
app.use('/backend/polls', pollRoutes);
app.use('/backend/interviews', interviewsRoutes);
app.use('/backend/referrals', referralRoutes);
app.use('/backend/salary', salaryRoutes);
app.use('/backend/resumeTemplates', templateRoutes);
app.use('/backend/interviewComments', interviewCommentRoutes);
app.use('/backend/referralComments', referralCommentRoutes);
app.use('/backend/salaryComments', salaryCommentRoutes);
app.use('/backend/resumeComments', resumeCommentRoutes);
app.use('/backend/testimonials', testimonialRoutes);
app.use('/backend/admin', adminRoutes);
app.use('/backend/resume', resumeRoutes);
app.use('/backend/interview-questions', interviewQuestionRoutes);
app.use('/backend/interview-question-comments', interviewQuestionCommentRoutes);


app.get('/backend/ping', (req, res) => {
  res.status(200).send('pong');
});


// Routes
app.get('/backend/naukri', cacheMiddleware, async (req, res) => {
  try {
    const {
      page: pageParam,
      limit: limitParam,
      search,
      exp,
      date,
      category,
    } = req.query;

    // If no pagination or filters requested, maintain backward compatibility (return all)
    const shouldReturnAll = !pageParam && !limitParam && !search && !exp && !date && !category;

    // BASE FILTER - Always exclude jobs without valid apply_links
    const baseFilter = {
      $and: [
        { apply_link: { $exists: true, $ne: null, $ne: '' } },
        { apply_link: { $ne: 'Not Found' } },
        { apply_link: { $ne: 'about:blank' } },
        { apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } } },
        { apply_link: { $regex: /^https?:\/\/.+\..+/i } }, // Must be a valid URL with domain
        { apply_link: { $not: { $regex: /^https?:\/\/(localhost|127\.0\.0\.1|example\.com)/i } } } // Exclude test URLs
      ]
    };

    if (shouldReturnAll) {
      const data = await Naukri.find(baseFilter)
        .lean()
        .sort({ time: -1, date: -1 });
      const key = `jobs:${req.originalUrl}`;
      cacheResponse(key, data);
      return res.json(data);
    }

    const page = Math.max(parseInt(pageParam || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 50);

    // Start with base filter and add additional filters
    const filter = { ...baseFilter };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { job_title: regex },
        { company: regex },
        { jd: regex },
        { full_jd: regex },
        { location: regex },
      ];
    }

    if (exp !== undefined && exp !== '') {
      const expNum = Number(exp);
      if (!Number.isNaN(expNum)) {
        // If we already have $or from search, we need to combine them properly
        const expConditions = [
          { min_exp: exp },
          { min_exp: expNum },
          { min_exp: { $in: [String(expNum), expNum] } },
        ];
        
        if (filter.$or) {
          // Combine search $or with exp $or using $and
          filter.$and = [
            { $or: filter.$or },
            { $or: expConditions }
          ];
          delete filter.$or;
        } else {
          filter.$or = expConditions;
        }
      }
    }

    if (category) {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (date) {
      const start = new Date(date);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        // support both 'time' Date and 'date' string formats
        const dateCondition = {
          $or: [
            { time: { $gte: start, $lt: end } },
            { date: { $regex: `^${date}` } },
          ],
        };
        
        if (filter.$and) {
          filter.$and.push(dateCondition);
        } else {
          filter.$and = [dateCondition];
        }
      }
    }

    const [total, items] = await Promise.all([
      Naukri.countDocuments(filter),
      Naukri.find(filter)
        .lean()
        .sort({ time: -1, date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;
    const response = { items, total, page, totalPages, limit };

    const key = `jobs:${req.originalUrl}`;
    cacheResponse(key, response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/backend/premium', async (req, res) => {
    try {
        const data = await Premium.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data: ' + err.message });
    }
});

app.get('/backend/naukri/:url/:id', cacheMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Naukri.findById(id).lean();
    const key = `jobs:${req.originalUrl}`;
    if (job) {
      cacheResponse(key, job);
      return res.json(job);
    }
    return res.status(404).json({ message: 'Job not found' });
  } catch (error) {
    console.error('Error fetching job data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// // Add this temporary debug route to your backend to check what's in your database
// app.get('/backend/debug/apply-links', async (req, res) => {
//   try {
//     // Get a sample of unique apply_link values
//     const uniqueApplyLinks = await Naukri.aggregate([
//       { $group: { _id: "$apply_link", count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//       { $limit: 20 }
//     ]);
    
//     console.log('Unique apply_link values:', uniqueApplyLinks);
//     res.json(uniqueApplyLinks);
//   } catch (error) {
//     console.error('Debug error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Also add this route to test your filter
// app.get('/backend/debug/filter-test', async (req, res) => {
//   try {
//     const baseFilter = {
//       $and: [
//         { apply_link: { $exists: true, $ne: null, $ne: '' } },
//         { apply_link: { $ne: 'Not Found' } },
//         { apply_link: { $ne: 'about:blank' } },
//         { apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } } },
//         { apply_link: { $regex: /^https?:\/\/.+\..+/i } }, // Must be a valid URL with domain
//         { apply_link: { $not: { $regex: /^https?:\/\/(localhost|127\.0\.0\.1|example\.com)/i } } } // Exclude test URLs
//       ]
//     };
    
//     const totalJobs = await Naukri.countDocuments({});
//     const filteredJobs = await Naukri.countDocuments(baseFilter);
//     const excludedJobs = totalJobs - filteredJobs;
//     const sampleFiltered = await Naukri.find(baseFilter).limit(5);
    
//     // Get some excluded jobs to verify filter is working
//     const sampleExcluded = await Naukri.find({
//       $or: [
//         { apply_link: 'Not Found' },
//         { apply_link: 'about:blank' },
//         { apply_link: { $regex: /invalid-url|\/404\//i } }
//       ]
//     }).limit(5);
    
//     res.json({
//       totalJobs,
//       filteredJobs,
//       excludedJobs,
//       sampleFiltered: sampleFiltered.map(job => ({
//         _id: job._id,
//         job_title: job.job_title,
//         apply_link: job.apply_link
//       })),
//       sampleExcluded: sampleExcluded.map(job => ({
//         _id: job._id,
//         job_title: job.job_title,
//         apply_link: job.apply_link
//       }))
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Webhook endpoint for cache invalidation
app.post('/backend/webhook/jobs-update', async (req, res) => {
  try {
    clearCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Error clearing cache' });
  }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Sync indexes to ensure they are applied
Naukri.syncIndexes();

// Cron job to delete jobs older than 1 month (runs daily at midnight)
cron.schedule('0 0 * * *', async () => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const result = await Naukri.deleteMany({ time: { $lt: oneMonthAgo } });
        if (result.deletedCount > 0) {
            console.log(`Cron Job: Deleted ${result.deletedCount} jobs older than 1 month.`);
        }
    } catch (error) {
        console.error('Cron Job Error (deleting old jobs):', error);
    }
});

// Function to delete jobs older than 1 month
async function deleteOldJobs() {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const result = await Naukri.deleteMany({ time: { $lt: oneMonthAgo } });
        if (result.deletedCount > 0) {
            console.log(`Manual Run: Deleted ${result.deletedCount} jobs older than 1 month.`);
        } else {
            console.log('Manual Run: No jobs older than 1 month to delete.');
        }
    } catch (error) {
        console.error('Manual Run Error (deleting old jobs):', error);
    } finally {
        mongoose.connection.close();
    }
}

// If run with 'run-cron' argument, execute the deletion immediately and exit
if (process.argv[2] === 'run-cron') {
    deleteOldJobs();
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});