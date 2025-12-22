import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { type User } from "./storage";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Helper function to get the base URL
const getBaseUrl = (req: any): string => {
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.NODE_ENV === "production" ? "https://dailytracker-ftus.onrender.com/auth/google/callback" : "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user) {
          // Create new user if doesn't exist
          user = await storage.createGoogleUser({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value || "",
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;