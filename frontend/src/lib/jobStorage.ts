export interface Job {
    _id: string;
    title: string;
    company: string;
    location?: string;
    url?: string;
    status: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
    dateApplied?: string;
    source: string;
    createdAt: string;
    salary?: string;
    notes?: string;
    jdText?: string;
    resumeFile?: {
        filename: string;
        contentType: string;
        size: number;
        data: string;
        uploadedAt: string;
    };
}

const STORAGE_KEY = 'job-tracker-offline-jobs';

export const getLocalJobs = (): Job[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to read local jobs', e);
        return [];
    }
};

export const saveLocalJobs = (jobs: Job[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
        console.error('Failed to save local jobs', e);
    }
};

export const addLocalJob = (job: Job) => {
    const jobs = getLocalJobs();
    jobs.push(job);
    saveLocalJobs(jobs);
};

export const updateLocalJob = (updatedJob: Job) => {
    const jobs = getLocalJobs();
    const index = jobs.findIndex(j => j._id === updatedJob._id);
    if (index !== -1) {
        jobs[index] = updatedJob;
        saveLocalJobs(jobs);
    }
};

export const deleteLocalJob = (id: string) => {
    const jobs = getLocalJobs();
    const filtered = jobs.filter(j => j._id !== id);
    saveLocalJobs(filtered);
};
