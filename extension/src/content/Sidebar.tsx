import { useState } from 'react';
import { getLinkedInJobDetails } from './linkedin';
import { getGeneralJobDetails } from './general';
import { X, LayoutDashboard, Search, ChevronLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface JobData {
    title: string;
    company: string;
    location: string;
    salary: string;
    url: string;
    description?: string;
    jdText?: string;
}

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'menu' | 'scanner'>('menu');
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('wishlist');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleScan = () => {
        setView('scanner');
        setLoading(true);
        // Determine parser based on domain
        let data = null;
        if (window.location.hostname.includes('linkedin.com')) {
            data = getLinkedInJobDetails();
        } else {
            // Fallback to general scanner for all other sites
            data = getGeneralJobDetails();
        }

        if (data) {
            setJobData({
                ...data,
                description: data.description || (data as any).jdText || ''
            });
        }
        setLoading(false);
    };

    const handleSave = () => {
        if (!jobData) return;
        setSaveStatus('saving');
        chrome.runtime.sendMessage({
            type: 'SAVE_JOB',
            data: { ...jobData, status }
        }, (response: any) => {
            if (response && response.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        });
    };

    const openDashboard = () => chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });

    return (
        <>
            {!isOpen && (
                <button className="toggle-btn" onClick={toggleSidebar} title="Open Job Tracker">
                    <span style={{ fontSize: '24px' }}>🏃</span>
                </button>
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="header">
                    <div className="brand">
                        <div className="logo-circle">J</div>
                        <span>Job Tracker</span>
                    </div>
                    <button className="close-btn" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <div className="content">
                    {view === 'menu' ? (
                        <>
                            <div className="card">
                                <h2>Current Page</h2>
                                <button className="action-btn primary" onClick={handleScan}>
                                    <Search size={16} /> Scan This Job
                                </button>
                            </div>

                            <div className="card">
                                <h2>Dashboard</h2>
                                <button className="action-btn" onClick={openDashboard}>
                                    <LayoutDashboard size={16} /> View Tracker
                                </button>
                            </div>

                            <div className="message" style={{ background: '#eff6ff', color: '#1e40af' }}>
                                Tip: Navigate to a job detail page to scan details automatically.
                            </div>
                        </>
                    ) : (
                        // Scanner View
                        <div className="scanner-form">
                            <button className="action-btn" style={{ marginBottom: '16px', justifyContent: 'flex-start' }} onClick={() => setView('menu')}>
                                <ChevronLeft size={16} /> Back to Menu
                            </button>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Scanning...</div>
                            ) : jobData ? (
                                <>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input
                                            value={jobData.title}
                                            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input
                                            value={jobData.company}
                                            onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            value={jobData.location}
                                            onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="wishlist">Wishlist</option>
                                            <option value="applied">Applied</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="offer">Offer</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            rows={4}
                                            value={jobData.description || ''}
                                            onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                                            placeholder="Paste job description here..."
                                        />
                                    </div>

                                    <button
                                        className={`action-btn primary`}
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving' || saveStatus === 'success'}
                                    >
                                        {saveStatus === 'idle' && <><Save size={16} /> Save Job</>}
                                        {saveStatus === 'saving' && 'Saving...'}
                                        {saveStatus === 'success' && <><CheckCircle size={16} /> Saved!</>}
                                        {saveStatus === 'error' && <><AlertCircle size={16} /> Error</>}
                                    </button>
                                </>
                            ) : (
                                <div className="message error">
                                    No job details detected. Are you on a job page?
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
