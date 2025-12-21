# Deploying to Render

This document provides instructions for deploying the Routine Planner application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A Google OAuth application configured in the Google Cloud Console

## Deployment Steps

1. Fork this repository to your GitHub account
2. Sign in to your Render account
3. Click "New+" and select "Web Service"
4. Connect your GitHub account and select your forked repository
5. Configure the service with the following settings:
   - Name: routine-planner (or any name you prefer)
   - Environment: Node
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Instance Type: Free (or any paid tier you prefer)

## Environment Variables

In the Render dashboard, go to your service > Settings > Environment Variables and add the following:

1. `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
2. `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
3. `SESSION_SECRET` - A secure random string for session encryption (generate a new one for production)
4. `NODE_ENV` - Set to "production"

Note: Do not manually set the PORT variable as Render will automatically set it.

## Google OAuth Configuration

When configuring your Google OAuth application in the Google Cloud Console:

1. Add the following Authorized redirect URI:
   ```
   https://your-app-name.onrender.com/auth/google/callback
   ```
   
   Replace "your-app-name" with the actual name of your Render service.

## Domain Configuration (Optional)

If you want to use a custom domain:

1. In the Render dashboard, go to your service > Settings > Custom Domains
2. Add your domain
3. Follow Render's instructions to configure DNS records with your domain registrar

## Troubleshooting

### Authentication Issues

If you're experiencing authentication issues:

1. Verify that your Google OAuth credentials are correct
2. Ensure the redirect URI in Google Cloud Console matches your Render URL
3. Check that all environment variables are properly set in Render

### Application Not Starting

If the application fails to start:

1. Check the logs in the Render dashboard
2. Ensure all required environment variables are set
3. Verify that the build process completes successfully

## Notes

- Render automatically sets the PORT environment variable, which the application uses
- The application is configured to work with Render's dynamic URLs for OAuth callbacks
- Session data is stored in memory, which is fine for small applications but consider using a database for production