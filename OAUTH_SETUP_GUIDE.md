# Fix Google OAuth Error: "invalid_client" / "no registered origin"

## Problem
You're seeing: `Error 401: invalid_client` and `Access blocked: Authorization Error - no registered origin`

## Solution
You need to add `http://localhost:5173` to your Google Cloud Console OAuth configuration.

## Steps to Fix

### 1. Go to Google Cloud Console
- Navigate to: https://console.cloud.google.com/
- Select your project

### 2. Configure OAuth Consent Screen (if not done)
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** user type
- Fill in:
  - App name: `Job Tracker`
  - User support email: Your email
  - Developer contact: Your email
- Click **Save and Continue**
- Skip scopes (click **Save and Continue**)
- Add test users if needed (your email)
- Click **Save and Continue**

### 3. Update OAuth Client ID
- Go to **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `706726990761-3bh7f92aphkhe65bpep8srbig714dueb`
- Click the **Edit** (pencil) icon

### 4. Add Authorized JavaScript Origins
Add these URIs:
```
http://localhost:5173
http://localhost:5174
```

### 5. Add Authorized Redirect URIs
Add these URIs:
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:5174
http://localhost:5174/auth/callback
```

### 6. Save Changes
- Click **Save**
- Wait 1-2 minutes for changes to propagate

### 7. Test Again
- Refresh your browser at `http://localhost:5173/login`
- Click "Sign in with Google"
- The OAuth popup should now work!

## Common Issues

**Still getting error after adding origins?**
- Wait a few minutes - Google takes time to propagate changes
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Make sure you're using the exact URL (http://localhost:5173, not 127.0.0.1)

**Different port?**
- If your app is running on a different port, add that port to the authorized origins

## For Production Deployment
When deploying to Vercel:
1. Add your Vercel domain to Authorized JavaScript Origins:
   - `https://your-app.vercel.app`
2. Add redirect URIs:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/auth/callback`
