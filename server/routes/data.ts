import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { type User } from "../storage";

const router = Router();

// Get user data
router.get("/api/user/data", requireAuth, async (req, res) => {
  try {
    // In a real implementation, we would fetch user-specific data from a database
    // For now, we'll return a default structure
    const user = req.user as User;
    const userData = await storage.getUserData(user.id);
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Save user data
router.post("/api/user/data", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const userData = req.body;
    await storage.saveUserData(user.id, userData);
    res.json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

export default router;