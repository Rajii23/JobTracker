# JobTracker Deployment Script for Windows PowerShell
# This script helps you deploy your JobTracker application to Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JobTracker - Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Git repository not found. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
    Write-Host ""
}

# Check git status
Write-Host "Checking git status..." -ForegroundColor Cyan
$status = git status --porcelain

if ($status) {
    Write-Host "Found uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    $response = Read-Host "Do you want to commit these changes? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Deploy JobTracker application"
        }
        
        Write-Host "Adding files..." -ForegroundColor Cyan
        git add .
        
        Write-Host "Committing changes..." -ForegroundColor Cyan
        git commit -m $commitMessage
        
        Write-Host "✓ Changes committed" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
    Write-Host ""
}

# Check for remote
$remotes = git remote -v
if (-not $remotes) {
    Write-Host "No remote repository configured." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy to Vercel, you need to:" -ForegroundColor Cyan
    Write-Host "1. Create a GitHub repository" -ForegroundColor White
    Write-Host "2. Add it as a remote: git remote add origin <your-repo-url>" -ForegroundColor White
    Write-Host "3. Push your code: git push -u origin main" -ForegroundColor White
    Write-Host ""
    
    $setupRemote = Read-Host "Do you want to set up a remote repository now? (y/n)"
    if ($setupRemote -eq 'y' -or $setupRemote -eq 'Y') {
        $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/jobtracker.git)"
        if ($repoUrl) {
            git remote add origin $repoUrl
            Write-Host "✓ Remote added" -ForegroundColor Green
            
            $branch = git branch --show-current
            if (-not $branch) {
                git branch -M main
                $branch = "main"
            }
            
            Write-Host ""
            Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
            git push -u origin $branch
            
            Write-Host ""
            Write-Host "✓ Code pushed to GitHub!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Remote repository found:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    
    $push = Read-Host "Do you want to push to GitHub? (y/n)"
    if ($push -eq 'y' -or $push -eq 'Y') {
        $branch = git branch --show-current
        if (-not $branch) {
            git branch -M main
            $branch = "main"
        }
        
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push origin $branch
        
        Write-Host ""
        Write-Host "✓ Code pushed to GitHub!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps for Vercel Deployment:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://vercel.com and sign in" -ForegroundColor White
Write-Host "2. Click 'Add New...' -> 'Project'" -ForegroundColor White
Write-Host "3. Import your GitHub repository" -ForegroundColor White
Write-Host ""
Write-Host "For BACKEND:" -ForegroundColor Yellow
Write-Host "  - Root Directory: backend" -ForegroundColor White
Write-Host "  - Build Command: npm install && npm run build" -ForegroundColor White
Write-Host "  - Output Directory: (leave empty)" -ForegroundColor White
Write-Host "  - Install Command: npm install" -ForegroundColor White
Write-Host ""
Write-Host "For FRONTEND:" -ForegroundColor Yellow
Write-Host "  - Root Directory: frontend" -ForegroundColor White
Write-Host "  - Build Command: npm run build" -ForegroundColor White
Write-Host "  - Output Directory: dist" -ForegroundColor White
Write-Host "  - Install Command: npm install" -ForegroundColor White
Write-Host ""
Write-Host "Environment Variables needed:" -ForegroundColor Yellow
Write-Host "  See DEPLOYMENT.md for complete list" -ForegroundColor White
Write-Host ""
Write-Host "Vercel will auto-deploy on every push to main branch!" -ForegroundColor Green
Write-Host ""

