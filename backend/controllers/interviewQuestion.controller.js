import InterviewQuestion from '../models/interviewQuestion.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const createInterviewQuestion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to create interview questions'));
    }

    const { topic, description, questions } = req.body;
    if (!topic || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const newInterviewQuestion = new InterviewQuestion({
      topic,
      description,
      questions,
      userRef: req.user.id,
    });

    const savedQuestion = await newInterviewQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    next(error);
  }
};

export const getInterviewQuestions = async (req, res, next) => {
  try {
    const { topic, sort = 'createdAt', order = 'desc', search } = req.query;
    let query = {};

    if (topic) {
      query.topic = { $regex: topic, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'questions.question': { $regex: search, $options: 'i' } },
        { 'questions.answer': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const questions = await InterviewQuestion.find(query)
      .sort(sortOptions)
      .populate('userRef', 'username profilePicture');

    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

export const getInterviewQuestion = async (req, res, next) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id)
      .populate('userRef', 'username profilePicture');
    
    if (!question) {
      return next(errorHandler(404, 'Question not found'));
    }

    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

export const updateInterviewQuestion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to update interview questions'));
    }

    const question = await InterviewQuestion.findById(req.params.id);
    if (!question) {
      return next(errorHandler(404, 'Question not found'));
    }

    const { topic, description, questions } = req.body;
    if (!topic || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const updatedQuestion = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      {
        topic,
        description,
        questions,
      },
      { new: true }
    );

    res.status(200).json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

export const deleteInterviewQuestion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete interview questions'));
    }

    const question = await InterviewQuestion.findById(req.params.id);
    if (!question) {
      return next(errorHandler(404, 'Question not found'));
    }

    await InterviewQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json('Question has been deleted');
  } catch (error) {
    next(error);
  }
};

export const likeInterviewQuestion = async (req, res, next) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id);
    if (!question) {
      return next(errorHandler(404, 'Question not found'));
    }

    const userIndex = question.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      question.likes.push(req.user.id);
      question.numberOfLikes += 1;
      
      // Remove from dislikes if present
      const dislikeIndex = question.dislikes.indexOf(req.user.id);
      if (dislikeIndex !== -1) {
        question.dislikes.splice(dislikeIndex, 1);
        question.numberOfDislikes -= 1;
      }
    } else {
      question.likes.splice(userIndex, 1);
      question.numberOfLikes -= 1;
    }

    await question.save();
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

export const dislikeInterviewQuestion = async (req, res, next) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id);
    if (!question) {
      return next(errorHandler(404, 'Question not found'));
    }

    const userIndex = question.dislikes.indexOf(req.user.id);
    if (userIndex === -1) {
      question.dislikes.push(req.user.id);
      question.numberOfDislikes += 1;
      
      // Remove from likes if present
      const likeIndex = question.likes.indexOf(req.user.id);
      if (likeIndex !== -1) {
        question.likes.splice(likeIndex, 1);
        question.numberOfLikes -= 1;
      }
    } else {
      question.dislikes.splice(userIndex, 1);
      question.numberOfDislikes -= 1;
    }

    await question.save();
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
}; 