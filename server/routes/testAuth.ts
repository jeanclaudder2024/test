import { Router } from "express";
import { storage } from "../storage";
import { compare } from "../auth";

export const testAuthRouter = Router();

// Test route to check username/password without using passport session
testAuthRouter.post("/test-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Get user from storage
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare passwords
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Password is valid
    return res.status(200).json({
      message: "Credentials valid",
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Test login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});