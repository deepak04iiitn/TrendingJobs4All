import InterviewQuestionComment from '../models/interviewQuestionComment.model.js';
import { errorHandler } from '../utils/error.js';

export const createComment = async (req, res, next) => {
  try {
    const { content, questionId } = req.body;
    if (!content || !questionId) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const newComment = new InterviewQuestionComment({
      content,
      questionId,
      userId: req.user.id,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await InterviewQuestionComment.find({ questionId: req.params.questionId })
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await InterviewQuestionComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.likes.push(req.user.id);
      comment.numberOfLikes += 1;
    } else {
      comment.likes.splice(userIndex, 1);
      comment.numberOfLikes -= 1;
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await InterviewQuestionComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId !== req.user.id) {
      return next(errorHandler(403, 'You are not allowed to edit this comment'));
    }

    const { content } = req.body;
    if (!content) {
      return next(errorHandler(400, 'Content is required'));
    }

    const updatedComment = await InterviewQuestionComment.findByIdAndUpdate(
      req.params.commentId,
      { content },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await InterviewQuestionComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }

    if (comment.userId !== req.user.id) {
      return next(errorHandler(403, 'You are not allowed to delete this comment'));
    }

    await InterviewQuestionComment.findByIdAndDelete(req.params.commentId);
    res.status(200).json('Comment has been deleted');
  } catch (error) {
    next(error);
  }
}; 