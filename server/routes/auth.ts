import { Router } from "express";
import passport from "passport";

const router = Router();

// Health check endpoint for Render
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to get the base URL
const getBaseUrl = (req: any): string => {
  const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

// Google OAuth routes
router.get(
  "/auth/google",
  (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const baseUrl = getBaseUrl(req);
      const authenticator = passport.authenticate("google", { 
        scope: ["profile", "email"],
        callbackURL: `${baseUrl}/auth/google/callback`
      });
      return authenticator(req, res, next);
    }
    return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  }
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const baseUrl = getBaseUrl(req);
      const authenticator = passport.authenticate("google", { 
        failureRedirect: "/",
        callbackURL: `${baseUrl}/auth/google/callback`
      });
      return authenticator(req, res, next);
    }
    return passport.authenticate("google", { failureRedirect: "/" })(req, res, next);
  },
  (req, res) => {
    // Successful authentication, redirect to home
    res.redirect("/");
  }
);

// Logout route
router.post("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session?.destroy(() => {});
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/auth/user", (req, res) => {
  if (req.user) {
    res.json({
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.email,
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;