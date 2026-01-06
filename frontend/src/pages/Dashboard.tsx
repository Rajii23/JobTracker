import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Building2,
    ExternalLink,
    LogOut
} from 'lucide-react';
import axios from 'axios';
import JobDetailDialog from '@/components/JobDetailDialog';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

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

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list
        if (!destination) return;

        // Dropped in the same place
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Find the job being moved
        const jobMoved = jobs.find(j => j._id === draggableId);
        if (!jobMoved) return;

        const newStatus = destination.droppableId;

        // Optimistically update the UI
        const updatedJobs = jobs.map(job => {
            if (job._id === draggableId) {
                return { ...job, status: newStatus as any };
            }
            return job;
        });
        setJobs(updatedJobs);

        // Update backend
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/jobs/${draggableId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Failed to update job status:', error);
            // Revert changes on failure
            fetchJobs();
            alert('Failed to update job status. Please try again.');
        }
    };

    const getTotalJobs = () => jobs.length;
    const getActiveApplications = () => jobs.filter(j => j.status === 'applied' || j.status === 'interviewing').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Job Tracker
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
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
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                                <div className="p-1 bg-white rounded shadow-sm">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-600">
                                    <span className="font-bold text-gray-900">{getTotalJobs()}</span> Total
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-lg border border-blue-100/50 shadow-sm">
                                <div className="p-1 bg-white rounded shadow-sm">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-600">
                                    <span className="font-bold text-blue-700">{getActiveApplications()}</span> Active
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
                            <Button
                                size="sm"
                                onClick={() => setIsAddJobOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all border-none font-bold"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
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
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide min-h-[calc(100vh-280px)]">
                        {columns.map((column) => {
                            const columnJobs = getJobsByStatus(column.id);
                            return (
                                <div key={column.id} className="flex flex-col flex-shrink-0 w-80 bg-gray-100/50 rounded-xl border border-gray-200/50 backdrop-blur-sm">
                                    {/* Column Header */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${column.color} shadow-sm`}></div>
                                                <h3 className="font-bold text-gray-900 text-xs tracking-wider uppercase">
                                                    {column.title}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full shadow-sm">
                                                {columnJobs.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 p-3 space-y-4 transition-colors duration-200 rounded-b-xl min-h-[500px] ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                                                    }`}
                                            >
                                                {columnJobs.map((job, index) => (
                                                    <Draggable key={job._id} draggableId={job._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                }}
                                                            >
                                                                <Card
                                                                    className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 bg-white hover:-translate-y-1 ${snapshot.isDragging ? 'shadow-2xl rotate-2 ring-2 ring-blue-500/20' : 'shadow-sm'
                                                                        }`}
                                                                    style={{
                                                                        borderLeftColor: column.color === 'bg-gray-500' ? '#94a3b8' :
                                                                            column.color === 'bg-blue-500' ? '#3b82f6' :
                                                                                column.color === 'bg-yellow-500' ? '#f59e0b' :
                                                                                    column.color === 'bg-green-500' ? '#10b981' : '#ef4444'
                                                                    }}
                                                                    onClick={() => handleJobClick(job)}
                                                                >
                                                                    <CardContent className="p-4">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                                                                                {job.title}
                                                                            </h4>
                                                                            <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        <div className="flex items-center gap-1.5 mb-3">
                                                                            <Building2 className="w-3.5 h-3.5 text-blue-500/60" />
                                                                            <span className="text-xs font-semibold text-gray-600">
                                                                                {job.company}
                                                                            </span>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {job.location && (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                                                    <span className="text-[10px] font-medium text-gray-500">
                                                                                        {job.location}
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {job.salary && (
                                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded text-green-700 w-fit">
                                                                                    <DollarSign className="w-3 h-3" />
                                                                                    <span className="text-[10px] font-bold">
                                                                                        {job.salary}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                                                {formatDate(job.createdAt)}
                                                                            </span>
                                                                            {job.url && (
                                                                                <a
                                                                                    href={job.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-all font-bold group/link"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                                                    <span className="text-[10px] uppercase tracking-wider">Link</span>
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {columnJobs.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400 text-sm">
                                                        No jobs
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>

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
