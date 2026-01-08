# STUDIO AKIRA - Quick Start Script
# Run this script to test the website locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STUDIO AKIRA - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit
}

Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI is installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✓ Firebase CLI installed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Enable Firestore Database in Firebase Console:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/studio-akira-99dde/firestore" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Enable Email/Password Authentication:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/studio-akira-99dde/authentication" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Login to Firebase:" -ForegroundColor White
Write-Host "   firebase login" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Initialize Firebase (if not done):" -ForegroundColor White
Write-Host "   firebase init" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy Firestore rules:" -ForegroundColor White
Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Start local server:" -ForegroundColor White
Write-Host "   npx http-server -p 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start local server
$response = Read-Host "Do you want to start the local server now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Starting local server on http://localhost:8000..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npx http-server -p 8000
}
