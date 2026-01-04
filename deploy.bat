@echo off
echo ========================================
echo Deploying JobTracker Fix to Vercel
echo ========================================
echo.

echo Step 1: Adding changed files...
git add frontend/src/components/JobDetailDialog.tsx JOB_DELETION_FIX.md DEPLOY_FIX.md
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added successfully
echo.

echo Step 2: Committing changes...
git commit -m "Fix job deletion, editing, and AI features by using environment variable for API URL"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit changes
    pause
    exit /b 1
)
echo ✓ Changes committed successfully
echo.

echo Step 3: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub successfully
echo.

echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Vercel will automatically deploy in 30-60 seconds.
echo.
echo Check deployment status at:
echo https://vercel.com/rajiis-projects/job-tracker-frontend/deployments
echo.
echo Once deployment shows "Ready", test at:
echo https://job-tracker-frontend-topaz.vercel.app
echo.
pause
