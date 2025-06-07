import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createComment, getComments, likeComment, editComment, deleteComment } from '../controllers/interviewQuestionComment.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/get/:questionId', getComments);
router.post('/like/:commentId', verifyToken, likeComment);
router.post('/edit/:commentId', verifyToken, editComment);
router.delete('/delete/:commentId', verifyToken, deleteComment);

export default router; 