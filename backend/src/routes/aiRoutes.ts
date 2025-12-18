import express from 'express';
import { getResumeSuggestions, getCoverLetter, getInterviewQuestions } from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.post('/resume-suggestions', getResumeSuggestions);
router.post('/cover-letter', getCoverLetter);
router.post('/interview-questions', getInterviewQuestions);

export default router;
