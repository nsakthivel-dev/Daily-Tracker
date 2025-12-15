# RoutineFlow - Weekly Habit Tracker

## Overview

RoutineFlow is a weekly routine planning web application that helps users track habits, analyze consistency, and review past performance. The app features a weekly routine table with 10 customizable routines tracked across 7 days, a consistency chart for visualizing progress, screen time tracking, and historical week navigation. Data is persisted in localStorage with automatic week transitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState/useEffect for local state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful API routes prefixed with `/api`
- **Development Server**: Vite dev server with HMR proxied through Express

### Data Storage
- **Current**: localStorage for client-side persistence (no database integration yet)
- **Prepared**: Drizzle ORM configured with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains Zod schemas for data validation

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn/ui + custom)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities (storage, queryClient)
│   └── pages/           # Route components
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data storage interface (in-memory)
│   └── static.ts        # Static file serving
├── shared/              # Shared types and schemas
│   └── schema.ts        # Zod schemas and TypeScript types
└── migrations/          # Drizzle database migrations
```

### Key Design Patterns
- **Schema-First**: Zod schemas in `shared/schema.ts` define data structures used by both frontend and backend
- **Component Composition**: shadcn/ui components using Radix UI with Tailwind styling
- **Theme System**: CSS variables for colors with dark mode toggle support
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` allows swapping storage implementations

### Data Model
- **WeekData**: Contains routines array, screen time entries, and week metadata
- **Routine**: Name + cells mapping days to completion states (empty/completed/not_completed)
- **Week Management**: Automatic week transitions with historical data preservation

## External Dependencies

### UI/Component Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component patterns using Radix + Tailwind
- **Lucide React**: Icon library

### Data & Forms
- **Zod**: Schema validation for data types
- **React Hook Form**: Form handling (with @hookform/resolvers for Zod integration)
- **TanStack React Query**: Async state management

### Database (Prepared)
- **Drizzle ORM**: SQL query builder and ORM
- **PostgreSQL**: Database (requires DATABASE_URL environment variable)
- **drizzle-kit**: Migration tooling (`npm run db:push`)

### Development
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production server bundling

### Fonts
- Google Fonts: Inter (UI), JetBrains Mono (monospace for numerical data)