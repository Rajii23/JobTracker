# JobTracker - Deployment Guide

## 🚀 Live Deployments

### Frontend (Vite + React)
- **URL**: https://job-tracker-frontend-topaz.vercel.app
- **Platform**: Vercel
- **Status**: ✅ Live and Running
- **Build**: Automatic deployment on push to `main` branch

### Backend (Node.js + Express)
- **URL**: https://job-tracker-backend-psi.vercel.app
- **Platform**: Vercel (Serverless Functions)
- **Status**: ✅ Deployed
- **Build**: Automatic deployment on push to `main` branch

---

## 📋 Environment Variables

### Backend (Vercel)
Required environment variables in Vercel dashboard:
```
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
NODE_ENV=production
FRONTEND_URL=https://job-tracker-frontend-topaz.vercel.app
EXTENSION_ID=<your_chrome_extension_id>
GOOGLE_CLIENT_ID_WEB=<your_google_oauth_client_id>
GOOGLE_CLIENT_SECRET_WEB=<your_google_oauth_client_secret>
OPENAI_API_KEY=<your_openai_api_key>
```

### Frontend (Vercel)
Required environment variables in Vercel dashboard:
```
VITE_API_URL=https://job-tracker-backend-psi.vercel.app/api
VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
```

---

## 🔧 Setup Instructions

### 1. MongoDB Setup
You need a MongoDB database. Options:
- **MongoDB Atlas** (Recommended for production): https://www.mongodb.com/cloud/atlas
- Local MongoDB (Development only)

Once you have MongoDB:
1. Get your connection string
2. Add it to Vercel backend environment variables as `MONGODB_URI`

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Web Application** for frontend
   - **Chrome Extension** for extension
5. Add authorized redirect URIs:
   - Frontend: `https://job-tracker-frontend-topaz.vercel.app/auth/callback`
   - Extension: `https://<extension-id>.chromiumapp.org/`
6. Copy Client IDs and add to environment variables

### 3. OpenAI API (Optional)
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to backend environment variables as `OPENAI_API_KEY`
3. If not configured, AI features will use mock data

### 4. JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add to backend environment variables as `JWT_SECRET`

---

## 🔄 Deployment Workflow

### Automatic Deployments
Both frontend and backend are configured for automatic deployment:
1. Push code to `main` branch on GitHub
2. Vercel automatically detects changes
3. Builds and deploys the updated code
4. Live in ~30-60 seconds

### Manual Deployment
If needed, you can trigger manual deployments:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the project
3. Click "Redeploy" on the latest deployment

---

## 🧪 Testing the Deployment

### Frontend
1. Visit: https://job-tracker-frontend-topaz.vercel.app
2. You should see the login page
3. Click "Development Mode" → "Skip to Dashboard" to test without OAuth
4. Verify the dashboard loads and UI works

### Backend
1. Health check: https://job-tracker-backend-psi.vercel.app/health
2. Should return: `{"status":"ok"}`
3. API endpoints are at: `https://job-tracker-backend-psi.vercel.app/api/*`

### Chrome Extension
1. Build the extension: `cd extension && npm run build`
2. Load unpacked extension in Chrome from `extension/dist`
3. Get the Extension ID from `chrome://extensions`
4. Add Extension ID to backend environment variables
5. Test job scanning on LinkedIn or other job sites

---

## 📁 Project Structure

```
JobTracker/
├── backend/           # Node.js Express API
│   ├── src/
│   ├── vercel.json   # Vercel serverless config
│   └── package.json
├── frontend/          # React + Vite app
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── extension/         # Chrome extension
│   ├── src/
│   ├── manifest.json
│   └── package.json
└── scripts/          # Extension packaging scripts
```

---

## 🐛 Troubleshooting

### Frontend Build Fails
- Check TypeScript errors in build logs
- Verify all `@/` imports have proper path aliases in `tsconfig.app.json`
- Ensure all dependencies are in `package.json`

### Backend Not Connecting to MongoDB
- Verify `MONGODB_URI` is set correctly in Vercel
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Ensure MongoDB cluster is running

### CORS Errors
- Verify `FRONTEND_URL` matches your actual frontend URL
- For extension, ensure `EXTENSION_ID` is set in backend env vars
- Check browser console for specific CORS error messages

### Google OAuth Not Working
- Verify redirect URIs match exactly in Google Console
- Check that Client IDs are correct in environment variables
- Ensure OAuth consent screen is configured

---

## 🔐 Security Notes

1. **Never commit** `.env` files to Git
2. **Rotate secrets** regularly (JWT_SECRET, API keys)
3. **Use MongoDB Atlas** IP whitelist in production
4. **Enable** Vercel's security headers
5. **Monitor** API usage and rate limits

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function execution times
- Check error rates
- View analytics

### MongoDB Atlas
- Monitor database connections
- Check query performance
- Set up alerts for high usage

---

## 🚀 Next Steps

1. **Set up MongoDB Atlas** and add connection string
2. **Configure Google OAuth** credentials
3. **Add environment variables** to Vercel projects
4. **Test the full flow**: Login → Add Job → View Dashboard
5. **Build and test** the Chrome extension
6. **Set up monitoring** and alerts

---

## 📝 Notes

- Backend runs as serverless functions (cold starts possible)
- Frontend is statically hosted with CDN
- Extension communicates with deployed backend
- All deployments are automatic on `git push`

---

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify all environment variables are set
4. Test API endpoints directly with Postman/curl

---

**Last Updated**: December 21, 2024
**Deployment Status**: ✅ Production Ready
