# Deploy Job Deletion Fix - Instructions

## Current Status
✅ **Code is fixed locally** - All hardcoded `localhost:5000` URLs have been replaced with environment variables
❌ **Not deployed yet** - The changes need to be committed and pushed to GitHub

## What's Wrong
The production site at https://job-tracker-frontend-topaz.vercel.app is still trying to connect to `http://localhost:5000/api/jobs/...` which fails because:
- localhost doesn't exist in the cloud
- The correct URL should be `https://job-tracker-backend-psi.vercel.app/api/jobs/...`

## Files Changed (Ready to Deploy)
- `frontend/src/components/JobDetailDialog.tsx` - Fixed 4 functions to use environment variable

## How to Deploy the Fix

### Step 1: Open Terminal
Open a terminal/command prompt in the JobTracker directory:
```bash
cd "c:\Users\rajes\Portfolio Projects\JobTracker"
```

### Step 2: Check What Changed
```bash
git status
```
You should see:
- `frontend/src/components/JobDetailDialog.tsx` (modified)
- `JOB_DELETION_FIX.md` (new file)
- `DEPLOY_FIX.md` (new file)

### Step 3: Add the Changes
```bash
git add frontend/src/components/JobDetailDialog.tsx JOB_DELETION_FIX.md DEPLOY_FIX.md
```

### Step 4: Commit the Changes
```bash
git commit -m "Fix job deletion, editing, and AI features by using environment variable for API URL"
```

### Step 5: Push to GitHub
```bash
git push origin main
```

### Step 6: Wait for Vercel Deployment
1. Go to https://vercel.com/rajiis-projects/job-tracker-frontend/deployments
2. Wait for the new deployment to show "Ready" status (usually takes 30-60 seconds)
3. The deployment will have the commit message from Step 4

### Step 7: Test the Fix
1. Go to https://job-tracker-frontend-topaz.vercel.app
2. Sign in with Google
3. Create a test job
4. Try to delete it
5. ✅ It should work now!

## What Was Fixed
Changed all API calls in `JobDetailDialog.tsx` from:
```typescript
`http://localhost:5000/api/jobs/${job._id}`
```
To:
```typescript
`${import.meta.env.VITE_API_URL}/jobs/${job._id}`
```

This affects:
- ✅ Job deletion
- ✅ Job editing
- ✅ Saving notes and JD text
- ✅ AI features (resume optimization, cover letter, interview prep)

## Environment Variable
The `VITE_API_URL` is already configured in Vercel as:
```
https://job-tracker-backend-psi.vercel.app/api
```

So once deployed, all API calls will go to the correct backend URL! 🚀
