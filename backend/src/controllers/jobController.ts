import { Request, Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Local persistence for development mode when DB is disconnected
const MOCK_DATA_PATH = path.join(__dirname, '../../mock_jobs.json');

const loadMockJobs = () => {
    try {
        if (fs.existsSync(MOCK_DATA_PATH)) {
            const data = fs.readFileSync(MOCK_DATA_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.warn('Failed to load mock jobs from file, using defaults');
    }
    return [
        {
            _id: '1',
            userId: '507f1f77bcf86cd799439011',
            title: 'Senior Frontend Engineer',
            company: 'Google',
            location: 'Mountain View, CA',
            status: 'interviewing',
            dateApplied: new Date('2023-11-15'),
            source: 'linkedin',
            createdAt: new Date(),
            updatedAt: new Date(),
            salary: '$180k - $220k',
            notes: [{ text: 'Referral from Sarah', date: new Date() }],
            jdText: 'We are looking for a Senior Frontend Engineer...'
        },
        {
            _id: '2',
            userId: '507f1f77bcf86cd799439011',
            title: 'Full Stack Developer',
            company: 'Netflix',
            location: 'Los Gatos, CA',
            status: 'offer',
            dateApplied: new Date('2023-11-10'),
            source: 'indeed',
            createdAt: new Date(),
            updatedAt: new Date(),
            salary: '$200k+',
            notes: [],
            jdText: ''
        }
    ];
};

let mockJobs: any[] = loadMockJobs();

const saveMockJobs = () => {
    try {
        fs.writeFileSync(MOCK_DATA_PATH, JSON.stringify(mockJobs, null, 2));
    } catch (err) {
        console.warn('Failed to save mock jobs to file');
    }
};

export const getJobs = async (req: Request, res: Response) => {
    const { userId } = (req as AuthRequest).user!;
    const { status, company, sort } = req.query;

    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');

        const query: any = { userId };
        if (status) query.status = status;
        if (company) query.company = { $regex: company, $options: 'i' };

        let jobs = Job.find(query);
        if (sort === 'date') jobs = jobs.sort({ dateApplied: -1 });
        else jobs = jobs.sort({ updatedAt: -1 });

        const result = await jobs.exec();
        res.status(200).json(result);
    } catch (error) {
        console.warn('DB disconnected or error, using mock fallback');
        let jobs = [...mockJobs];
        if (userId) jobs = jobs.filter(j => j.userId === userId);
        if (status) jobs = jobs.filter(j => j.status === status);
        if (company) jobs = jobs.filter(j => j.company.toLowerCase().includes((company as string).toLowerCase()));
        res.status(200).json(jobs);
    }
};

export const createJob = async (req: Request, res: Response) => {
    const { userId } = (req as AuthRequest).user!;
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const job = await Job.create({ ...req.body, userId });
        res.status(201).json(job);
    } catch (error) {
        console.warn('DB error, saving to memory');
        const newJob = { ...req.body, userId, _id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
        mockJobs.push(newJob);
        saveMockJobs();
        res.status(201).json(newJob);
    }
};

export const updateJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        const job = await Job.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(job);
    } catch (error) {
        console.warn('DB error, updating memory');
        const index = mockJobs.findIndex(j => j._id === id);
        if (index !== -1) {
            mockJobs[index] = { ...mockJobs[index], ...req.body, updatedAt: new Date() };
            saveMockJobs();
            res.status(200).json(mockJobs[index]);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
};

export const deleteJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (mongoose.connection.readyState !== 1) throw new Error('DB not connected');
        await Job.findByIdAndDelete(id);
        res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        console.warn('DB error, deleting from memory');
        const index = mockJobs.findIndex(j => j._id === id);
        if (index !== -1) {
            mockJobs.splice(index, 1);
            saveMockJobs();
            res.status(200).json({ message: 'Job deleted' });
        } else {
            res.status(404).json({ message: 'Job not found in memory' });
        }
    }
};

export const saveExtensionJob = async (req: Request, res: Response) => {
    const { userId } = (req as AuthRequest).user!;
    const { job } = req.body;

    const isDbConnected = mongoose.connection.readyState === 1;

    try {
        if (!isDbConnected) throw new Error('DB not connected');

        const newJob = await Job.create({
            ...job,
            userId,
            source: job.source || 'manual',
        });
        res.status(201).json(newJob);
    } catch (error) {
        console.warn('Extension save failed, using mock fallback');
        const mockJob = {
            ...job,
            userId,
            _id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            source: job.source || 'extension'
        };
        mockJobs.push(mockJob);
        saveMockJobs();
        res.status(201).json(mockJob);
    }
};
