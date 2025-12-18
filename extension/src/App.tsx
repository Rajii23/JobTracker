import { useState, useEffect } from 'react';
import './App.css';
import { User, LayoutDashboard, ArrowLeft, Search } from 'lucide-react';

interface JobData {
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  description?: string;
}

function App() {
  const [view, setView] = useState<'home' | 'scanner'>('home');
  const [loading, setLoading] = useState(true);
  const [currentJob, setCurrentJob] = useState<JobData | null>(null);
  const [status, setStatus] = useState('wishlist');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Scanner Logic
  useEffect(() => {
    if (view === 'scanner') {
      setLoading(true);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'GET_JOB_DETAILS' }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('No content script or error:', chrome.runtime.lastError);
              setLoading(false);
              return;
            }
            if (response) setCurrentJob(response);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [view]);

  const handleSave = () => {
    if (!currentJob) return;
    setSaveStatus('saving');
    chrome.runtime.sendMessage({
      type: 'SAVE_JOB',
      data: { ...currentJob, status }
    }, (response) => {
      if (response && response.success) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
        setErrorMessage(response?.error || 'Failed to save');
      }
    });
  };

  const openDashboard = () => chrome.tabs.create({ url: 'http://localhost:3000' });
  const openLinkedIn = () => chrome.tabs.create({ url: 'https://www.linkedin.com/in/' });

  // --- HOME VIEW ---
  if (view === 'home') {
    return (
      <div className="container home-view">
        <header className="home-header">
          <div className="logo-section">
            {/* Simple Logo Placeholder */}
            <div className="logo-icon">J</div>
            <h1>Job Tracker</h1>
          </div>
        </header>

        <div className="section">
          <h2>LinkedIn Profile</h2>
          <ol>
            <li>Go to your personal LinkedIn Profile page.</li>
            <li>Use this shortcut to quickly access and manage your profile.</li>
          </ol>
          <button className="btn btn-secondary full-width" onClick={openLinkedIn}>
            <User size={16} /> Open LinkedIn Profile
          </button>
        </div>

        <div className="section">
          <h2>Job Tracker</h2>
          <ol>
            <li>Go to any job listing page (LinkedIn, Indeed, etc).</li>
            <li>Click <b>Scan Job</b> to auto-fill details and save to your dashboard.</li>
          </ol>
          <div className="button-group-vertical">
            <button className="btn btn-primary full-width" onClick={() => setView('scanner')}>
              <Search size={16} /> Scan Job
            </button>
            <button className="btn btn-secondary full-width" onClick={openDashboard}>
              <LayoutDashboard size={16} /> View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCANNER VIEW ---
  if (loading) {
    return (
      <div className="container loading">
        <div className="loading-spinner">Scanning page...</div>
      </div>
    );
  }

  return (
    <div className="container scanner-view">
      <header className="scanner-header">
        <button className="icon-btn" onClick={() => setView('home')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Save Job</h1>
        <div style={{ width: 20 }}></div>
      </header>

      {currentJob ? (
        <div className="job-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={currentJob.title}
              onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={currentJob.company}
              onChange={(e) => setCurrentJob({ ...currentJob, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={currentJob.location}
              onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
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

          <button
            className={`btn btn-primary full-width ${saveStatus}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
          >
            {saveStatus === 'idle' && 'Save Job'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'success' && 'Saved!'}
            {saveStatus === 'error' && 'Retry'}
          </button>

          {saveStatus === 'error' && <p className="error-msg">{errorMessage}</p>}
        </div>
      ) : (
        <div className="no-job">
          <div className="no-job-icon">🔍</div>
          <p>No job detected on this page.</p>
          <p className="hint">Try navigating to a job detail page explicitly.</p>
          <button className="btn btn-secondary" onClick={() => setView('home')}>Go Back</button>
        </div>
      )}
    </div>
  );
}

export default App;
