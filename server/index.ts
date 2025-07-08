import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { log } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

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
  try {
    // Simple Supabase-only setup
    console.log('🚀 Starting oil vessel tracking platform with Supabase...');
    
    // Server setup for Render deployment
    const port = parseInt(process.env.PORT || "5000", 10);
    
    // Add timeout handling for Render
    const startupTimeout = setTimeout(() => {
      console.error('Startup timeout - forcing server start');
      process.exit(1);
    }, 60000); // 60 second timeout
    
    // Initialize custom authentication tables with timeout
    try {
      console.log('Initializing database...');
      const { initializeCustomAuthTables } = await import("./database-init");
      await Promise.race([
        initializeCustomAuthTables(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database init timeout')), 30000))
      ]);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error("Database init failed, continuing anyway:", error);
    }

    // Import and register API routes
    console.log('Registering routes...');
    const { registerRoutes } = await import("./routes");
    const server = await registerRoutes(app);
    
    // Setup Vite in development mode BEFORE starting the server
    if (process.env.NODE_ENV === "development") {
      try {
        const { setupVite } = await import("./vite");
        await setupVite(app, server);
        log("✅ Vite development server configured successfully");
      } catch (error) {
        console.error("❌ Vite setup failed:", error);
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
    
    // Clear startup timeout
    clearTimeout(startupTimeout);
    
    // Start the server - bind to 0.0.0.0 for Render deployment
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${port}`);
      console.log('✅ Platform ready with Supabase authentication!');
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });
})();
