# YapMonster Deployment Guide

## Overview

This is a full-stack chat application with React frontend and Node.js backend. Due to Vercel's limitations with backend servers, we need to deploy the frontend and backend separately.

## Step 1: Deploy Backend (Choose one platform)

### Option A: Deploy on Render (Recommended)

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: yapmonster-backend
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `NODE_ENV`: production
5. Click "Create Web Service"
6. Copy the generated URL (e.g., `https://yapmonster-backend.onrender.com`)

### Option B: Deploy on Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables (same as above)
6. Deploy and copy the URL

### Option C: Deploy on Heroku

1. Go to [heroku.com](https://heroku.com) and create an account
2. Create a new app
3. Connect your GitHub repository
4. Set buildpacks and environment variables
5. Deploy and copy the URL

## Step 2: Update Backend CORS Settings

Update your `backend/server.js` file to allow your frontend domain:

```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app", "http://localhost:3000"]
        : "http://localhost:3000",
    credentials: true,
  })
);
```

Also update the Socket.IO CORS settings:

```javascript
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app", "http://localhost:3000"]
        : "http://localhost:3000",
    credentials: true,
  },
});
```

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables:
   - `REACT_APP_BACKEND_URL`: Your deployed backend URL (e.g., `https://yapmonster-backend.onrender.com`)
6. Click "Deploy"

## Step 4: Update Environment Variables

After deployment, update the environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add `REACT_APP_BACKEND_URL` with your backend URL
4. Redeploy the application

## Step 5: Test the Application

1. Test the frontend URL to ensure it loads
2. Test user registration/login
3. Test chat functionality
4. Test real-time messaging

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS settings include your frontend domain
2. **Socket.IO Connection Issues**: Ensure the backend URL is correct and includes the protocol (https://)
3. **Environment Variables**: Make sure `REACT_APP_BACKEND_URL` is set correctly in Vercel
4. **Build Errors**: Check that all dependencies are properly installed

### Local Development:

For local development, create a `.env` file in the `frontend` directory:

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

## File Structure After Deployment

```
YapMonster/
├── backend/          # Deployed separately on Render/Railway/Heroku
├── frontend/         # Deployed on Vercel
├── vercel.json       # Vercel configuration
└── DEPLOYMENT.md     # This file
```

## Important Notes

- The backend and frontend must be deployed separately
- Environment variables must be configured on both platforms
- CORS settings must be updated to allow cross-origin requests
- Socket.IO requires proper CORS configuration for real-time features
