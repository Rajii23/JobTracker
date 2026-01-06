# 🚀 Quick Deployment Guide

## Option 1: Deploy to Vercel (Recommended - Already Configured)

Your project is already configured for Vercel deployment. Follow these steps:

### Step 1: Initialize Git and Push to GitHub

1. **Run the deployment script:**
   ```powershell
   .\deploy.ps1
   ```
   
   Or manually:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - JobTracker"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`
5. **Add Environment Variables:**
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<generate_a_random_string>
   NODE_ENV=production
   FRONTEND_URL=<will_set_after_frontend_deploy>
   GOOGLE_CLIENT_ID_WEB=<your_google_oauth_client_id>
   GOOGLE_CLIENT_SECRET_WEB=<your_google_oauth_client_secret>
   OPENAI_API_KEY=<your_openai_api_key>
   EXTENSION_ID=<your_chrome_extension_id>
   ```
6. Click **"Deploy"**
7. **Copy your backend URL** (e.g., `https://job-tracker-backend-xxx.vercel.app`)

### Step 3: Deploy Frontend to Vercel

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the same GitHub repository
3. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://<your-backend-url>/api
   VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
   ```
5. Click **"Deploy"**
6. **Copy your frontend URL** (e.g., `https://job-tracker-frontend-xxx.vercel.app`)

### Step 4: Update Backend Environment Variables

1. Go back to your **Backend** project in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` with your frontend URL
4. Redeploy the backend

### Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. **Add Authorized JavaScript origins:**
   - `https://<your-frontend-url>`
4. **Add Authorized redirect URIs:**
   - `https://<your-frontend-url>`
   - `https://<your-frontend-url>/auth/callback`
5. Save changes

### Step 6: Test Deployment

- Frontend: Visit your frontend URL
- Backend Health: `https://<your-backend-url>/health`
- Test login and job creation

---

## Option 2: Deploy to Render (Alternative)

If you prefer Render for the backend:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Configure environment variables (same as Vercel)
6. Deploy frontend to Vercel as in Option 1

---

## 🔑 Environment Variables Reference

### Backend Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `FRONTEND_URL` - Your frontend deployment URL
- `GOOGLE_CLIENT_ID_WEB` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET_WEB` - Google OAuth Client Secret

### Backend Optional:
- `OPENAI_API_KEY` - For AI features
- `EXTENSION_ID` - Chrome extension ID

### Frontend Required:
- `VITE_API_URL` - Backend API URL (with `/api` suffix)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

---

## 📝 Notes

- Vercel auto-deploys on every push to `main` branch
- Backend runs as serverless functions (may have cold starts)
- Frontend is statically hosted with CDN
- Make sure MongoDB Atlas allows connections from anywhere (`0.0.0.0/0`)

---

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check TypeScript errors

**CORS errors?**
- Verify `FRONTEND_URL` matches your actual frontend URL
- Check backend CORS configuration

**Database connection fails?**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure cluster is running

**OAuth not working?**
- Verify redirect URIs in Google Console match exactly
- Check environment variables are set correctly
- Wait 5-10 minutes for Google changes to propagate

