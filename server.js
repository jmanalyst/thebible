const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// Add security headers (but not for static files)
app.use((req, res, next) => {
    // Don't add nosniff for JavaScript files
    if (!req.path.endsWith('.js')) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Load Bible data once at startup
let bibleData = null;
try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'kjv.json'), 'utf8'));
    bibleData = Array.isArray(data) ? data : (Array.isArray(data.verses) ? data.verses : []);
    console.log(`Loaded ${bibleData.length} Bible verses`);
} catch (error) {
    console.error('Failed to load Bible data:', error);
    bibleData = [];
}

// API Routes
app.get('/api/bible-data', (req, res) => {
    res.json({ verses: bibleData });
});

app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const results = bibleData.filter(verse => 
        verse.text.toLowerCase().includes(query.toLowerCase()) ||
        verse.book.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 50); // Limit results
    
    res.json({ results });
});

app.get('/api/verse/:book/:chapter/:verse', (req, res) => {
    const { book, chapter, verse } = req.params;
    
    const result = bibleData.find(v => 
        v.book.toLowerCase() === book.toLowerCase() &&
        parseInt(v.chapter) === parseInt(chapter) &&
        parseInt(v.verse) === parseInt(verse)
    );
    
    if (!result) {
        return res.status(404).json({ error: 'Verse not found' });
    }
    
    res.json(result);
});

app.get('/api/chapter/:book/:chapter', (req, res) => {
    const { book, chapter } = req.params;
    
    const results = bibleData.filter(v => 
        v.book.toLowerCase() === book.toLowerCase() &&
        parseInt(v.chapter) === parseInt(chapter)
    );
    
    res.json({ verses: results });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ensure script-protected.js is served with correct MIME type
app.get('/script-protected.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'script-protected.js'));
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app; 