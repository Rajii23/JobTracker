# Deployment Guide for Job Tracker

This guide explains how to host your Job Tracker application for free using **Render** (Backend) and **Vercel** (Frontend).

## Part 1: Backend Deployment (Render)

1.  **Push your code to GitHub** (if you haven't already).
2.  **Sign up/Log into [Render](https://dashboard.render.com/)**.
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will automatically detect the `render.yaml` file.
6.  Click **Apply**.
7.  **Environment Variables**: You will be prompted to enter these values:
    *   `MONGODB_URI`: Your MongoDB connection string (same as in your `.env`).
    *   `JWT_SECRET`: A long random string (e.g., generate one [here](https://generate-secret.vercel.app/32)).
    *   `OPENAI_API_KEY`: Your OpenAI API Key.
    *   `GOOGLE_CLIENT_ID_WEB`: Your Google Client ID.
    *   `GOOGLE_CLIENT_SECRET_WEB`: Your Google Client Secret (from Google Cloud Console).
    *   `GOOGLE_REDIRECT_URI_WEB`: You won't know this yet. Enter `TEMP` for now.
    *   `FRONTEND_URL`: You won't know this yet. Enter `TEMP` for now.
    *   `GOOGLE_CLIENT_ID_EXTENSION`: Leave empty or add if you have one.
8.  Click **Create Service**.
9.  Wait for the deployment to finish.
10. **Copy your Backend URL**: It will look like `https://job-tracker-backend-xxxx.onrender.com`.

## Part 2: Frontend Deployment (Vercel)

1.  **Sign up/Log into [Vercel](https://vercel.com/)**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Environment Variables**: Add these:
        *   `VITE_API_URL`: The **Backend URL** from Step 1 (e.g., `https://job-tracker-backend-xxxx.onrender.com/api`). **IMPORTANT**: Add `/api` at the end.
        *   `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID.
5.  Click **Deploy**.
6.  Wait for deployment.
7.  **Copy your Frontend URL**: It will look like `https://job-tracker-frontend.vercel.app`.

## Part 3: Final Configuration (Connecting them)

Now that you have both URLs, you need to link them and fix Google Auth.

### 1. Update Backend Variables (Render)
1.  Go to your Render Dashboard -> **job-tracker-backend**.
2.  Go to **Environment**.
3.  Update:
    *   `FRONTEND_URL`: Your Vercel URL (e.g., `https://job-tracker-frontend.vercel.app`).
    *   `GOOGLE_REDIRECT_URI_WEB`: `https://job-tracker-frontend.vercel.app/auth/callback`.
4.  Click **Save Changes**. The backend will automatically redeploy.

### 2. Update Google Cloud Console (CRITICAL)
Your Google Login will NOT work on the deployed site until you do this.

1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Edit your OAuth Client ID.
3.  **Authorized JavaScript origins**:
    *   ADD: `https://job-tracker-frontend.vercel.app` (Your Vercel URL).
4.  **Authorized redirect URIs**:
    *   ADD: `https://job-tracker-frontend.vercel.app`
    *   ADD: `https://job-tracker-frontend.vercel.app/auth/callback`
5.  Click **Save**.

## Deployment Complete!
Give Google about 5-10 minutes to propagate the changes, then your live website will be fully functional.
