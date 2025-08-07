// server.js (updated)

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

// Book list and chapter counts
const books = [...new Set(bibleData.map(v => v.book_name))];
const chapterCounts = books.reduce((acc, book) => {
  const chapters = bibleData.filter(v => v.book_name === book).map(v => v.chapter);
  acc[book] = Math.max(...chapters);
  return acc;
}, {});

// Server-side text formatting functions
function formatVerseText(text) {
  // Simple server-side formatting - no tooltips needed since they're client-side
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]/g, '<span class="red-letter">$1</span>')
    .trim();
}

function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const verseIndex = dayOfYear % bibleData.length;
  const verse = bibleData[verseIndex];
  return {
    book: verse.book_name,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text
  };
}

// --- API Endpoints ---
app.get('/api/search-results', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json({ html: '<p>Please enter a search term.</p>' });
  }
  
  const results = bibleData.filter(verse => 
    verse.text.toLowerCase().includes(query.toLowerCase()) ||
    verse.book_name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);
  
  if (results.length === 0) {
    return res.json({ html: '<p>No results found.</p>' });
  }
  
  let html = '<div class="search-results">';
  results.forEach(verse => {
    html += `<div class="verse-result" data-book="${verse.book_name}" data-chapter="${verse.chapter}" data-verse="${verse.verse}">`;
    html += `<div class="verse-reference">${verse.book_name} ${verse.chapter}:${verse.verse}</div>`;
    html += `<div class="verse-text">${formatVerseText(verse.text)}</div>`;
    html += '</div>';
  });
  html += '</div>';
  
  res.json({ html });
});

app.get('/api/book-picker', (req, res) => {
  let html = '<div class="book-picker">';
  html += '<h3>Select a Book</h3>';
  html += '<div class="book-grid">';
  books.forEach(book => {
    html += `<div class="book-item" data-book="${book}">${book}</div>`;
  });
  html += '</div>';
  html += '<button onclick="closeBookPicker()" class="mt-4 w-full text-sm text-theme-subtle-text py-1 border border-theme-border rounded hover:bg-theme-border">Cancel</button>';
  html += '</div>';
  
  res.json({ html });
});

app.get('/api/chapter-picker', (req, res) => {
  const book = req.query.book;
  if (!book) {
    return res.json({ html: '<p>No book selected</p>' });
  }
  
  const chapters = Array.from({ length: chapterCounts[book] }, (_, i) => i + 1);
  
  let html = '<div class="chapter-picker">';
  html += `<h3>Select a Chapter from ${book}</h3>`;
  html += '<div class="chapter-grid">';
  chapters.forEach(chapter => {
    html += `<div class="chapter-item" data-chapter="${chapter}">${chapter}</div>`;
  });
  html += '</div>';
  html += '<button onclick="closeChapterPicker()" class="mt-4 w-full text-sm text-theme-subtle-text py-1 border border-theme-border rounded hover:bg-theme-border">Cancel</button>';
  html += '</div>';
  
  res.json({ html });
});

app.get('/api/verse-picker', (req, res) => {
  const book = req.query.book;
  const chapter = req.query.chapter;
  
  if (!book || !chapter) {
    return res.json({ html: '<p>Please select a book and chapter first</p>' });
  }
  
  const verses = bibleData
    .filter(v => v.book_name.toLowerCase() === book.toLowerCase() && parseInt(v.chapter) === parseInt(chapter))
    .sort((a, b) => parseInt(a.verse) - parseInt(b.verse));
  
  let html = '<div class="verse-picker">';
  html += `<h3>Select a Verse from ${book} Chapter ${chapter}</h3>`;
  html += '<div class="verse-grid">';
  verses.forEach(verse => {
    html += `<div class="verse-item" data-verse="${verse.verse}">${verse.verse}</div>`;
  });
  html += '</div>';
  html += '<button onclick="closeVersePicker()" class="mt-4 w-full text-sm text-theme-subtle-text py-1 border border-theme-border rounded hover:bg-theme-border">Cancel</button>';
  html += '</div>';
  
  res.json({ html });
});

app.get('/api/verse-content/:book/:chapter/:verse', (req, res) => {
  const { book, chapter, verse } = req.params;
  
  const result = bibleData.find(v => 
    v.book_name.toLowerCase() === book.toLowerCase() &&
    parseInt(v.chapter) === parseInt(chapter) &&
    parseInt(v.verse) === parseInt(verse)
  );
  
  if (!result) {
    return res.json({ html: '<p>Verse not found</p>' });
  }
  
  let html = '<div class="verse-content">';
  html += `<h2>${book} ${chapter}:${verse}</h2>`;
  html += `<div class="verse-text">${formatVerseText(result.text)}</div>`;
  html += '</div>';
  
  res.json({ html });
});

app.get('/api/chapter-content/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  
  const verses = bibleData.filter(v => 
    v.book_name.toLowerCase() === book.toLowerCase() &&
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

app.get('/api/reader-interface', (req, res) => {
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

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;