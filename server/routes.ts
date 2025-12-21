import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register authentication routes
  app.use(authRoutes);
  
  // Register data routes
  app.use(dataRoutes);
  
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}
