import express, { type Request, Response, NextFunction } from "express";
import { log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Simple Supabase-only setup
  console.log('🚀 Starting oil vessel tracking platform with Supabase...');
  
  // Server setup for Render deployment
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Note: Authentication will be handled on the frontend with Supabase
  
  // Initialize custom authentication tables
  try {
    const { initializeCustomAuthTables } = await import("./database-init");
    await initializeCustomAuthTables();
  } catch (error) {
    console.error("Failed to initialize auth tables:", error);
  }

  // Import and register API routes
  const { registerRoutes } = await import("./routes");
  const server = await registerRoutes(app);
  
  // Start the server - bind to 0.0.0.0 for Render deployment
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port}`);
  });
  
  console.log('✅ Platform ready with Supabase authentication!');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (error) {
      console.log("Development mode: Vite setup skipped");
    }
  } else {
    // Production mode: serve static files
    const path = await import("path");
    const fs = await import("fs");
    
    // Static files are built to dist/client by Vite
    const staticPath = path.join(process.cwd(), "dist", "client");
    const indexPath = path.join(staticPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      app.use(express.static(staticPath));
      app.get("*", (_req, res) => {
        res.sendFile(indexPath);
      });
      log(`Production static files served from ${staticPath}`);
    } else {
      // List available directories for debugging
      const currentDir = fs.readdirSync(process.cwd());
      log(`Available directories: ${currentDir.join(", ")}`);
      
      // Serve basic response
      app.get("*", (_req, res) => {
        res.status(200).send(`
          <html>
            <head><title>Oil Vessel Tracker</title></head>
            <body>
              <h1>Oil Vessel Tracking Platform</h1>
              <p>API is running. Static files not found.</p>
              <p>Available directories: ${currentDir.join(", ")}</p>
            </body>
          </html>
        `);
      });
      log("Serving basic HTML response - static files not found");
    }
  }

  // Server already started above - no need to start again
})();
