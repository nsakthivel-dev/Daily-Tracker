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

## Project Structure

```
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ui/           # Shadcn UI components
│       │   ├── ambient-effects.tsx
│       │   ├── consistency-chart.tsx
│       │   ├── header.tsx
│       │   ├── performance-insights.tsx
│       │   ├── routine-table.tsx
│       │   ├── screen-time-tracker.tsx
│       │   ├── theme-provider.tsx
│       │   └── week-navigation.tsx
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       │   ├── home.tsx      # Main application page
│       │   └── not-found.tsx
│       ├── styles/
│       │   └── game-theme.css
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
├── server/
│   ├── middleware/
│   ├── routes/
│   ├── auth.ts
│   ├── index.ts            # Main server entry point
│   ├── routes.ts
│   ├── static.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts           # Shared TypeScript interfaces and Zod schemas
├── script/
│   └── build.ts
├── .env.example
├── .gitignore
├── README.md
├── components.json
├── drizzle.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── render.yaml
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Local Development

The application uses a unified development setup where both frontend and backend run from a single server during development:

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

During development, the Vite development server is used for hot reloading, while in production the application serves static files from the built `dist` directory.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## Environment Variables

- `VITE_API_URL` - Base URL for backend API (for frontend)
- `SESSION_SECRET` - Secret for session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL (overrides default)

## Deployment

### Render Deployment

The application is deployed on Render and can be accessed at: https://dailytracker-ftus.onrender.com/

The application includes configuration for Render deployment in `render.yaml`. The configuration includes:

- A web service named "routine-planner"
- Node.js environment
- Build command: `npm install; npm run build`
- Start command: `npm run start`
- Environment variables for production including NODE_ENV and PORT

## Contributing

Feel free to submit issues and enhancement requests!