import express from 'express';
import { getJobs, createJob, updateJob, deleteJob, saveExtensionJob } from '../controllers/jobController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/extension/save', saveExtensionJob);

export default router;
