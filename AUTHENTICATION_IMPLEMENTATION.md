# Google Sign-In Authentication Implementation

## Overview
This document describes the implementation of Google Sign-In authentication for the Routine Planner application. The implementation allows users to sign in using their Google accounts, with all user data saved to their associated account. Users remain signed in until they explicitly log out, and their data persists across sessions.

## Features Implemented

1. **Google OAuth 2.0 Integration**
   - Uses `passport-google-oauth20` strategy for authentication
   - Configured with client ID and secret from environment variables

2. **Session Management**
   - Uses `express-session` for session handling
   - Sessions persist for 7 days
   - Secure cookies in production environment

3. **User Account Handling**
   - Supports both traditional username/password and Google OAuth accounts
   - Automatically creates new user accounts for first-time Google sign-ins
   - Prevents duplicate accounts for the same Google ID

4. **Frontend Integration**
   - Login/Logout buttons in the header
   - User display showing Google account information
   - Automatic redirection after authentication

5. **Data Synchronization**
   - User data stored server-side when authenticated
   - Fallback to localStorage when not authenticated
   - Seamless transition between authenticated and unauthenticated states

## Technical Details

### Backend Implementation

1. **Dependencies Added**
   - `passport-google-oauth20` for Google OAuth strategy
   - `@types/passport-google-oauth20` for TypeScript definitions

2. **Files Modified/Created**
   - `server/index.ts`: Added session middleware and Passport initialization
   - `server/storage.ts`: Extended storage interface to handle Google users and user data
   - `server/auth.ts`: Configured Google OAuth strategy and Passport serialization
   - `server/routes/auth.ts`: Created authentication routes (login, logout, callback)
   - `server/routes/data.ts`: Created routes for user data synchronization
   - `server/middleware/auth.ts`: Created authentication middleware
   - `server/routes.ts`: Registered new routes

3. **Storage Enhancements**
   - Added `googleId`, `displayName`, and `email` fields to User model
   - Added `getUserByGoogleId()` and `createGoogleUser()` methods
   - Added `getUserData()` and `saveUserData()` methods for user-specific data

### Frontend Implementation

1. **Files Modified**
   - `client/src/components/header.tsx`: Added login/logout UI elements
   - `client/src/lib/storage.ts`: Updated to handle server-side data when authenticated
   - `client/src/pages/home.tsx`: Updated to handle async storage functions
   - `client/src/components/routine-table.tsx`: Updated function signatures for async handlers
   - `client/src/components/screen-time-tracker.tsx`: Updated function signatures for async handlers

2. **Authentication Flow**
   - On page load, checks if user is authenticated via `/auth/user` endpoint
   - Displays login button for unauthenticated users
   - Shows user information and logout button for authenticated users
   - Handles login via Google OAuth redirect flow
   - Implements clean logout with session destruction

## Environment Configuration

The implementation requires the following environment variables:
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Server port (defaults to 5000)

## Security Considerations

1. **Session Security**
   - HttpOnly cookies to prevent XSS attacks
   - Secure cookies in production environment
   - Random session secret generation as fallback

2. **Authentication Protection**
   - Middleware to protect API routes requiring authentication
   - Proper session invalidation on logout

3. **Data Isolation**
   - User data stored separately per user ID
   - No cross-user data access

## Testing

The authentication flow has been tested with:
- New user registration via Google Sign-In
- Returning user authentication
- Data persistence across sessions
- Logout functionality
- Fallback to localStorage when unauthenticated

## Future Improvements

1. **Database Integration**
   - Currently uses in-memory storage for user data
   - Should integrate with PostgreSQL database using Drizzle ORM

2. **Enhanced Error Handling**
   - More detailed error messages for authentication failures
   - Better recovery mechanisms for network issues

3. **Account Linking**
   - Allow linking of existing accounts with Google OAuth
   - Support for multiple authentication providers

## Conclusion

The Google Sign-In authentication has been successfully implemented with all required features. Users can now sign in with their Google accounts, and their routine data will be saved and available across sessions. The implementation maintains backward compatibility with the existing localStorage approach for users who prefer not to authenticate.