# Netlify Deployment Guide

## How to Deploy to Netlify

1. Make sure you have built your application:
   ```bash
   npm run build
   ```

2. The build command will:
   - Build the React client application
   - Bundle the server code (though it won't be used on Netlify)
   - Output the static client files to `dist/public`

3. Connect your repository to Netlify:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository
   - Netlify will automatically use the settings from `netlify.toml`

## Important Notes

- This application uses client-side routing with `wouter`
- The `_redirects` file in `client/public` ensures all routes are served by `index.html`
- The `netlify.toml` file configures:
  - Build command: `npm run build`
  - Publish directory: `dist/public`
  - Client-side redirects for SPA routing

## API Considerations

Note that when deployed to Netlify, the Express backend will not be available. If your application requires backend functionality (API endpoints, authentication, data storage), you'll need to:
1. Deploy the Express server separately (e.g., on Render, Railway, Railway, or other Node.js hosting platforms)
2. Update your frontend environment variables to point to the external API endpoint
3. Or migrate your backend to Netlify Functions (more complex approach)

For this routine planner application, you likely need:
- User authentication (Google OAuth)
- Data storage for routines and user preferences
- These require a backend server which Netlify cannot provide

The simplest approach is to deploy your Express server to a platform like Render (which you already have configuration for in `render.yaml`) and set the `VITE_API_URL` environment variable in Netlify to point to your backend API.

## Environment Variables

Make sure to set any required environment variables in the Netlify dashboard under:
Settings → Environment Variables