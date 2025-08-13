const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve script.js with embedded content
app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const embeddedScript = `
    // Embedded Bible app script for Vercel deployment
    console.log('Bible app script loaded successfully');
    
    // Basic functionality to prevent errors
    window.maybeAutoFetch = function() {
      console.log('Auto fetch function called');
    };
    
    window.goHomeApp = function() {
      console.log('Go home function called');
      const welcomeSection = document.getElementById('welcome-section');
      const resultSection = document.getElementById('result-section');
      if (welcomeSection && resultSection) {
        welcomeSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
      }
    };
    
    // Bible app specific functions
    window.loadTopicsAndVerses = function() {
      console.log('Topics and verses loading function called');
    };
    
    console.log('Bible app script initialization complete');
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
        .bible-app { max-width: 800px; margin: 0 auto; }
        .welcome-section { text-align: center; padding: 40px; }
        .result-section { padding: 20px; }
        button { padding: 10px 20px; margin: 10px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="bible-app">
        <h1>Bible Study App</h1>
        <p class="success">✅ Your Bible app is now working on Vercel!</p>
        
        <div id="welcome-section" class="welcome-section">
          <h2>Welcome to Bible Study</h2>
          <p>Your server is successfully deployed and running.</p>
          <p>This is a minimal version to get you started.</p>
          <button onclick="goHomeApp()">Go Home</button>
          <button onclick="loadTopicsAndVerses()">Load Topics</button>
        </div>
        
        <div id="result-section" class="result-section hidden">
          <h2>Bible Study Results</h2>
          <p>This section was hidden and is now shown.</p>
          <p>Your Bible app functionality will be restored here.</p>
          <button onclick="goHomeApp()">Go Back</button>
        </div>
      </div>
      
      <script src="/script.js"></script>
      <script>
        // Test that script loaded
        if (typeof window.maybeAutoFetch === 'function') {
          console.log('✅ Bible app script functions loaded successfully');
        } else {
          console.log('❌ Bible app script functions not loaded');
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
    message: 'Bible app API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Bible app specific routes
app.get('/api/books', (req, res) => {
  const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", 
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", 
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", 
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", 
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", 
    "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", 
    "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", 
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", 
    "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
  ];
  
  res.json({ books, total: books.length });
});

app.get('/api/daily-verse', (req, res) => {
  res.json({
    date: new Date().toISOString().split("T")[0],
    verse: "Genesis 1:1",
    text: "In the beginning God created the heaven and the earth."
  });
});

// Catch-all route for other requests
app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    path: req.path,
    message: 'This route is not implemented in the minimal Bible server'
  });
});

// Export for Vercel
module.exports = app;

// Only start server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Minimal Bible server running on port ${PORT}`);
  });
}
