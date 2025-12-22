import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { type User } from "../storage";
import { type AppState, type Routine } from "../../shared/schema";

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

// Add a new routine
router.post("/api/user/routine", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const { routine } = req.body;
    
    // Get current user data
    const userData = await storage.getUserData(user.id);
    
    // Find the current week
    const currentWeekIndex = userData.weeks.findIndex(w => w.id === userData.selectedWeekId);
    if (currentWeekIndex === -1) {
      return res.status(400).json({ error: "Current week not found" });
    }
    
    // Add the new routine to the current week
    const updatedWeeks = [...userData.weeks];
    updatedWeeks[currentWeekIndex] = {
      ...updatedWeeks[currentWeekIndex],
      routines: [...updatedWeeks[currentWeekIndex].routines, routine]
    };
    
    const updatedData: AppState = {
      ...userData,
      weeks: updatedWeeks
    };
    
    // Save updated data
    await storage.saveUserData(user.id, updatedData);
    res.json({ message: "Routine added successfully", data: updatedData });
  } catch (error) {
    console.error("Error adding routine:", error);
    res.status(500).json({ error: "Failed to add routine" });
  }
});

// Delete a routine
router.delete("/api/user/routine/:index", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const routineIndex = parseInt(req.params.index);
    
    if (isNaN(routineIndex)) {
      return res.status(400).json({ error: "Invalid routine index" });
    }
    
    // Get current user data
    const userData = await storage.getUserData(user.id);
    
    // Find the current week
    const currentWeekIndex = userData.weeks.findIndex(w => w.id === userData.selectedWeekId);
    if (currentWeekIndex === -1) {
      return res.status(400).json({ error: "Current week not found" });
    }
    
    // Validate routine index
    if (routineIndex < 0 || routineIndex >= userData.weeks[currentWeekIndex].routines.length) {
      return res.status(400).json({ error: "Invalid routine index" });
    }
    
    // Remove the routine from the current week
    const updatedWeeks = [...userData.weeks];
    const updatedRoutines = [...updatedWeeks[currentWeekIndex].routines];
    updatedRoutines.splice(routineIndex, 1);
    
    updatedWeeks[currentWeekIndex] = {
      ...updatedWeeks[currentWeekIndex],
      routines: updatedRoutines
    };
    
    const updatedData: AppState = {
      ...userData,
      weeks: updatedWeeks
    };
    
    // Save updated data
    await storage.saveUserData(user.id, updatedData);
    res.json({ message: "Routine deleted successfully", data: updatedData });
  } catch (error) {
    console.error("Error deleting routine:", error);
    res.status(500).json({ error: "Failed to delete routine" });
  }
});

export default router;