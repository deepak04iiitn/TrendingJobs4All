import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createInterviewQuestion, getInterviewQuestions, getInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion, likeInterviewQuestion, dislikeInterviewQuestion } from '../controllers/interviewQuestion.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createInterviewQuestion);
router.get('/get', getInterviewQuestions);
router.get('/get/:id', getInterviewQuestion);
router.post('/update/:id', verifyToken, updateInterviewQuestion);
router.delete('/delete/:id', verifyToken, deleteInterviewQuestion);
router.post('/like/:id', verifyToken, likeInterviewQuestion);
router.post('/dislike/:id', verifyToken, dislikeInterviewQuestion);

export default router; 