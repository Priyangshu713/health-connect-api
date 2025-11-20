import express from 'express';
import { registerUser, loginUser, getAlldoctor } from '../Controller/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getAlldoctor', getAlldoctor);

export default router;
