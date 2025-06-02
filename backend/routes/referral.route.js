import express from 'express';
import { createReferral, deleteRef, dislikeReferral, getReferralById, getReferrals, likeReferral } from '../controllers/referral.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/createReferral', verifyToken, createReferral);
router.get('/getReferral', getReferrals);
router.get('/getReferral/:refId', getReferralById);
router.put('/likeReferral/:refId' , verifyToken , likeReferral);                  
router.put('/dislikeReferral/:refId' , verifyToken , dislikeReferral);
router.delete('/delete/:refId', verifyToken, deleteRef);

export default router;