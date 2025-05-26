import InterviewExperience from "../models/interview.model.js";
import { errorHandler } from "../utils/error.js";

export const createExperience = async(req, res, next) => {

    const { fullName, company, position, experience, yoe, verdict, rating, userRef, linkedin } = req.body;

    if (!fullName || !company || !position || !experience || !yoe || !verdict || !rating || 
        fullName === '' || company === '' || position === '' || experience === '' || yoe === '' || verdict === '' || rating === '') {
        return next(errorHandler(400, 'All fields are required!'));
    }

    if(!userRef || userRef === '') {
        return next(errorHandler(401, 'Please sign in to continue!'));
    }

    const newExperience = new InterviewExperience({
        fullName,
        company,
        position,
        experience,
        yoe,
        verdict,
        rating,
        linkedin,
        userRef
    });

    try {
        await newExperience.save();
        res.status(201).json(newExperience);
    } catch (error) {
        next(error);
    }
}

export const getExperiences = async(req, res, next) => {
    try {
        const experiences = await InterviewExperience.find().sort({ createdAt: -1 });
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
            res.status(200).json({ message: 'Experience liked successfully', likes: experience.numberOfLikes, dislikes: experience.numberOfDislikes });
        } else {
            res.status(400).json({ message: 'You have already liked this experience' });
        }
    } catch (error) {
        next(error);
    }
}

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
            res.status(200).json({ message: 'Experience disliked successfully', likes: experience.numberOfLikes, dislikes: experience.numberOfDislikes });
        } else {
            res.status(400).json({ message: 'You have already disliked this experience' });
        }
    } catch (error) {
        next(error);
    }
}


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

  