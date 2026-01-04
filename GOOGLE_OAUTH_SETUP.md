# Google OAuth Setup Guide for JobTracker

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click on the project dropdown at the top
- Click "New Project"
- Name it "JobTracker" or similar
- Click "Create"

### 3. Enable Google+ API
- In the left sidebar, go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click on it and click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" user type
- Click "Create"
- Fill in the required fields:
  - App name: JobTracker
  - User support email: rajiisoma@gmail.com
  - Developer contact: rajiisoma@gmail.com
- Click "Save and Continue"
- Skip the "Scopes" section (click "Save and Continue")
- Add test users:
  - Click "Add Users"
  - Add: rajiisoma@gmail.com
  - Click "Save and Continue"

### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Select "Web application"
- Name: "JobTracker Web Client"
- Add Authorized JavaScript origins:
  - http://localhost:5173
  - https://job-tracker-frontend-topaz.vercel.app
- Add Authorized redirect URIs:
  - http://localhost:5173/auth/callback
  - https://job-tracker-frontend-topaz.vercel.app/auth/callback
- Click "Create"
- **COPY THE CLIENT ID** - you'll need this!

### 6. Add Client ID to Vercel

#### For Frontend:
1. Go to: https://vercel.com/rajiis-projects/job-tracker-frontend/settings/environment-variables
2. Add new environment variable:
   - Key: `VITE_GOOGLE_CLIENT_ID`
   - Value: [paste your Client ID]
   - Environment: Production, Preview, Development (select all)
3. Click "Save"
4. Go to Deployments tab and click "Redeploy" on the latest deployment

#### For Backend:
1. Go to: https://vercel.com/rajiis-projects/job-tracker-backend/settings/environment-variables
2. Add new environment variable:
   - Key: `GOOGLE_CLIENT_ID_WEB`
   - Value: [paste your Client ID]
   - Environment: Production, Preview, Development (select all)
3. Add another variable:
   - Key: `GOOGLE_CLIENT_SECRET_WEB`
   - Value: [paste your Client Secret from Google Console]
   - Environment: Production, Preview, Development (select all)
4. Click "Save"
5. Go to Deployments tab and click "Redeploy" on the latest deployment

### 7. Test the Login
1. Wait for redeployment to complete (~30 seconds)
2. Visit: https://job-tracker-frontend-topaz.vercel.app/login
3. Click "Sign in with Google"
4. Should work now! ✅

---

## Quick Reference

**Your Frontend URL**: https://job-tracker-frontend-topaz.vercel.app
**Your Backend URL**: https://job-tracker-backend-psi.vercel.app

**Redirect URIs to add in Google Console**:
- https://job-tracker-frontend-topaz.vercel.app/auth/callback

**JavaScript Origins to add**:
- https://job-tracker-frontend-topaz.vercel.app

---

## Troubleshooting

### "invalid_client" error
- Make sure you added the Client ID to Vercel environment variables
- Redeploy the frontend after adding the variable
- Clear browser cache and try again

### "redirect_uri_mismatch" error
- Check that the redirect URI in Google Console exactly matches:
  `https://job-tracker-frontend-topaz.vercel.app/auth/callback`
- No trailing slashes, must be exact match

### Still not working?
- Use Development Mode bypass:
  1. Go to login page
  2. Click "Development Mode" at the bottom
  3. Click "Skip to Dashboard (Dev Only)"
  4. This bypasses OAuth for testing
