import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { statistics } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/statistics' , verifyToken , statistics);

export default router;