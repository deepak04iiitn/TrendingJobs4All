import express from 'express';
import {deleteUser, getUser, getUserInterviews, getusers, getUserSalary, signout, test, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test' , test);
router.get('/getusers', verifyToken, getusers);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/interviews/:expId', verifyToken, getUserInterviews);
router.get('/salary/:salId', verifyToken, getUserSalary);
router.get('/:userId', verifyToken, getUser);

export default router;