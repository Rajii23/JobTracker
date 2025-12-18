# Job Tracker Platform

A complete Job Tracker platform consisting of:
- **Web App**: React + Vite + TypeScript + Tailwind + ShadCN
- **Backend API**: Node.js + Express + TypeScript + MongoDB + JWT + Google OAuth
- **Chrome Extension**: Manifest V3, React popup, background worker, content scripts

## Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Cloud Console Project (for OAuth)

### Installation

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    cd ../extension && npm install
    ```
3.  **Environment Variables**
    Copy `.env.example` to `.env` in the root (or respective directories) and fill in the values.

### Running Locally

1.  **Backend**
    ```bash
    cd backend
    npm run dev
    ```
2.  **Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
3.  **Extension**
    - Open `chrome://extensions`
    - Enable "Developer mode"
    - Click "Load unpacked" and select the `extension/dist` folder (after building).

## Features
- Google OAuth Login
- Job Dashboard with filters
- AI Resume Suggestions & Cover Letter Generator
- Chrome Extension to save jobs from LinkedIn, Indeed, Glassdoor
