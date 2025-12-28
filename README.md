# RoutineFlow - Weekly Habit Tracker

A game-inspired weekly routine planning website that helps users track their habits, analyze consistency, and review past performance with an engaging interface.

## Features

- Weekly routine planning with visual tracking
- Game-inspired theme with animations and effects
- Performance insights and analytics
- Screen time tracking
- Week navigation and history
- Google OAuth authentication
- Data persistence across sessions

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Netlify Deployment

This application can be deployed to Netlify with the following considerations:

1. The frontend is a React SPA with client-side routing
2. API endpoints need to be served from a separate backend
3. For a complete deployment, you'll need to:
   - Deploy the frontend to Netlify
   - Deploy the backend to a Node.js hosting platform (like Render)
   - Configure the `VITE_API_URL` environment variable in Netlify to point to your backend

For detailed instructions, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md).

### Render Deployment

The application includes configuration for Render deployment in `render.yaml`. See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for details.

## Environment Variables

- `VITE_API_URL` - Base URL for backend API (for frontend)
- `SESSION_SECRET` - Secret for session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Contributing

Feel free to submit issues and enhancement requests!