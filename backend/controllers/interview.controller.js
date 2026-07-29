import InterviewExperience from "../models/interview.model.js";
import { errorHandler } from "../utils/error.js";
import { clearSitemapCache } from "./sitemap.controller.js";
import { clearLLMSCache } from "./llms.controller.js";

export const createExperience = async(req, res, next) => {

    const { fullName, company, position, experience, yoe, verdict, rating, userRef, linkedin } = req.body;

    // Validate required fields only (fullName, yoe, and verdict are optional)
    if (!company || !position || !experience || !rating || 
        company === '' || position === '' || experience === '' || rating === '') {
        return next(errorHandler(400, 'Company, Position, Experience, and Rating are required!'));
    }

    // Set default values for optional fields if not provided
    const submissionData = {
        fullName: (fullName && fullName.trim()) || 'Anonymous',
        yoe: yoe ? Number(yoe) : 0,
        verdict: verdict || 'N/A',
        company,
        position,
        experience,
        rating,
        linkedin,
        userRef
    };

    if(!userRef || userRef === '') {
        return next(errorHandler(401, 'Please sign in to continue!'));
    }

    const newExperience = new InterviewExperience({
        fullName: submissionData.fullName,
        company: submissionData.company,
        position: submissionData.position,
        experience: submissionData.experience,
        yoe: submissionData.yoe,
        verdict: submissionData.verdict,
        rating: submissionData.rating,
        linkedin: submissionData.linkedin,
        userRef: submissionData.userRef
    });

    try {
        await newExperience.save();
        clearSitemapCache(); // Clear sitemap cache when new content is added
        clearLLMSCache(); // Clear llms cache when new content is added
        res.status(201).json(newExperience);
    } catch (error) {
        next(error);
    }
}

export const getExperiences = async(req, res, next) => {
    try {
        const { sortConfig = 'createdAt-desc', search, page, limit } = req.query;
        let sortOptions = {};

        switch (sortConfig) {
            case 'rating-desc':
                sortOptions = { rating: -1 };
                break;
            case 'rating-asc':
                sortOptions = { rating: 1 };
                break;
            case 'likes-desc':
                sortOptions = { numberOfLikes: -1 };
                break;
            case 'likes-asc':
                sortOptions = { numberOfLikes: 1 };
                break;
            case 'dislikes-desc':
                sortOptions = { numberOfDislikes: -1 };
                break;
            case 'dislikes-asc':
                sortOptions = { numberOfDislikes: 1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        const filter = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ company: regex }, { position: regex }];
        }

        // Admin/paginated shape only when page or limit is explicitly requested,
        // so the public interview-experiences page (which expects a bare array) is unaffected.
        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
            const skip = (pageNum - 1) * limitNum;

            const [items, total] = await Promise.all([
                InterviewExperience.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
                InterviewExperience.countDocuments(filter),
            ]);

            return res.status(200).json({ items, total, page: pageNum, limit: limitNum });
        }

        const experiences = await InterviewExperience.find(filter).sort(sortOptions);
        res.status(200).json(experiences);
    } catch (error) {
        next(error);
    }
}

export const likeExperience = async (req, res, next) => {
    try {
        const experience = await InterviewExperience.findById(req.params.expId);

        if (!experience) {
            return next(errorHandler(404, 'Experience not found'));
        }

        const userId = req.user.id;

        if (!experience.likes.includes(userId)) {
            experience.likes.push(userId);
            experience.numberOfLikes += 1;

            const dislikeIndex = experience.dislikes.indexOf(userId);
            if (dislikeIndex !== -1) {
                experience.dislikes.splice(dislikeIndex, 1);
                experience.numberOfDislikes -= 1;
            }

            await experience.save();
            res.status(200).json({
                message: 'Experience liked successfully',
                likes: experience.numberOfLikes,
                dislikes: experience.numberOfDislikes
            });
        } else {
            res.status(400).json({ message: 'You have already liked this experience' });
        }
    } catch (error) {
        console.error('Error in likeExperience:', error);
        next(errorHandler(500, 'Failed to like experience'));
    }
};

export const dislikeExperience = async (req, res, next) => {
    try {
        const experience = await InterviewExperience.findById(req.params.expId);

        if (!experience) {
            return next(errorHandler(404, 'Experience not found'));
        }

        const userId = req.user.id;

        if (!experience.dislikes.includes(userId)) {
            experience.dislikes.push(userId);
            experience.numberOfDislikes += 1;

            const likeIndex = experience.likes.indexOf(userId);
            if (likeIndex !== -1) {
                experience.likes.splice(likeIndex, 1);
                experience.numberOfLikes -= 1;
            }

            await experience.save();
            res.status(200).json({
                message: 'Experience disliked successfully',
                likes: experience.numberOfLikes,
                dislikes: experience.numberOfDislikes
            });
        } else {
            res.status(400).json({ message: 'You have already disliked this experience' });
        }
    } catch (error) {
        console.error('Error in dislikeExperience:', error);
        next(errorHandler(500, 'Failed to dislike experience'));
    }
};

export const deleteExp = async(req, res, next) => {
    try {
        // Check if the logged-in user is either an admin or the owner of the experience
        const expToDelete = await InterviewExperience.findById(req.params.expId);

        if (!expToDelete) {
            return next(errorHandler(404, 'Experience not found!'));
        }

        // Ensure that only the user who created the experience or an admin can delete it
        if (expToDelete.userRef.toString() !== req.user.id && !req.user.isUserAdmin) {
            return next(errorHandler(403, 'You are not allowed to delete this experience!'));
        }

        await InterviewExperience.findByIdAndDelete(req.params.expId);
        clearSitemapCache(); // Clear sitemap cache when content is deleted
        clearLLMSCache(); // Clear llms cache when content is deleted

        res.status(200).json('Experience has been deleted!');
    } catch (error) {
        next(error);
    }
}

export const getExperienceById = async (req, res, next) => {
    try {
        const experience = await InterviewExperience.findById(req.params.expId);
        
        if (!experience) {
            return next(errorHandler(404, 'Experience not found!'));
        }

        res.status(200).json(experience);
    } catch (error) {
        next(error);
    }
}

  