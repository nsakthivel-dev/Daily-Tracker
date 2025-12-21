import { randomUUID } from "crypto";
import { type AppState, getMonday, createEmptyWeek } from "../shared/schema";

export interface User {
  id: string;
  username: string;
  password: string;
  googleId?: string;
  displayName?: string;
  email?: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface InsertGoogleUser {
  googleId: string;
  displayName: string;
  email: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGoogleUser(user: InsertGoogleUser): Promise<User>;
  getUserData(userId: string): Promise<AppState>;
  saveUserData(userId: string, data: AppState): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userData: Map<string, AppState>;

  constructor() {
    this.users = new Map();
    this.userData = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGoogleUser(insertUser: InsertGoogleUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByGoogleId(insertUser.googleId);
    if (existingUser) {
      return existingUser;
    }

    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.email,
      password: "", // No password for Google users
      googleId: insertUser.googleId,
      displayName: insertUser.displayName,
      email: insertUser.email
    };
    this.users.set(id, user);
    return user;
  }

  async getUserData(userId: string): Promise<AppState> {
    // Return existing user data or create initial state
    const existingData = this.userData.get(userId);
    if (existingData) {
      return existingData;
    }

    // Create initial state for new user
    const today = new Date();
    const monday = getMonday(today);
    const currentWeek = createEmptyWeek(monday);
    
    const initialState: AppState = {
      weeks: [currentWeek],
      currentWeekId: currentWeek.id,
      selectedWeekId: currentWeek.id,
    };

    this.userData.set(userId, initialState);
    return initialState;
  }

  async saveUserData(userId: string, data: AppState): Promise<void> {
    this.userData.set(userId, data);
  }
}

export const storage = new MemStorage();
