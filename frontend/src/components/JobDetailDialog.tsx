import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    ExternalLink,
    FileText,
    MessageSquare,
    PenTool,
    Save,
    Edit,
    X,
    Trash2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

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

interface JobDetailDialogProps {
    job: Job;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const JobDetailDialog: React.FC<JobDetailDialogProps> = ({ job, isOpen, onClose, onUpdate }) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'details' | 'jd' | 'ai' | 'notes'>('details');
    const [jdText, setJdText] = useState(job.jdText || '');
    const [notes, setNotes] = useState(job.notes || '');
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedJob, setEditedJob] = useState({
        title: job.title,
        company: job.company,
        location: job.location || '',
        salary: job.salary || '',
        status: job.status,
        url: job.url || ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // AI Tools State
    const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
    const [aiResults, setAiResults] = useState<{
        resumeAnalysis?: any;
        coverLetter?: string;
        questions?: string[];
    }>({});

    useEffect(() => {
        setJdText(job.jdText || '');
        setNotes(job.notes || '');
        setEditedJob({
            title: job.title,
            company: job.company,
            location: job.location || '',
            salary: job.salary || '',
            status: job.status,
            url: job.url || ''
        });
    }, [job]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/jobs/${job._id}`,
                { jdText, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate();
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDetails = async () => {
        setSaving(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/jobs/${job._id}`,
                editedJob,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsEditMode(false);
            onUpdate();
        } catch (error) {
            console.error('Error saving details:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/jobs/${job._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
            onUpdate();
        } catch (error) {
            console.error('Error deleting job:', error);
            // Fallback: close and update anyway to handle mock jobs or sync issues
            onClose();
            onUpdate();
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };


    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditedJob({
            title: job.title,
            company: job.company,
            location: job.location || '',
            salary: job.salary || '',
            status: job.status,
            url: job.url || ''
        });
    };

    const handleAIAction = async (action: 'resume' | 'cover-letter' | 'questions') => {
        setAiLoading(prev => ({ ...prev, [action]: true }));
        try {
            let endpoint = '';
            let data: any = { jdText };

            if (action === 'resume') {
                endpoint = '/ai/resume-suggestions';
                data.resumeText = 'My sample resume content...'; // In real app, get from user profile
            } else if (action === 'cover-letter') {
                endpoint = '/ai/cover-letter';
                data.resumeText = 'My sample resume content...';
            } else if (action === 'questions') {
                endpoint = '/ai/interview-questions';
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (action === 'resume') setAiResults(prev => ({ ...prev, resumeAnalysis: response.data }));
            if (action === 'cover-letter') setAiResults(prev => ({ ...prev, coverLetter: response.data.text }));
            if (action === 'questions') setAiResults(prev => ({ ...prev, questions: response.data.questions }));

        } catch (error) {
            console.error(`AI ${action} error:`, error);
        } finally {
            setAiLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'wishlist': return 'bg-gray-500 hover:bg-gray-600';
            case 'applied': return 'bg-blue-500 hover:bg-blue-600';
            case 'interviewing': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'offer': return 'bg-green-500 hover:bg-green-600';
            case 'rejected': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            {isEditMode ? (
                                <Input
                                    value={editedJob.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedJob({ ...editedJob, title: e.target.value })}
                                    className="text-2xl font-bold mb-2"
                                    placeholder="Job Title"
                                />
                            ) : (
                                <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Building2 className="w-4 h-4" />
                                {isEditMode ? (
                                    <Input
                                        value={editedJob.company}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedJob({ ...editedJob, company: e.target.value })}
                                        className="font-medium"
                                        placeholder="Company Name"
                                    />
                                ) : (
                                    <span className="font-medium">{job.company}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? (
                                <select
                                    value={editedJob.status}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditedJob({ ...editedJob, status: e.target.value as Job['status'] })}
                                    className="px-3 py-1 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="wishlist">Wishlist</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            ) : (
                                <Badge className={`${getStatusColor(job.status)} text-white border-0`}>
                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Custom Tabs */}
                <div className="flex border-b border-gray-200 mt-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'jd'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('jd')}
                    >
                        Job Description
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ai'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('ai')}
                    >
                        AI Tools
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes
                    </button>
                </div>

                <style>{`
                    .ai-result-box {
                        animation: slideDown 0.3s ease-out;
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                <div className="mt-6">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="flex justify-between mb-4">
                                <div className="flex gap-2">
                                    {!isEditMode && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Job
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {isEditMode ? (
                                        <>
                                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSaveDetails} disabled={saving}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Details
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                                    {isEditMode ? (
                                        <Input
                                            value={editedJob.location}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedJob({ ...editedJob, location: e.target.value })}
                                            placeholder="e.g. Remote, San Francisco, CA"
                                            className="text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {job.location || 'Remote / Not specified'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Salary</label>
                                    {isEditMode ? (
                                        <Input
                                            value={editedJob.salary}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedJob({ ...editedJob, salary: e.target.value })}
                                            placeholder="e.g. $120k - $150k"
                                            className="text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            {job.salary || 'Not specified'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Job URL</label>
                                    {isEditMode ? (
                                        <Input
                                            value={editedJob.url}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedJob({ ...editedJob, url: e.target.value })}
                                            placeholder="https://..."
                                            className="text-sm"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-900">
                                            {job.url ? (
                                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" />
                                                    View Posting
                                                </a>
                                            ) : (
                                                'Not specified'
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Date Applied</label>
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(job.dateApplied || job.createdAt)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Source</label>
                                    <div className="text-sm text-gray-900 capitalize">
                                        {job.source}
                                    </div>
                                </div>
                            </div>

                            {!isEditMode && job.url && (
                                <div className="pt-4">
                                    <Button variant="outline" className="w-full" onClick={() => window.open(job.url, '_blank')}>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Job Posting
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'jd' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">
                                    Paste the full job description here for AI analysis
                                </label>
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Description'}
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Paste job description..."
                                className="min-h-[300px] font-mono text-sm"
                                value={jdText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJdText(e.target.value)}
                            />
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-blue-900">Resume Optimization</h3>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Get tailored suggestions to improve your resume for this specific job description.
                                            </p>
                                            <Button
                                                size="sm"
                                                className="mt-3 bg-blue-600 hover:bg-blue-700"
                                                disabled={!jdText || aiLoading['resume']}
                                                onClick={() => handleAIAction('resume')}
                                            >
                                                {aiLoading['resume'] ? 'Analyzing...' : (jdText ? 'Analyze Resume' : 'Add Job Description First')}
                                            </Button>

                                            {aiResults.resumeAnalysis && (
                                                <div className="mt-4 p-4 bg-white rounded border border-blue-200 text-sm ai-result-box">
                                                    <p className="font-bold text-blue-800">Summary:</p>
                                                    <p className="mb-3">{aiResults.resumeAnalysis.summary}</p>

                                                    <p className="font-bold text-blue-800">Suggested Improvements:</p>
                                                    <ul className="list-disc ml-4 space-y-2 mt-1">
                                                        {aiResults.resumeAnalysis.suggestedPoints?.map((p: string, i: number) => (
                                                            <li key={i}>{p}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-purple-50 border-purple-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <PenTool className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-purple-900">Cover Letter Generator</h3>
                                            <p className="text-sm text-purple-700 mt-1">
                                                Generate a personalized cover letter highlighting your relevant experience.
                                            </p>
                                            <Button
                                                size="sm"
                                                className="mt-3 bg-purple-600 hover:bg-purple-700"
                                                disabled={!jdText || aiLoading['cover-letter']}
                                                onClick={() => handleAIAction('cover-letter')}
                                            >
                                                {aiLoading['cover-letter'] ? 'Generating...' : (jdText ? 'Generate Draft' : 'Add Job Description First')}
                                            </Button>

                                            {aiResults.coverLetter && (
                                                <div className="mt-4 p-4 bg-white rounded border border-purple-200 text-sm ai-result-box whitespace-pre-wrap">
                                                    {aiResults.coverLetter}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-green-50 border-green-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-green-900">Interview Prep</h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                Practice with AI-generated interview questions based on the role.
                                            </p>
                                            <Button
                                                size="sm"
                                                className="mt-3 bg-green-600 hover:bg-green-700"
                                                disabled={!jdText || aiLoading['questions']}
                                                onClick={() => handleAIAction('questions')}
                                            >
                                                {aiLoading['questions'] ? 'Generating...' : (jdText ? 'Start Practice' : 'Add Job Description First')}
                                            </Button>

                                            {aiResults.questions && (
                                                <div className="mt-4 p-4 bg-white rounded border border-green-200 text-sm ai-result-box">
                                                    <p className="font-bold text-green-800 mb-2">Practice Questions:</p>
                                                    <ol className="list-decimal ml-4 space-y-3">
                                                        {aiResults.questions.map((q, i) => (
                                                            <li key={i}>{q}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Add notes about this application..."
                                className="min-h-[200px]"
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-bold mb-2">Delete Job?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete "{job.title}" at {job.company}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Job'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default JobDetailDialog;
