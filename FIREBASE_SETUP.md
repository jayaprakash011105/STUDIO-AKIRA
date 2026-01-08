# Firebase Setup and Deployment Guide

## Step 1: Install Firebase CLI

Run this command in PowerShell (as Administrator):

```powershell
npm install -g firebase-tools
```

If you don't have Node.js installed, download it from: https://nodejs.org/

## Step 2: Login to Firebase

```powershell
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 3: Initialize Firebase in Your Project

Navigate to your project directory and run:

```powershell
cd d:\STUDIOAKIRA
firebase init
```

**During initialization, select:**
- ✅ Firestore (for database rules)
- ✅ Hosting (for website deployment)

**Configuration options:**
- Firestore Rules file: `firestore.rules` (already created)
- Firestore Indexes file: `firestore.indexes.json` (default)
- Public directory: `.` (current directory)
- Configure as single-page app: `No`
- Set up automatic builds: `No`
- Overwrite existing files: `No`

## Step 4: Deploy Firestore Security Rules

```powershell
firebase deploy --only firestore:rules
```

This will deploy the security rules to your Firebase project.

## Step 5: Deploy Website to Firebase Hosting (Optional)

```powershell
firebase deploy --only hosting
```

Your website will be available at: https://studio-akira-99dde.web.app

## Step 6: Enable Firestore Database

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **studio-akira-99dde**
3. Click on **Firestore Database** in the left menu
4. Click **Create database**
5. Select **Start in production mode**
6. Choose a location (e.g., asia-south1 for India)
7. Click **Enable**

## Step 7: Enable Authentication

1. In Firebase Console, click **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click on **Email/Password**
5. Enable it and click **Save**

## Step 8: Test Locally

You can test the website locally using:

```powershell
# Using Python
python -m http.server 8000

# OR using Node.js
npx http-server

# OR using PHP
php -S localhost:8000
```

Then open: http://localhost:8000

## Step 9: Create Admin Account

1. Open your website (locally or deployed)
2. Click **Login** → **Sign Up**
3. Create an account with any email
4. Go to Firebase Console → Firestore Database
5. Find your user in the `users` collection
6. Click on the document
7. Edit the `role` field from `customer` to `admin`
8. Logout and login again as admin

## Quick Commands Reference

```powershell
# Check Firebase CLI version
firebase --version

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting

# View deployed website
firebase open hosting:site
```

## Troubleshooting

**If Firebase CLI is not recognized:**
- Make sure Node.js is installed
- Restart PowerShell after installing Firebase CLI
- Try running PowerShell as Administrator

**If deployment fails:**
- Check that you're logged in: `firebase login`
- Check that you're in the correct directory: `cd d:\STUDIOAKIRA`
- Check that firebase.json exists in the directory

**If authentication doesn't work:**
- Make sure Email/Password provider is enabled in Firebase Console
- Check browser console for errors
- Verify Firebase config in `js/firebase-config.js`

## Your Firebase Project Details

- **Project ID:** studio-akira-99dde
- **Auth Domain:** studio-akira-99dde.firebaseapp.com
- **Hosting URL:** https://studio-akira-99dde.web.app
- **Console:** https://console.firebase.google.com/project/studio-akira-99dde

---

**Next:** After completing these steps, you can start using the website!
