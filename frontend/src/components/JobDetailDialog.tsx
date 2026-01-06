import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Upload,
    Target,
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
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
    resumeFile?: {
        filename: string;
        contentType: string;
        size: number;
        data: string;
        uploadedAt: string;
    };
}

interface JobDetailDialogProps {
    job: Job;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const JobDetailDialog: React.FC<JobDetailDialogProps> = ({ job, isOpen, onClose, onUpdate }) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'details' | 'jd' | 'ai' | 'notes' | 'resume'>('details');
    const [jdText, setJdText] = useState(job.jdText || '');
    const [notes, setNotes] = useState(job.notes || '');
    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
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
        keywordAnalysis?: any;
    }>({});

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setJdText(job.jdText || '');
        setNotes(job.notes || '');
        setResumeFile(null); // Reset file on job change
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
            let updateData: any = { jdText, notes };

            // Process resume file if one is selected
            if (resumeFile) {
                const reader = new FileReader();
                const fileData = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve({
                        filename: resumeFile.name,
                        contentType: resumeFile.type,
                        size: resumeFile.size,
                        data: (e.target?.result as string).split(',')[1], // Remove prefix (e.g., "data:application/pdf;base64,")
                        uploadedAt: new Date()
                    });
                    reader.onerror = reject;
                    reader.readAsDataURL(resumeFile);
                });
                updateData.resumeFile = fileData;
            }

            await axios.put(
                `${import.meta.env.VITE_API_URL}/jobs/${job._id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResumeFile(null); // Clear pending file
            onUpdate();
            alert('Job updated successfully!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save job. Please try again.');
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                setResumeText(fullText);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                setResumeText(result.value);
            } else {
                // Default text handler
                const text = await file.text();
                setResumeText(text);
            }
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Failed to read file. Please ensure it is a valid PDF, DOCX, or Text file.');
        }
    };

    const handleTailoredResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const handleAIAction = async (action: 'resume' | 'cover-letter' | 'questions' | 'keywords') => {
        setAiLoading(prev => ({ ...prev, [action]: true }));
        try {
            let endpoint = '';
            let data: any = { jdText };

            if (action === 'resume') {
                endpoint = '/ai/resume-suggestions';
                data.resumeText = resumeText || 'My sample resume content...';
            } else if (action === 'cover-letter') {
                endpoint = '/ai/cover-letter';
                data.resumeText = resumeText || 'My sample resume content...';
            } else if (action === 'questions') {
                endpoint = '/ai/interview-questions';
            } else if (action === 'keywords') {
                endpoint = '/ai/keyword-analysis';
                data.resumeText = resumeText || 'My sample resume content...';
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (action === 'resume') setAiResults(prev => ({ ...prev, resumeAnalysis: response.data }));
            if (action === 'cover-letter') setAiResults(prev => ({ ...prev, coverLetter: response.data.text }));
            if (action === 'questions') setAiResults(prev => ({ ...prev, questions: response.data.questions }));
            if (action === 'keywords') setAiResults(prev => ({ ...prev, keywordAnalysis: response.data }));

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
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resume'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('resume')}
                    >
                        Tailored Resume
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

                    {activeTab === 'resume' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Tailored Resume</h3>
                                    <p className="text-sm text-gray-500">
                                        Upload and save a specific resume version for {job.company}.
                                    </p>
                                </div>
                                <Button size="sm" onClick={handleSave} disabled={saving || !resumeFile}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save File'}
                                </Button>
                            </div>

                            {/* Existing Saved File */}
                            {job.resumeFile && !resumeFile && (
                                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-green-100">
                                                <FileText className="w-8 h-8 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-green-900">{job.resumeFile.filename}</h4>
                                                <div className="flex gap-4 text-xs text-green-700 mt-1">
                                                    <span>{(job.resumeFile.size / 1024).toFixed(1)} KB</span>
                                                    <span>•</span>
                                                    <span>Uploaded {new Date(job.resumeFile.uploadedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-white hover:bg-green-50 text-green-700 border-green-200"
                                            onClick={() => {
                                                // Create a download link
                                                const link = document.createElement('a');
                                                link.href = `data:${job.resumeFile?.contentType};base64,${job.resumeFile?.data}`;
                                                link.download = job.resumeFile?.filename || 'resume';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Upload className="w-4 h-4 mr-2 rotate-180" /> {/* Reuse Upload icon rotated for download */}
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className={`p-8 border-2 border-dashed rounded-lg transition-colors text-center ${resumeFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                <div className="flex flex-col items-center gap-3">
                                    {resumeFile ? (
                                        <>
                                            <FileText className="w-12 h-12 text-blue-500" />
                                            <div className="max-w-xs truncate">
                                                <p className="font-medium text-blue-900">{resumeFile.name}</p>
                                                <p className="text-sm text-blue-600">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(resumeFile);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = resumeFile.name;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                >
                                                    View / Download
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-700">Drop your resume here, or click to browse</p>
                                                <p className="text-sm text-gray-500 mt-1">Supports PDF, DOCX, TXT</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                id="tailored-resume-upload"
                                                accept=".pdf,.docx,.txt"
                                                onChange={handleTailoredResumeUpload}
                                            />
                                            <Button
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() => document.getElementById('tailored-resume-upload')?.click()}
                                            >
                                                Select File
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            {/* Resume Input Section */}
                            <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Your Resume
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Upload or paste your resume content to personalize AI suggestions.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".txt,.md,.json,.pdf,.docx"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Resume (PDF/Word)
                                        </Button>
                                        <span className="text-xs text-gray-500 self-center">
                                            {resumeText ? 'Resume loaded' : 'No resume loaded'}
                                        </span>
                                    </div>
                                    <Textarea
                                        placeholder="Or paste your resume text here..."
                                        className="h-32 text-xs font-mono"
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 border rounded-lg bg-orange-50 border-orange-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Target className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-orange-900">Match Keywords</h3>
                                            <p className="text-sm text-orange-700 mt-1">
                                                Check which keywords from the job description are missing in your resume.
                                            </p>
                                            <Button
                                                size="sm"
                                                className="mt-3 bg-orange-600 hover:bg-orange-700"
                                                disabled={!jdText || !resumeText || aiLoading['keywords']}
                                                onClick={() => handleAIAction('keywords')}
                                            >
                                                {aiLoading['keywords']
                                                    ? 'Analyzing...'
                                                    : (!jdText ? 'Add Job Description First' : (!resumeText ? 'Add Resume First' : 'Find Missing Keywords'))}
                                            </Button>

                                            {aiResults.keywordAnalysis && (
                                                <div className="mt-4 space-y-3 bg-white p-4 rounded border border-orange-200 text-sm ai-result-box">
                                                    <div>
                                                        <span className="font-bold text-orange-800">Matched Keywords:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {aiResults.keywordAnalysis.matchedKeywords?.map((kw: string, i: number) => (
                                                                <Badge key={i} className="bg-green-100 text-green-800 hover:bg-green-200 border-0">{kw}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-red-700">Missing Keywords (Add these!):</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {aiResults.keywordAnalysis.missingKeywords?.map((kw: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="border-red-300 text-red-700">{kw}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-orange-800">Quick Pointers:</span>
                                                        <ul className="list-disc ml-4 space-y-1 mt-1 text-gray-700">
                                                            {aiResults.keywordAnalysis.keyPointers?.map((p: string, i: number) => (
                                                                <li key={i}>{p}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                                disabled={!jdText || !resumeText || aiLoading['resume']}
                                                onClick={() => handleAIAction('resume')}
                                            >
                                                {aiLoading['resume']
                                                    ? 'Analyzing...'
                                                    : (!jdText ? 'Add Job Description First' : (!resumeText ? 'Add Resume First' : 'Analyze Resume'))}
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
                                                disabled={!jdText || !resumeText || aiLoading['cover-letter']}
                                                onClick={() => handleAIAction('cover-letter')}
                                            >
                                                {aiLoading['cover-letter']
                                                    ? 'Generating...'
                                                    : (!jdText ? 'Add Job Description First' : (!resumeText ? 'Add Resume First' : 'Generate Draft'))}
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
