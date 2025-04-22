import { Router } from "express";
import { storage } from "../storage";
import { compare } from "../auth";
import { hashPassword } from "../auth";

export const testAuthRouter = Router();

// Test route to check username/password without using passport session
testAuthRouter.post("/test-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Test login attempt for:", username);
    
    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Get user from storage
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.log(`User not found in database: ${username}`);
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log(`Found user: ${username}, isAdmin: ${Boolean(user.isAdmin)}, role: ${user.role || 'none'}`);
    
    // Compare passwords
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${username}`);
      return res.status(401).json({ message: "Invalid password" });
    }
    
    console.log(`Password valid for user: ${username}`);
    
    // Password is valid
    return res.status(200).json({
      message: "Credentials valid",
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Test login error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: String(error) 
    });
  }
});

// List all users (admin usernames only for security) for testing purposes
testAuthRouter.get("/users", async (req, res) => {
  try {
    // Get all users from database
    const allUsers = await storage.getAllUsers();
    
    // Map to just return usernames and admin status
    const usersList = allUsers.map((user: { 
      username: string; 
      isAdmin?: boolean | null; 
      role?: string | null 
    }) => ({
      username: user.username,
      isAdmin: Boolean(user.isAdmin),
      role: user.role || 'user'
    }));
    
    return res.status(200).json({
      count: usersList.length,
      users: usersList
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create an admin user for testing
testAuthRouter.post("/create-admin", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create a new user with admin role
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      email: email || null,
      isAdmin: true,
      role: 'admin',
      isSubscribed: true,
      subscriptionTier: 'premium',
      createdAt: new Date()
    });
    
    // Return the created user without the password
    return res.status(201).json({
      message: "Admin user created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ 
      message: "Failed to create admin user", 
      error: String(error) 
    });
  }
});