# Suez University Smart Attendance System

## ☁️ Deployment Guide (Firebase Hosting)

This guide explains how to deploy the application to Firebase Hosting so it can be accessed by students and lecturers via a public URL.

### Prerequisites
1. **Node.js**: Installed on your computer.
2. **Firebase Account**: A project created in the [Firebase Console](https://console.firebase.google.com/).

### Step 1: Configure the Code
1. Open the file `services/firebase.ts`.
2. Replace the placeholder values in `firebaseConfig` with your actual keys from the Firebase Console (Project Settings > General > Your apps).

### Step 2: Install & Build
Open your terminal in the project folder and run:

```bash
# 1. Install libraries
npm install

# 2. Build the React application
# This creates a 'dist' folder containing the final website
npm run build
```

### Step 3: Deploy to Firebase
Run the following commands in your terminal:

```bash
# 1. Install Firebase tools (if not installed)
npm install -g firebase-tools

# 2. Login to your Google account
firebase login

# 3. Initialize the project
firebase init
```

**During `firebase init`, select the following options:**
- **Which features?** Select `Hosting: Configure files for Firebase Hosting...` (Press Space, then Enter).
- **Project Setup:** Select `Use an existing project` and choose your project.
- **Public directory?** Type `dist` (This is critical!).
- **Configure as a single-page app?** Type `y` (Yes).
- **Set up automatic builds?** Type `n` (No).
- **Overwrite index.html?** Type `n` (No, do not overwrite).

**Finally, upload the files:**
```bash
firebase deploy
```

You will get a Hosting URL (e.g., `https://your-project.web.app`).

### Step 4: Authorize Domain (CRITICAL for Login)
For the "Login with Google" button to work:
1. Go to **Firebase Console** > **Authentication** > **Settings** > **Authorized Domains**.
2. Ensure your new domain (e.g., `your-project.web.app`) is listed there.
3. If not, click "Add Domain" and paste it.

---

## Troubleshooting

**Error: "auth/operation-not-supported-in-this-environment"**
- This happens if you try to open the `index.html` file directly from your folder.
- **Solution:** You must access the app via the **Firebase Hosting URL** (HTTPS) after deploying.

**Error: "Firebase: No Firebase App '[DEFAULT]' has been created"**
- You did not paste your API keys into `services/firebase.ts`.
