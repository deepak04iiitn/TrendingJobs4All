import Salary from "../models/salary.model.js";
import { errorHandler } from "../utils/error.js";

export const createSalary = async(req, res, next) => {
    const { 
        education,
        yearsOfExperience,
        priorExperience,
        company,
        position,
        location,
        salary,
        relocationSigningBonus,
        stockBonus,
        bonus,
        ctc,
        benefits,
        otherDetails,
        userRef,
        linkedin
    } = req.body;

    // Check required fields
    const requiredFields = [
        'education',
        'yearsOfExperience',
        'priorExperience',
        'company',
        'position',
        'location',
        'salary',
        'ctc',
        'benefits',
        'userRef'
    ];

    for (const field of requiredFields) {
        if (!req.body[field] || req.body[field] === '') {
            return next(errorHandler(400, `${field} is required!`));
        }
    }

    if(!userRef || userRef === '') {
        return next(errorHandler(401, 'Please sign in to continue!'));
    }

    const newSalary = new Salary({
        education,
        yearsOfExperience,
        priorExperience,
        company,
        position,
        location,
        salary,
        relocationSigningBonus,
        stockBonus,
        bonus,
        ctc,
        benefits,
        otherDetails,
        userRef,
        linkedin
    });

    try {
        await newSalary.save();
        res.status(201).json(newSalary);
    } catch (error) {
        next(error);
    }
}

export const getsalary = async(req, res, next) => {
    try {
        const { sortConfig = 'createdAt-desc' } = req.query;
        let sortOptions = {};

        switch (sortConfig) {
            case 'ctc-desc':
                sortOptions = { ctc: -1 };
                break;
            case 'ctc-asc':
                sortOptions = { ctc: 1 };
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

        const salaries = await Salary.find().sort(sortOptions);
        res.status(200).json(salaries);
    } catch (error) {
        next(error);
    }
}

export const likeSalary = async (req, res, next) => {
    try {
        const salaryRecord = await Salary.findById(req.params.salaryId);

        if (!salaryRecord) {
            return next(errorHandler(404, 'Salary record not found'));
        }

        if (!salaryRecord.likes) {
            salaryRecord.likes = [];
            salaryRecord.numberOfLikes = 0;
        }
        if (!salaryRecord.dislikes) {
            salaryRecord.dislikes = [];
            salaryRecord.numberOfDislikes = 0;
        }

        const userId = req.user.id;

        if (!salaryRecord.likes.includes(userId)) {
            salaryRecord.likes.push(userId);
            salaryRecord.numberOfLikes += 1;

            const dislikeIndex = salaryRecord.dislikes.indexOf(userId);
            if (dislikeIndex !== -1) {
                salaryRecord.dislikes.splice(dislikeIndex, 1);
                salaryRecord.numberOfDislikes -= 1;
            }

            await salaryRecord.save();
            res.status(200).json({ 
                message: 'Salary record liked successfully', 
                likes: salaryRecord.numberOfLikes, 
                dislikes: salaryRecord.numberOfDislikes 
            });
        } else {
            res.status(400).json({ message: 'You have already liked this salary record' });
        }
    } catch (error) {
        next(error);
    }
}

export const dislikeSalary = async (req, res, next) => {
    try {
        const salaryRecord = await Salary.findById(req.params.salaryId);

        if (!salaryRecord) {
            return next(errorHandler(404, 'Salary record not found'));
        }

        if (!salaryRecord.likes) {
            salaryRecord.likes = [];
            salaryRecord.numberOfLikes = 0;
        }
        if (!salaryRecord.dislikes) {
            salaryRecord.dislikes = [];
            salaryRecord.numberOfDislikes = 0;
        }

        const userId = req.user.id;

        if (!salaryRecord.dislikes.includes(userId)) {
            salaryRecord.dislikes.push(userId);
            salaryRecord.numberOfDislikes += 1;

            const likeIndex = salaryRecord.likes.indexOf(userId);
            if (likeIndex !== -1) {
                salaryRecord.likes.splice(likeIndex, 1);
                salaryRecord.numberOfLikes -= 1;
            }

            await salaryRecord.save();
            res.status(200).json({ 
                message: 'Salary record disliked successfully', 
                likes: salaryRecord.numberOfLikes, 
                dislikes: salaryRecord.numberOfDislikes 
            });
        } else {
            res.status(400).json({ message: 'You have already disliked this salary record' });
        }
    } catch (error) {
        next(error);
    }
}


export const deleteSal = async(req, res, next) => {
    try {
        
        if (!req.user.isUserAdmin && req.user.id !== req.params.salId) {
            return next(errorHandler(403, 'You are not allowed to delete this salary structure!'));
        }
  
        
        const salToDelete = await Salary.findById(req.params.salId);
        if (salToDelete.isUserAdmin) {
            return next(errorHandler(403, 'Admin account cannot be deleted!'));
        }
  
        await Salary.findByIdAndDelete(req.params.salId);
        res.status(200).json('Salary Structure has been deleted!');
    } catch (error) {
        next(error);
    }
  }


export const getSalaryById = async (req, res, next) => {
    try {
        const salary = await Salary.findById(req.params.salId);
        
        if (!salary) {
            return next(errorHandler(404, 'Salary not found!'));
        }

        res.status(200).json(salary);
    } catch (error) {
        next(error);
    }
}