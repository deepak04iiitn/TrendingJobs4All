import SavedJob from '../models/SavedJob.model.js';
import mongoose from 'mongoose';

// Save a job for a user
export const saveJob = async (req, res) => {
    const { userId } = req.params;
    const { jobId, title, company, location, min_exp, full_jd, apply_link, time } = req.body;

    try {
        // Validate required fields
        if (!jobId || !title || !company || !location || min_exp === undefined || !full_jd || !apply_link) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { jobId, title, company, location, min_exp, full_jd: !!full_jd, apply_link }
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid jobId format' });
        }

        // Convert userId and jobId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const jobObjectId = new mongoose.Types.ObjectId(jobId);

        // Check if the job is already saved by this user
        const existingJob = await SavedJob.findOne({ 
            userId: userObjectId, 
            jobId: jobObjectId 
        });
        
        if (existingJob) {
            return res.status(400).json({ message: 'Job is already saved' });
        }

        // Ensure location is an array
        const locationArray = Array.isArray(location) ? location : [location];

        // Validate and parse time
        let parsedTime = new Date();
        if (time) {
            parsedTime = new Date(time);
            if (isNaN(parsedTime.getTime())) {
                parsedTime = new Date(); // Fallback to current time if invalid
            }
        }

        // Create the saved job
        const savedJob = new SavedJob({
            userId: userObjectId,
            jobId: jobObjectId,
            title: String(title),
            company: String(company),
            location: locationArray,
            min_exp: Number(min_exp),
            full_jd: String(full_jd),
            apply_link: String(apply_link),
            time: parsedTime
        });

        // Save to database
        const result = await savedJob.save();

        res.status(201).json({
            message: 'Job saved successfully',
            data: result
        });

    } catch (err) {
        console.error('Error saving job:', err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        // Handle duplicate key errors
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: 'Job is already saved by this user' 
            });
        }

        res.status(500).json({ 
            message: 'Failed to save the job', 
            error: err.message 
        });
    }
};

// Get saved jobs for a user (server-side pagination)
export const getSavedJobs = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const search = String(req.query.search || '').trim();

        const query = { userId: userObjectId };

        // Optional exact job lookup (e.g. Full JD "is saved?" check)
        const jobIdFilter = String(req.query.jobId || '').trim();
        if (jobIdFilter && mongoose.Types.ObjectId.isValid(jobIdFilter)) {
            query.jobId = new mongoose.Types.ObjectId(jobIdFilter);
        }

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            query.$or = [
                { title: regex },
                { company: regex },
                { location: regex },
            ];
        }

        const total = await SavedJob.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * limit;

        const items = await SavedJob.find(query)
            .sort({ time: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        res.json({
            items,
            total,
            page: safePage,
            limit,
            totalPages,
        });
    } catch (err) {
        console.error('Error fetching saved jobs:', err);
        res.status(500).json({
            message: 'Failed to fetch saved jobs',
            error: err.message,
        });
    }
};

// Delete a saved job for a user
export const deleteSavedJob = async (req, res) => {
    const { userId, jobId } = req.params;

    try {
        // Validate ObjectId formats
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid jobId format' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const jobObjectId = new mongoose.Types.ObjectId(jobId);

        // Accept either the SavedJob document _id or the original jobId
        const deletedJob = await SavedJob.findOneAndDelete({
            userId: userObjectId,
            $or: [{ _id: jobObjectId }, { jobId: jobObjectId }],
        });

        if (!deletedJob) {
            return res.status(404).json({ message: 'Saved job not found' });
        }

        res.json({ 
            message: 'Job removed successfully',
            deletedJob: deletedJob
        });
    } catch (err) {
        console.error('Error removing job:', err);
        res.status(500).json({ 
            message: 'Failed to remove job', 
            error: err.message 
        });
    }
};