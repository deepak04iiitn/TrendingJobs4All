import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createInterviewQuestion, getInterviewQuestions, getInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion, likeInterviewQuestion, dislikeInterviewQuestion } from '../controllers/interviewQuestion.controller.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

const router = express.Router();

// Multer memory storage for direct stream upload to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload a buffer to Cloudinary and return the secure URL
const uploadBufferToCloudinary = (buffer, folder = 'interview-answers') => {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    readable.pipe(stream);
  });
};

// Create with optional images per QA (fields: topic, description, questions JSON, files: images_0_0, images_0_1, ...)
router.post('/create', verifyToken, upload.any(), async (req, res, next) => {
  try {
    // Parse questions (may be JSON string)
    let questions = req.body.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }

    // Collect images per question index using field naming images_{qIndex}
    const files = req.files || [];
    const filesByQuestionIdx = {};
    for (const f of files) {
      // Expect fieldname like images_0 or images_1 etc (support images_0[] arrays as well)
      const match = f.fieldname.match(/^images_(\d+)/);
      if (!match) continue;
      const qIdx = Number(match[1]);
      if (!filesByQuestionIdx[qIdx]) filesByQuestionIdx[qIdx] = [];
      filesByQuestionIdx[qIdx].push(f);
    }

    // Upload buffers to Cloudinary and attach URLs
    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const qFiles = filesByQuestionIdx[i] || [];
        const urls = [];
        for (const file of qFiles) {
          const url = await uploadBufferToCloudinary(file.buffer);
          urls.push(url);
        }
        question.images = Array.isArray(question.images) ? question.images.concat(urls) : urls;
      }
    }

    req.body.questions = questions;
    return createInterviewQuestion(req, res, next);
  } catch (err) {
    return next(err);
  }
});
router.get('/get', getInterviewQuestions);
router.get('/get/:id', getInterviewQuestion);
router.post('/update/:id', verifyToken, upload.any(), async (req, res, next) => {
  try {
    let questions = req.body.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }

    const files = req.files || [];
    const filesByQuestionIdx = {};
    for (const f of files) {
      const match = f.fieldname.match(/^images_(\d+)/);
      if (!match) continue;
      const qIdx = Number(match[1]);
      if (!filesByQuestionIdx[qIdx]) filesByQuestionIdx[qIdx] = [];
      filesByQuestionIdx[qIdx].push(f);
    }

    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const qFiles = filesByQuestionIdx[i] || [];
        const urls = [];
        for (const file of qFiles) {
          const url = await uploadBufferToCloudinary(file.buffer);
          urls.push(url);
        }
        // Keep any existing URLs provided and append uploaded
        question.images = Array.isArray(question.images) ? question.images.concat(urls) : urls;
      }
    }

    req.body.questions = questions;
    return updateInterviewQuestion(req, res, next);
  } catch (err) {
    return next(err);
  }
});
router.delete('/delete/:id', verifyToken, deleteInterviewQuestion);
router.post('/like/:id', verifyToken, likeInterviewQuestion);
router.post('/dislike/:id', verifyToken, dislikeInterviewQuestion);

export default router; 