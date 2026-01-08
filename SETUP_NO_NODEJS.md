# STUDIO AKIRA - Setup Without Firebase CLI

## ⚠️ Node.js Not Installed

Firebase CLI requires Node.js, but you can still set up and test your website!

## Option 1: Install Node.js (Recommended)

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - Run the installer
   - Restart PowerShell after installation

2. **After installing Node.js, run:**
   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy --only firestore:rules
   ```

## Option 2: Manual Firebase Setup (No CLI Required)

You can configure Firebase directly through the web console:

### Step 1: Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/studio-akira-99dde/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **asia-south1** (or closest to you)
5. Click **"Enable"**

### Step 2: Add Security Rules Manually

1. In Firestore, click on **"Rules"** tab
2. Copy the content from `d:\STUDIOAKIRA\firestore.rules`
3. Paste it into the rules editor
4. Click **"Publish"**

### Step 3: Enable Authentication

1. Go to: https://console.firebase.google.com/project/studio-akira-99dde/authentication
2. Click **"Get started"**
3. Click on **"Email/Password"**
4. Toggle **"Enable"**
5. Click **"Save"**

### Step 4: Test Locally (Without Node.js)

**Using Python** (if installed):
```powershell
python -m http.server 8000
```

**Using PHP** (if installed):
```powershell
php -S localhost:8000
```

**Using Browser** (simplest):
- Just double-click `index.html` to open in browser
- Note: Some features may not work due to CORS restrictions

Then visit: http://localhost:8000

### Step 5: Create Admin Account

1. Open your website
2. Click **"Login"** → **"Sign Up"**
3. Create an account with your email
4. Go to Firebase Console → Firestore Database
5. Click on **"users"** collection
6. Find your user document
7. Click on it to edit
8. Change `role` field from `"customer"` to `"admin"`
9. Logout and login again

## Option 3: Use Live Server (VS Code Extension)

If you have VS Code:

1. Install **"Live Server"** extension
2. Right-click on `index.html`
3. Select **"Open with Live Server"**

## Quick Test Checklist

After setup, test these features:

- [ ] Open website (index.html)
- [ ] Click "Login" button - modal should open
- [ ] Sign up as customer - should work
- [ ] Login as customer - should redirect to customer homepage
- [ ] See featured products (will be empty until you add products)
- [ ] Manually change role to "admin" in Firestore
- [ ] Login as admin - should see admin dashboard
- [ ] Create a manufacturer account - should show "pending approval"
- [ ] Approve manufacturer from admin dashboard
- [ ] Login as manufacturer - should work now

## Troubleshooting

**"Firebase not defined" error:**
- Make sure you're accessing via http://localhost (not file://)
- Check browser console for errors
- Verify Firebase config in `js/firebase-config.js`

**Can't create account:**
- Make sure Authentication is enabled in Firebase Console
- Check that Email/Password provider is enabled
- Check browser console for errors

**Firestore permission denied:**
- Make sure security rules are published
- Check that Firestore is enabled
- Verify you're logged in

## Your Firebase Project URLs

- **Console:** https://console.firebase.google.com/project/studio-akira-99dde
- **Firestore:** https://console.firebase.google.com/project/studio-akira-99dde/firestore
- **Authentication:** https://console.firebase.google.com/project/studio-akira-99dde/authentication
- **Rules:** https://console.firebase.google.com/project/studio-akira-99dde/firestore/rules

---

**Recommended:** Install Node.js for the best development experience and to use Firebase CLI for deployment.
