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

// Get all saved jobs for a user
export const getSavedJobs = async (req, res) => {
    const { userId } = req.params;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const savedJobs = await SavedJob.find({ userId: userObjectId })
            .sort({ time: -1 }) // Sort by time in descending order (newest first)
            .exec();

        res.json(savedJobs);
    } catch (err) {
        console.error('Error fetching saved jobs:', err);
        res.status(500).json({ 
            message: 'Failed to fetch saved jobs', 
            error: err.message 
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

        // Find and delete by userId and the saved job's _id (not the original jobId)
        const deletedJob = await SavedJob.findOneAndDelete({ 
            userId: userObjectId, 
            _id: jobObjectId 
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