import express from 'express';
import { googleLogin } from '../controllers/authController';

const router = express.Router();

router.post('/google', googleLogin);

export default router;
