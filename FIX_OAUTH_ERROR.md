# URGENT: Fix Google OAuth "Origin Not Allowed" Error

## The Problem
You're seeing this error in the browser console:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

This means `http://localhost:3000` is **NOT** properly configured in Google Cloud Console.

## Step-by-Step Fix (WITH SCREENSHOTS)

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Make sure you're in the correct project

### Step 2: Navigate to Credentials
1. Click the hamburger menu (☰) in the top left
2. Go to **APIs & Services** → **Credentials**

### Step 3: Find Your OAuth Client ID
Look for this client ID in the list:
```
706726990761-3bh7f92aphkhe65bpep8srbig714dueb.apps.googleusercontent.com
```

### Step 4: Edit the OAuth Client
1. Click the **pencil icon** (✏️) next to your OAuth 2.0 Client ID
2. You should see a form with two important sections

### Step 5: Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section:

**CRITICAL**: You must add EXACTLY this (copy-paste it):
```
http://localhost:3000
```

**Common Mistakes to Avoid:**
- ❌ `http://localhost:3000/` (with trailing slash)
- ❌ `https://localhost:3000` (https instead of http)
- ❌ `http://127.0.0.1:3000` (IP instead of localhost)
- ✅ `http://localhost:3000` (CORRECT)

### Step 6: Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add:
```
http://localhost:3000
http://localhost:3000/auth/callback
```

### Step 7: Save and Wait
1. Click **SAVE** at the bottom
2. **IMPORTANT**: Wait 5-10 minutes for changes to propagate
3. Clear your browser cache or use incognito mode

### Step 8: Verify the Configuration
After saving, you should see something like this in your OAuth client settings:

**Authorized JavaScript origins:**
- `http://localhost:3000`

**Authorized redirect URIs:**
- `http://localhost:3000`
- `http://localhost:3000/auth/callback`

## Testing After Fix

1. **Clear browser cache** or open **Incognito/Private window**
2. Go to http://localhost:3000/login
3. Click "Sign in with Google"
4. You should see the Google account selection popup (no errors)

## Still Not Working?

If you still see the error after following these steps:

### Check 1: Correct Client ID
Make sure your frontend `.env` file has the correct client ID:
```bash
VITE_GOOGLE_CLIENT_ID=706726990761-3bh7f92aphkhe65bpep8srbig714dueb.apps.googleusercontent.com
```

### Check 2: Restart Frontend
```bash
# Stop the frontend server (Ctrl+C)
cd frontend
npm run dev
```

### Check 3: Hard Refresh
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Check 4: Verify in Console
The OAuth configuration page should show your origins. Take a screenshot and share it if still having issues.

## Why This Happens
Google OAuth requires you to explicitly whitelist every origin (domain + port) that can use your OAuth client ID. This is a security feature to prevent unauthorized websites from using your credentials.

## For Production
When you deploy to Vercel, you'll need to add your production domain:
```
https://your-app.vercel.app
```
