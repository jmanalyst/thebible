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

// Helper function to format verse text
function formatVerseText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]/g, '<span class="red-letter">$1</span>');
}

// Helper function to get daily verse
function getDailyVerse() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const verseIndex = dayOfYear % bibleData.length;
    return bibleData[verseIndex];
}

// SERVER-SIDE RENDERING ENDPOINTS
app.get('/api/verse-picker', (req, res) => {
    const books = [...new Set(bibleData.map(v => v.book))];
    let html = '<div class="verse-picker">';
    html += '<h3>Select a Verse</h3>';
    html += '<div class="book-list">';
    books.forEach(book => {
        html += `<div class="book-item" data-book="${book}">${book}</div>`;
    });
    html += '</div>';
    html += '<div class="chapter-list" style="display: none;"></div>';
    html += '<div class="verse-list" style="display: none;"></div>';
    html += '</div>';
    
    res.json({ html });
});

app.get('/api/search-results', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({ html: '<p>Please enter a search term.</p>' });
    }
    
    const results = bibleData.filter(verse => 
        verse.text.toLowerCase().includes(query.toLowerCase()) ||
        verse.book.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
    
    if (results.length === 0) {
        return res.json({ html: '<p>No results found.</p>' });
    }
    
    let html = '<div class="search-results">';
    results.forEach(verse => {
        html += `<div class="verse-result" data-book="${verse.book}" data-chapter="${verse.chapter}" data-verse="${verse.verse}">`;
        html += `<div class="verse-reference">${verse.book} ${verse.chapter}:${verse.verse}</div>`;
        html += `<div class="verse-text">${formatVerseText(verse.text)}</div>`;
        html += '</div>';
    });
    html += '</div>';
    
    res.json({ html });
});

app.get('/api/daily-devotion', (req, res) => {
    const dailyVerse = getDailyVerse();
    const html = `
        <div class="daily-devotion">
            <h3>Daily Devotion</h3>
            <div class="devotion-verse">
                <div class="verse-reference">${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verse}</div>
                <div class="verse-text">${formatVerseText(dailyVerse.text)}</div>
            </div>
        </div>
    `;
    res.json({ html });
});

app.get('/api/chapter-content/:book/:chapter', (req, res) => {
    const { book, chapter } = req.params;
    
    const verses = bibleData.filter(v => 
        v.book.toLowerCase() === book.toLowerCase() &&
        parseInt(v.chapter) === parseInt(chapter)
    );
    
    if (verses.length === 0) {
        return res.json({ html: '<p>Chapter not found.</p>' });
    }
    
    let html = `<div class="chapter-content" data-book="${book}" data-chapter="${chapter}">`;
    html += `<h2>${book} Chapter ${chapter}</h2>`;
    verses.forEach(verse => {
        html += `<div class="verse-item" data-verse="${verse.verse}">`;
        html += `<span class="verse-number">${verse.verse}</span>`;
        html += `<span class="verse-text">${formatVerseText(verse.text)}</span>`;
        html += '</div>';
    });
    html += '</div>';
    
    res.json({ html });
});

app.get('/api/reader-interface', (req, res) => {
    const books = [...new Set(bibleData.map(v => v.book))];
    let html = '<div class="reader-interface">';
    html += '<h2>Bible Reader</h2>';
    html += '<div class="book-selector">';
    html += '<label for="book-select">Select Book:</label>';
    html += '<select id="book-select">';
    html += '<option value="">Choose a book...</option>';
    books.forEach(book => {
        html += `<option value="${book}">${book}</option>`;
    });
    html += '</select>';
    html += '</div>';
    html += '<div class="chapter-selector" style="display: none;">';
    html += '<label for="chapter-select">Select Chapter:</label>';
    html += '<select id="chapter-select"></select>';
    html += '</div>';
    html += '<div id="chapter-content"></div>';
    html += '</div>';
    
    res.json({ html });
});

// Original API Routes (keep for compatibility)
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