import { type Request, type Response, type NextFunction } from "express";

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ 
    error: "Authentication required",
    message: "You must be logged in to access this resource"
  });
}

// Middleware to check if user is NOT authenticated (for guest routes)
export function requireNoAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return next();
  }
  
  res.status(400).json({ 
    error: "Already authenticated",
    message: "You are already logged in"
  });
}