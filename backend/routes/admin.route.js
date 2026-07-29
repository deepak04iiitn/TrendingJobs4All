import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import { statistics, overview } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/statistics', verifyToken, verifyAdmin, statistics);
router.get('/overview', verifyToken, verifyAdmin, overview);

export default router;
