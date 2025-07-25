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
    min_exp: String,
    company: String,
    location: [String],
    jd: String,
    date: String,
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

// Routes
app.get('/backend/naukri', cacheMiddleware, async (req, res) => {
  try {
    const data = await Naukri.find()
      .lean()
      .sort({ date: -1 }); // Sort by latest date
    
    const key = `jobs:${req.originalUrl}`;
    cacheResponse(key, data);
    res.json(data);
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
    const data = await Naukri.find().lean();
    const job = data.find((d) => d._id.toString() === id);
    const key = `jobs:${req.originalUrl}`;

    if (job) {
      cacheResponse(key, job);
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error('Error fetching job data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
