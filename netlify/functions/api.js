import express from "express";
import serverless from "serverless-http";
import { setupSupabaseAuth } from "../../server/supabase-simple-auth.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Supabase authentication
setupSupabaseAuth(app);

// Import and register API routes
import("../../server/routes.js").then(({ registerRoutes }) => {
  registerRoutes(app);
});

export const handler = serverless(app);