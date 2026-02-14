@echo off
echo ========================================
echo Deploying Job Persistence Fix to Vercel
echo ========================================
echo.

echo Step 1: Adding changed files...
git add frontend/src/lib/jobStorage.ts frontend/src/pages/Dashboard.tsx frontend/src/components/JobDetailDialog.tsx
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added successfully
echo.

echo Step 2: Committing changes...
git commit -m "Implement local storage persistence fo jobs"
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
echo Test at: https://job-tracker-frontend-topaz.vercel.app
echo.
pause
