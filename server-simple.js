const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve script.js with embedded content
app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const embeddedScript = `
    // Embedded script content for Vercel deployment
    console.log('Script loaded successfully');
    
    // Basic functionality to prevent errors
    window.maybeAutoFetch = function() {
      console.log('Auto fetch function called');
    };
    
    window.goHomeApp = function() {
      console.log('Go home function called');
      // Basic home functionality
      const welcomeSection = document.getElementById('welcome-section');
      const resultSection = document.getElementById('result-section');
      if (welcomeSection && resultSection) {
        welcomeSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
      }
    };
    
    // Add any other essential functions your app needs
    console.log('Script initialization complete');
  `;
  
  res.send(embeddedScript);
});

// Serve index.html
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bible Study App</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .hidden { display: none; }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Bible Study App</h1>
      <p class="success">✅ Server is working on Vercel!</p>
      
      <div id="welcome-section">
        <h2>Welcome</h2>
        <p>Your server is successfully deployed and running.</p>
        <button onclick="goHomeApp()">Go Home</button>
      </div>
      
      <div id="result-section" class="hidden">
        <h2>Result Section</h2>
        <p>This section was hidden and is now shown.</p>
        <button onclick="goHomeApp()">Go Back</button>
      </div>
      
      <script src="/script.js"></script>
      <script>
        // Test that script loaded
        if (typeof window.maybeAutoFetch === 'function') {
          console.log('✅ Script functions loaded successfully');
        } else {
          console.log('❌ Script functions not loaded');
        }
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all route for other requests
app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    path: req.path,
    message: 'This route is not implemented in the simple server'
  });
});

// Export for Vercel
module.exports = app;

// Only start server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
  });
}
