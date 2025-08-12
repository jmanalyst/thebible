const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { SECURITY_CONFIG, SecurityMiddleware } = require('./security-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment-based security
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Session management for Bible access
const activeSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Middleware
app.use(cors());
app.use(express.json());

// TEMPORARILY DISABLED SECURITY MIDDLEWARE for debugging
app.use((req, res, next) => {
  const url = req.url;
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Only block direct access to Bible data files
  if (url.includes('/data/') && url.endsWith('.json')) {
    console.log(`🚫 BLOCKED: Direct access to Bible data: ${url} from ${clientIP}`);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Direct access to Bible data files is not allowed'
    });
  }
  
  next();
});

// Add cache control headers to prevent meta tag caching for HTML pages
app.use((req, res, next) => {
  // For HTML pages, prevent caching to ensure fresh meta tags
  if (req.url === '/' || req.url === '/index.html' || req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  // Apply all security headers
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Ensure Bible data is never cached in browser
  if (req.url.includes('/api/verse/') || req.url.includes('/api/chapter/') || 
      req.url.includes('/api/search') || req.url.includes('/api/daily-verse')) {
    res.setHeader('Cache-Control', SECURITY_CONFIG.BIBLE_CACHE_CONTROL);
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// SECURITY: No Bible data loaded on startup - all data accessed on-demand through secure endpoints
console.log('🔒 Bible data protection: ACTIVE - No data pre-loaded');

// Static data constants moved from script.js
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// Book name mapping for Spanish translations
const bookNameMappings = {
  'rvg': {
    'Genesis': 'Génesis',
    'Exodus': 'Éxodo',
    'Leviticus': 'Levítico',
    'Numbers': 'Números',
    'Deuteronomy': 'Deuteronomio',
    'Joshua': 'Josué',
    'Judges': 'Jueces',
    'Ruth': 'Rut',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reyes',
    '2 Kings': '2 Reyes',
    '1 Chronicles': '1 Crónicas',
    '2 Chronicles': '2 Crónicas',
    'Ezra': 'Esdras',
    'Nehemiah': 'Nehemías',
    'Esther': 'Ester',
    'Job': 'Job',
    'Psalms': 'Salmos',
    'Proverbs': 'Proverbios',
    'Ecclesiastes': 'Eclesiastés',
    'Song of Solomon': 'Cantares',
    'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremías',
    'Lamentations': 'Lamentaciones',
    'Ezekiel': 'Ezequiel',
    'Daniel': 'Daniel',
    'Hosea': 'Oseas',
    'Joel': 'Joel',
    'Amos': 'Amós',
    'Obadiah': 'Abdías',
    'Jonah': 'Jonás',
    'Micah': 'Miqueas',
    'Nahum': 'Nahúm',
    'Habakkuk': 'Habacuc',
    'Zephaniah': 'Sofonías',
    'Haggai': 'Hageo',
    'Zechariah': 'Zacarías',
    'Malachi': 'Malaquías',
    'Matthew': 'Mateo',
    'Mark': 'Marcos',
    'Luke': 'Lucas',
    'John': 'Juan',
    'Acts': 'Hechos',
    'Romans': 'Romanos',
    '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios',
    'Galatians': 'Gálatas',
    'Ephesians': 'Efesios',
    'Philippians': 'Filipenses',
    'Colossians': 'Colosenses',
    '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses',
    '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo',
    'Titus': 'Tito',
    'Philemon': 'Filemón',
    'Hebrews': 'Hebreos',
    'James': 'Santiago',
    '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro',
    '1 John': '1 Juan',
    '2 John': '2 Juan',
    '3 John': '3 Juan',
    'Jude': 'Judas',
    'Revelation': 'Apocalipsis'
  },
  'rvg_2004': {
    'Genesis': 'Génesis',
    'Exodus': 'Éxodo',
    'Leviticus': 'Levítico',
    'Numbers': 'Números',
    'Deuteronomy': 'Deuteronomio',
    'Joshua': 'Josué',
    'Judges': 'Jueces',
    'Ruth': 'Rut',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reyes',
    '2 Kings': '2 Reyes',
    '1 Chronicles': '1 Crónicas',
    '2 Chronicles': '2 Crónicas',
    'Ezra': 'Esdras',
    'Nehemiah': 'Nehemías',
    'Esther': 'Ester',
    'Job': 'Job',
    'Psalms': 'Salmos',
    'Proverbs': 'Proverbios',
    'Ecclesiastes': 'Eclesiastés',
    'Song of Solomon': 'Cantares',
    'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremías',
    'Lamentations': 'Lamentaciones',
    'Ezekiel': 'Ezequiel',
    'Daniel': 'Daniel',
    'Hosea': 'Oseas',
    'Joel': 'Joel',
    'Amos': 'Amós',
    'Obadiah': 'Abdías',
    'Jonah': 'Jonás',
    'Micah': 'Miqueas',
    'Nahum': 'Nahúm',
    'Habakkuk': 'Habacuc',
    'Zephaniah': 'Sofonías',
    'Haggai': 'Hageo',
    'Zechariah': 'Zacarías',
    'Malachi': 'Malaquías',
    'Matthew': 'Mateo',
    'Mark': 'Marcos',
    'Luke': 'Lucas',
    'John': 'Juan',
    'Acts': 'Hechos',
    'Romans': 'Romanos',
    '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios',
    'Galatians': 'Gálatas',
    'Ephesians': 'Efesios',
    'Philippians': 'Filipenses',
    'Colossians': 'Colosenses',
    '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses',
    '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo',
    'Titus': 'Tito',
    'Philemon': 'Filemón',
    'Hebrews': 'Hebreos',
    'James': 'Santiago',
    '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro',
    '1 John': '1 Juan',
    '2 John': '2 Juan',
    '3 John': '3 Juan',
    'Jude': 'Judas',
    'Revelation': 'Apocalipsis'
  },
  'rv_1909': {
    'Genesis': 'Génesis',
    'Exodus': 'Éxodo',
    'Leviticus': 'Levítico',
    'Numbers': 'Números',
    'Deuteronomy': 'Deuteronomio',
    'Joshua': 'Josué',
    'Judges': 'Jueces',
    'Ruth': 'Rut',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reyes',
    '2 Kings': '2 Reyes',
    '1 Chronicles': '1 Crónicas',
    '2 Chronicles': '2 Crónicas',
    'Ezra': 'Esdras',
    'Nehemiah': 'Nehemías',
    'Esther': 'Ester',
    'Job': 'Job',
    'Psalms': 'Salmos',
    'Proverbs': 'Proverbios',
    'Ecclesiastes': 'Eclesiastés',
    'Song of Solomon': 'Cantares',
    'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremías',
    'Lamentations': 'Lamentaciones',
    'Ezekiel': 'Ezequiel',
    'Daniel': 'Daniel',
    'Hosea': 'Oseas',
    'Joel': 'Joel',
    'Amos': 'Amós',
    'Obadiah': 'Abdías',
    'Jonah': 'Jonás',
    'Micah': 'Miqueas',
    'Nahum': 'Nahúm',
    'Habakkuk': 'Habacuc',
    'Zephaniah': 'Sofonías',
    'Haggai': 'Hageo',
    'Zechariah': 'Zacarías',
    'Malachi': 'Malaquías',
    'Matthew': 'Mateo',
    'Mark': 'Marcos',
    'Luke': 'Lucas',
    'John': 'Juan',
    'Acts': 'Hechos',
    'Romans': 'Romanos',
    '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios',
    'Galatians': 'Gálatas',
    'Ephesians': 'Efesios',
    'Philippians': 'Filipenses',
    'Colossians': 'Colosenses',
    '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses',
    '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo',
    'Titus': 'Tito',
    'Philemon': 'Filemón',
    'Hebrews': 'Hebreos',
    'James': 'Santiago',
    '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro',
    '1 John': '1 Juan',
    '2 John': '2 Juan',
    '3 John': '3 Juan',
    'Jude': 'Judas',
    'Revelation': 'Apocalipsis'
  }
};

// Function to get the correct book name for a translation
function getBookNameForTranslation(englishBookName, translation) {
  if (bookNameMappings[translation] && bookNameMappings[translation][englishBookName]) {
    return bookNameMappings[translation][englishBookName];
  }
  return englishBookName; // Return original if no mapping found
}

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu", "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa", "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr", "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro", "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal", "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom", "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th", "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb", "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo", "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

// Helper functions moved from script.js
function cleanVerseText(text) {
  // The only job of this function is now to trim whitespace.
  return text.trim();
}

function formatRedLetterText(text) {
  let healedText = text;

  // Step 1 & 2 & 3: Heal the gaps caused by bracketed text (from our previous fix)
  healedText = healedText.replace(/\u203A\s*\[(.*?)\]\s*\u2039/g, ' $1 ');
  healedText = healedText.replace(/\[(.*?)\]\s*\u2039/g, '\u2039$1 ');
  healedText = healedText.replace(/\u203A\s*\[(.*?)\]/g, ' $1\u203A');

  // Step 4: Format the text as red
  let formattedText = healedText.replace(/\u2039/g, '<span style="color: var(--color-red-letter)">');

  // NEW (Step 5): Smartly handle closing quotes to include punctuation
  // This finds › followed by punctuation, and moves the punctuation inside the closing </span> tag.
  formattedText = formattedText.replace(/\u203A([,.:;?!])/g, '$1</span>');

  // NEW (Step 6): Clean up any remaining closing quotes that had no punctuation
  formattedText = formattedText.replace(/\u203A/g, '</span>');
  
  return formattedText;
}

function formatTranslatorText(text) {
  // This safely finds text between an opening and closing bracket
  // and wraps it in an <em> (italic) tag.
  return text.replace(/\[(.*?)\]/g, '<em>$1</em>');
}

// Enhanced daily verse generation with better randomization
function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // SECURITY: Load KJV data on-demand for daily verse only
  try {
    const filePath = path.join(__dirname, 'data', 'kjv.json');
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const verses = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.verses) ? rawData.verses : []);
    
    if (verses.length > 0) {
      const seed = today.getFullYear() * 1000 + dayOfYear;
      const randomIndex = (seed * 9301 + 49297) % verses.length;
      
      const verse = verses[randomIndex] || verses[0];
      const verseRef = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
      
      return {
        date: today.toISOString().split("T")[0],
        verse: verseRef,
        text: verse.text
      };
    }
  } catch (error) {
    console.error('Failed to load daily verse:', error);
  }
  
  // Fallback
  return {
    date: today.toISOString().split("T")[0],
    verse: "Genesis 1:1",
    text: "In the beginning God created the heaven and the earth."
  };
}

// Function to generate meta tags for a specific verse
function generateVerseMetaTags(book, chapter, verse, verseText) {
  const title = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
  const description = verseText ? 
    verseText.replace(/[^\w\s]/g, '').substring(0, 140) + '...' : 
    `Read ${book} chapter ${chapter} from the Bible`;
  
  return {
    title: `${title} | The Living Word Online`,
    description: description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://thelivingwordonline.com/${book.toLowerCase()}/${chapter}${verse ? `/${verse}` : ''}`,
    twitterTitle: title,
    twitterDescription: description,
    twitterUrl: `https://thelivingwordonline.com/${book.toLowerCase()}/${chapter}${verse ? `/${verse}` : ''}`
  };
}

// SECURITY: No bulk Bible data access allowed
app.get('/api/bible-data', (req, res) => {
  res.status(403).json({ 
    error: 'Bulk Bible data access not allowed',
    message: 'Use specific verse and chapter endpoints instead'
  });
});

app.get('/api/books', (req, res) => {
  res.json({ books, bookAbbreviations, chapterCounts });
});

app.get('/api/daily-verse', (req, res) => {
  res.json(getDailyVerse());
});

// Search API endpoint
app.get('/api/search', (req, res) => {
  const { q: query, translation = 'kjv', filter = 'all', book = '' } = req.query;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const filePath = path.join(__dirname, 'data', `${translation}.json`);
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Handle different data structures
    let verses = [];
    if (Array.isArray(rawData)) {
      verses = rawData;
    } else if (rawData.verses && Array.isArray(rawData.verses)) {
      verses = rawData.verses;
    } else {
      throw new Error('Invalid data format');
    }

    // Apply filters
    let filteredVerses = [...verses];
    
    if (filter === 'ot') {
      // Old Testament books (Genesis to Malachi)
      const otBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
      filteredVerses = filteredVerses.filter(v => otBooks.includes(v.book_name));
    } else if (filter === 'nt') {
      // New Testament books (Matthew to Revelation)
      const ntBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
      filteredVerses = filteredVerses.filter(v => ntBooks.includes(v.book_name));
    } else if (filter === 'book' && book) {
      // Current book filter - use translated book name for Spanish translations
      const translatedBookName = getBookNameForTranslation(book, translation);
      filteredVerses = filteredVerses.filter(v => v.book_name.toLowerCase() === translatedBookName.toLowerCase());
    }

    // Search for query in verse text
    const searchQuery = query.toLowerCase();
    const results = filteredVerses
      .filter(v => v.text && v.text.toLowerCase().includes(searchQuery))
      .slice(0, 50); // Limit to 50 results for performance

    // Format results
    const formattedResults = results.map(v => ({
      book_name: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text
    }));

    res.json({
      query: query,
      translation: translation,
      filter: filter,
      book: book,
      total: results.length,
      results: formattedResults
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// COMPLETELY SECURE: No Bible data access - only serve specific content on demand
app.get('/api/translation/:version', (req, res) => {
  res.status(403).json({ 
    error: 'Direct translation access not allowed',
    message: 'Bible content is served through specific verse and chapter endpoints only'
  });
});

// SECURE: Only serve specific verses, never full translations
app.get('/api/verse/:book/:chapter/:verse', (req, res) => {
  const { book, chapter, verse } = req.params;
  const translation = req.query.translation || 'kjv';
  
  // Validate parameters
  if (!book || !chapter || !verse) {
    console.log(`❌ Missing parameters:`, { book, chapter, verse });
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Validate that chapter and verse are numbers
  if (isNaN(parseInt(chapter)) || isNaN(parseInt(verse))) {
    console.log(`❌ Invalid chapter or verse:`, { book, chapter, verse });
    return res.status(400).json({ error: 'Chapter and verse must be numbers' });
  }
  
  // Validate translation using security config
  if (!SecurityMiddleware.isValidTranslation(translation)) {
    console.log(`❌ Invalid translation:`, { translation, book, chapter, verse });
    return res.status(400).json({ error: 'Invalid translation' });
  }
  
  // Rate limiting using security config
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = {};
  }
  
  if (!req.app.locals.rateLimit[clientIP]) {
    req.app.locals.rateLimit[clientIP] = { 
      count: 0, 
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      firstRequest: now,
      burstCount: 0
    };
  }
  
  if (now > req.app.locals.rateLimit[clientIP].resetTime) {
    req.app.locals.rateLimit[clientIP] = { 
      count: 0, 
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      firstRequest: now,
      burstCount: 0
    };
  }
  
  const timeSinceFirst = now - req.app.locals.rateLimit[clientIP].firstRequest;
  if (timeSinceFirst < SECURITY_CONFIG.RATE_LIMIT.BURST_WINDOW_MS && 
      req.app.locals.rateLimit[clientIP].burstCount < SECURITY_CONFIG.RATE_LIMIT.MAX_BURST) {
    req.app.locals.rateLimit[clientIP].burstCount++;
  } else {
    if (req.app.locals.rateLimit[clientIP].count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      SecurityMiddleware.logSecurityEvent('RATE_LIMIT_VIOLATIONS', `IP ${clientIP} exceeded rate limit for verses`);
      console.log(`🚫 RATE LIMITED: IP ${clientIP} exceeded rate limit for verses`);
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    req.app.locals.rateLimit[clientIP].count++;
  }
  
  try {
    // Try multiple possible paths for Vercel compatibility
    const possiblePaths = [
      path.join(__dirname, 'data', `${translation}.json`),
      path.join(process.cwd(), 'data', `${translation}.json`),
      `./data/${translation}.json`
    ];
    
    console.log(`🔍 Attempting to read file with paths:`, possiblePaths);
    console.log(`🔍 Current directory: ${__dirname}`);
    console.log(`🔍 Process working directory: ${process.cwd()}`);
    
    let filePath = null;
    let rawData = null;
    
    // Try each possible path
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        console.log(`✅ Found file at: ${filePath}`);
        rawData = JSON.parse(fs.readFileSync(testPath, 'utf8'));
        break;
      }
    }
    
    if (!filePath || !rawData) {
      console.error(`❌ File not found in any of these paths:`, possiblePaths);
      return res.status(404).json({ 
        error: 'Translation file not found',
        translation: translation,
        possiblePaths: possiblePaths,
        currentDir: __dirname,
        processCwd: process.cwd()
      });
    }
    
    // Handle different data structures
    let verses = [];
    if (Array.isArray(rawData)) {
      verses = rawData;
    } else if (rawData.verses && Array.isArray(rawData.verses)) {
      verses = rawData.verses;
    } else {
      throw new Error('Invalid data format');
    }
    
    // Get the correct book name for this translation
    const translatedBookName = getBookNameForTranslation(book, translation);
    
    // Find specific verse
    const verseData = verses.find(v => 
      v.book_name && v.book_name.toLowerCase() === translatedBookName.toLowerCase() &&
      parseInt(v.chapter) === parseInt(chapter) &&
      parseInt(v.verse) === parseInt(verse)
    );
    
    if (!verseData) {
      console.log(`❌ Verse not found for:`, { book, chapter, verse });
      return res.status(404).json({ error: 'Verse not found' });
    }
    
    // Process and format the single verse only
    const processedVerse = {
      book_name: verseData.book_name,
      chapter: verseData.chapter,
      verse: verseData.verse,
      text: formatRedLetterText(verseData.text),
      translation: translation,
      timestamp: new Date().toISOString(),
      request_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    if (SECURITY_CONFIG.LOGGING.SUCCESSFUL_REQUESTS) {
      console.log(`✅ Single verse served: ${book} ${chapter}:${verse} (${translation}) to ${clientIP}`);
    }
    
    res.setHeader('Cache-Control', SECURITY_CONFIG.BIBLE_CACHE_CONTROL);
      res.json(processedVerse);
  
} catch (error) {
  console.error(`❌ Error serving verse:`, error);
  res.status(500).json({ error: 'Failed to serve verse' });
}
});

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    currentDir: __dirname,
    processCwd: process.cwd()
  });
});

// Debug endpoint to check file availability
app.get('/api/debug-files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const cwd = process.cwd();
    const dirname = __dirname;
    
    // List files in current working directory
    const cwdFiles = fs.readdirSync(cwd);
    
    // List files in __dirname
    const dirnameFiles = fs.readdirSync(dirname);
    
    // Check if specific files exist
    const scriptExists = fs.existsSync(path.join(cwd, 'script.js'));
    const indexExists = fs.existsSync(path.join(cwd, 'index.html'));
    const publicExists = fs.existsSync(path.join(cwd, 'public'));
    
    res.json({
      currentWorkingDirectory: cwd,
      dirname: dirname,
      cwdFiles: cwdFiles,
      dirnameFiles: dirnameFiles,
      scriptJsExists: scriptExists,
      indexHtmlExists: indexExists,
      publicDirExists: publicExists
    });
  } catch (error) {
    res.json({
      error: error.message,
      currentWorkingDirectory: process.cwd(),
      dirname: __dirname
    });
  }
});

// SECURE: Only serve specific chapters, never full translations
app.get('/api/chapter/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  const translation = req.query.translation || 'kjv';
  
  // Validate translation using security config
  if (!SecurityMiddleware.isValidTranslation(translation)) {
    return res.status(400).json({ error: 'Invalid translation' });
  }
  
  // Rate limiting using security config
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = {};
  }
  
  if (!req.app.locals.rateLimit[clientIP]) {
    req.app.locals.rateLimit[clientIP] = { 
      count: 0, 
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      firstRequest: now,
      burstCount: 0
    };
  }
  
  if (now > req.app.locals.rateLimit[clientIP].resetTime) {
    req.app.locals.rateLimit[clientIP] = { 
      count: 0, 
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      firstRequest: now,
      burstCount: 0
    };
  }
  
  const timeSinceFirst = now - req.app.locals.rateLimit[clientIP].firstRequest;
  if (timeSinceFirst < SECURITY_CONFIG.RATE_LIMIT.BURST_WINDOW_MS && 
      req.app.locals.rateLimit[clientIP].burstCount < SECURITY_CONFIG.RATE_LIMIT.MAX_BURST) {
    req.app.locals.rateLimit[clientIP].burstCount++;
  } else {
    if (req.app.locals.rateLimit[clientIP].count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      SecurityMiddleware.logSecurityEvent('RATE_LIMIT_VIOLATIONS', `IP ${clientIP} exceeded rate limit for chapters`);
      console.log(`🚫 RATE LIMITED: IP ${clientIP} exceeded rate limit for chapters`);
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    req.app.locals.rateLimit[clientIP].count++;
  }
  
  try {
    // Try multiple possible paths for Vercel compatibility
    const possiblePaths = [
      path.join(__dirname, 'data', `${translation}.json`),
      path.join(process.cwd(), 'data', `${translation}.json`),
      `./data/${translation}.json`
    ];
    
    console.log(`🔍 Attempting to read file with paths:`, possiblePaths);
    console.log(`🔍 Current directory: ${__dirname}`);
    console.log(`🔍 Process working directory: ${process.cwd()}`);
    
    let filePath = null;
    let rawData = null;
    
    // Try each possible path
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        console.log(`✅ Found file at: ${filePath}`);
        rawData = JSON.parse(fs.readFileSync(testPath, 'utf8'));
        break;
      }
    }
    
    if (!filePath || !rawData) {
      console.error(`❌ File not found in any of these paths:`, possiblePaths);
      return res.status(404).json({ 
        error: 'Translation file not found',
        translation: translation,
        possiblePaths: possiblePaths,
        currentDir: __dirname,
        processCwd: process.cwd()
      });
    }
    
    // Handle different data structures
    let verses = [];
    if (Array.isArray(rawData)) {
      verses = rawData;
    } else if (rawData.verses && Array.isArray(rawData.verses)) {
      verses = rawData.verses;
    } else {
      throw new Error('Invalid data format');
    }
    
    // Get the correct book name for this translation
    const translatedBookName = getBookNameForTranslation(book, translation);
    
    // Find specific chapter verses
    const chapterVerses = verses.filter(v => 
      v.book_name && v.book_name.toLowerCase() === translatedBookName.toLowerCase() &&
      parseInt(v.chapter) === parseInt(chapter)
    );
    
    if (chapterVerses.length === 0) {
      console.log(`❌ No verses found for ${book} ${chapter} in ${translation}`);
      return res.status(404).json({ error: 'Chapter not found' });
    }
    
    // Process only the chapter verses
    const processedVerses = chapterVerses.map(verse => ({
      book_name: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: formatRedLetterText(verse.text),
      translation: translation
    }));
    
    if (SECURITY_CONFIG.LOGGING.SUCCESSFUL_REQUESTS) {
      console.log(`✅ Chapter served: ${book} ${chapter} (${translation}) - ${processedVerses.length} verses to ${clientIP}`);
    }
    
    res.setHeader('Cache-Control', SECURITY_CONFIG.BIBLE_CACHE_CONTROL);
    res.json({ 
      book: book,
      chapter: chapter,
      translation: translation,
      verses: processedVerses,
      timestamp: new Date().toISOString(),
      request_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
  } catch (error) {
    console.error(`❌ Error serving chapter:`, error);
    res.status(500).json({ error: 'Failed to serve chapter' });
  }
});

// Route to serve Bible verses with pre-generated meta tags
app.get('/:book/:chapter/:verse?', (req, res) => {
  const { book, chapter, verse } = req.params;
  
  console.log('🔍 Verse route called:', { book, chapter, verse });
  
  // Instead of showing a redirect message, serve the main page with query parameters
  // This allows the frontend to handle the navigation and meta tags
  const redirectUrl = `/?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}${verse ? `&verse=${encodeURIComponent(verse)}` : ''}`;
  
  // Redirect immediately to the main page with parameters
  res.redirect(redirectUrl);
});

// Serve static files manually since express.static isn't working on Vercel
app.get('/script.js', (req, res) => {
  console.log(`🔍 Manually serving script.js`);
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(process.cwd(), 'script.js'));
});

app.get('/index.html', (req, res) => {
  console.log(`🔍 Manually serving index.html`);
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/public/:file', (req, res) => {
  const fileName = req.params.file;
  console.log(`🔍 Manually serving public file: ${fileName}`);
  
  // Set appropriate content type based on file extension
  if (fileName.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    res.setHeader('Content-Type', 'image/jpeg');
  }
  
  res.sendFile(path.join(process.cwd(), 'public', fileName));
});

// Also handle direct requests to hero.png (in case it's referenced without /public/ prefix)
app.get('/hero.png', (req, res) => {
  console.log(`🔍 Manually serving hero.png directly`);
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(process.cwd(), 'public', 'hero.png'));
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  console.log(`🔍 Manually serving favicon.ico`);
  res.setHeader('Content-Type', 'image/x-icon');
  res.sendFile(path.join(process.cwd(), 'public', 'hero.png')); // Using hero.png as favicon
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// COMPREHENSIVE PROTECTION: Block ALL possible access to Bible translation files
// Block direct access to data folder
app.get('/data/*', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Block any JSON files anywhere in the project
app.get('**/*.json', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Block specific Bible translation files
app.get('**/kjv.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});

app.get('**/asv.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});



app.get('**/rvg.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});

app.get('**/rvg_2004.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});

app.get('**/rv_1909.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});

app.get('**/web.json', (req, res) => {
    res.status(403).json({ error: 'Direct access to Bible data files is not allowed' });
});

// Block any attempts to access the data directory
app.get('/data', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Block any attempts to access JSON files in public folder (defense in depth)
app.get('/public/*.json', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// For Vercel deployment - always start the server
app.listen(PORT, () => {
  console.log(`🚀 Bible server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📖 Available translations: ${Object.keys(SECURITY_CONFIG.ALLOWED_TRANSLATIONS).join(', ')}`);
  console.log(`🔒 Security features: Rate limiting, file access control, request validation`);
  console.log(`📊 Logging: ${SECURITY_CONFIG.LOGGING.SUCCESSFUL_REQUESTS ? 'Enabled' : 'Disabled'}`);
  console.log(`⏰ Rate limit: ${SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS} requests per ${SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS/1000}s`);
  console.log(`💥 Burst limit: ${SECURITY_CONFIG.RATE_LIMIT.MAX_BURST} requests per ${SECURITY_CONFIG.RATE_LIMIT.BURST_WINDOW_MS/1000}s`);
  console.log(`📁 Current directory: ${__dirname}`);
  console.log(`📁 Process working directory: ${process.cwd()}`);
  console.log(`📁 Data directory check: ${fs.existsSync(path.join(__dirname, 'data')) ? 'EXISTS' : 'MISSING'}`);
  console.log(`📁 KJV file check: ${fs.existsSync(path.join(__dirname, 'data', 'kjv.json')) ? 'EXISTS' : 'MISSING'}`);
  
  // List all files in data directory
  try {
    const dataDir = path.join(__dirname, 'data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      console.log(`📁 Data directory contents: ${files.join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Error reading data directory: ${error.message}`);
  }
});

module.exports = app; 