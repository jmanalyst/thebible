const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Load Bible data once at startup
let bibleData = [];
try {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'kjv.json'), 'utf8'));
  bibleData = Array.isArray(data) ? data : (Array.isArray(data.verses) ? data.verses : []);
  console.log(`Loaded ${bibleData.length} Bible verses`);
} catch (error) {
  console.error('Failed to load Bible data:', error);
}

// Helper functions
function formatVerseText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]/g, '<span class="red-letter">$1</span>');
}

function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const verseIndex = dayOfYear % bibleData.length;
  return bibleData[verseIndex] || { text: "For God so loved the world...", verse: "John 3:16" };
}

// API Routes to protect kjv.json
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
  ).slice(0, 50);
  
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

// Block direct access to kjv.json
app.get('/public/kjv.json', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Block direct access to script.js (serve obfuscated version instead)
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script-obfuscated.js'));
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 