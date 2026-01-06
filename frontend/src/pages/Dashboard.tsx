import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Briefcase,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Building2,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import JobDetailDialog from '@/components/JobDetailDialog';

interface Job {
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
}

const Dashboard: React.FC = () => {
    const { user, logout, token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddJobOpen, setIsAddJobOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        url: '',
        status: 'applied',
        location: '',
        salary: '',
        jdText: ''
    });

    const columns = [
        { id: 'wishlist', title: 'Wishlist', color: 'bg-gray-500' },
        { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
        { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-500' },
        { id: 'offer', title: 'Offer', color: 'bg-green-500' },
        { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
    ];

    useEffect(() => {
        fetchJobs();
    }, [token]);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Only load sample placeholder data if we have absolutely nothing and the fetch failed
            if (jobs.length === 0) {
                console.log('Loading sample data as fallback...');
                setJobs([
                    {
                        _id: 'sample-1',
                        title: 'Product Designer (Sample)',
                        company: 'Linear',
                        location: 'Remote',
                        status: 'applied',
                        source: 'manual',
                        createdAt: new Date().toISOString(),
                        salary: '$140k'
                    }
                ]);
            }
        }
    };

    const handleAddJob = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/jobs`, newJob, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAddJobOpen(false);
            setNewJob({ title: '', company: '', url: '', status: 'applied', location: '', salary: '', jdText: '' });
            fetchJobs();
        } catch (error) {
            console.error('Error adding job:', error);
            // Fallback for demo
            const mockJob: Job = {
                _id: Date.now().toString(),
                ...newJob,
                status: newJob.status as any,
                source: 'manual',
                createdAt: new Date().toISOString()
            };
            setJobs([...jobs, mockJob]);
            setIsAddJobOpen(false);
        }
    };

    const handleJobClick = (job: Job) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
    };

    const getJobsByStatus = (status: string) => {
        return jobs.filter(job =>
            job.status === status &&
            (job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTotalJobs = () => jobs.length;
    const getActiveApplications = () => jobs.filter(j => j.status === 'applied' || j.status === 'interviewing').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
                            <div className="hidden md:flex items-center gap-6">
                                <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-4 pt-4">
                                    Board
                                </button>
                                <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                    Applications
                                </button>
                                <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                    Interviews
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Stats Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{getTotalJobs()}</span> Total Jobs
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <span className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{getActiveApplications()}</span> Active
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-64 h-9"
                                />
                            </div>
                            <Button size="sm" variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            <Button size="sm" onClick={() => setIsAddJobOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Job
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Job Modal */}
            {isAddJobOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Add New Job</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Job Title</label>
                                <Input
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Company</label>
                                <Input
                                    value={newJob.company}
                                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                                    placeholder="e.g. Google"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                    value={newJob.status}
                                    onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                                >
                                    <option value="wishlist">Wishlist</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Location</label>
                                    <Input
                                        value={newJob.location}
                                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                        placeholder="e.g. Remote"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Salary</label>
                                    <Input
                                        value={newJob.salary}
                                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                                        placeholder="e.g. $120k"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Job URL</label>
                                <Input
                                    value={newJob.url}
                                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                                    placeholder="https://..."
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <Textarea
                                    value={newJob.jdText}
                                    onChange={(e) => setNewJob({ ...newJob, jdText: e.target.value })}
                                    placeholder="Paste job description here..."
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddJob}>Add Job</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-5 gap-4">
                    {columns.map((column) => {
                        const columnJobs = getJobsByStatus(column.id);
                        return (
                            <div key={column.id} className="flex flex-col">
                                {/* Column Header */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {column.title}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {columnJobs.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Job Cards */}
                                <div className="space-y-3 flex-1">
                                    {columnJobs.map((job) => (
                                        <Card
                                            key={job._id}
                                            className="hover:shadow-md transition-shadow cursor-pointer border-l-4"
                                            style={{
                                                borderLeftColor: column.color.replace('bg-', '#') === '#gray-500' ? '#6b7280' :
                                                    column.color.replace('bg-', '#') === '#blue-500' ? '#3b82f6' :
                                                        column.color.replace('bg-', '#') === '#yellow-500' ? '#eab308' :
                                                            column.color.replace('bg-', '#') === '#green-500' ? '#22c55e' : '#ef4444'
                                            }}
                                            onClick={() => handleJobClick(job)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1">
                                                        {job.title}
                                                    </h4>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {job.company}
                                                    </span>
                                                </div>

                                                {job.location && (
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            {job.location}
                                                        </span>
                                                    </div>
                                                )}

                                                {job.salary && (
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            {job.salary}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(job.dateApplied || job.createdAt)}
                                                        </span>
                                                    </div>
                                                    {job.url && (
                                                        <a
                                                            href={job.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {columnJobs.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No jobs
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedJob && (
                <JobDetailDialog
                    job={selectedJob}
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    onUpdate={fetchJobs}
                />
            )}
        </div>
    );
};

export default Dashboard;
