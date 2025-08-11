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

// Static data constants moved from script.js
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu", "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa", "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr", "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro", "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal", "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom", "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th", "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb", "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo", "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

const archaicWords = {
  "thee": "you",
  "thou": "you",
  "thy": "your",
  "thine": "yours/your",
  "ye": "you (plural)",
  "hath": "has",
  "doeth": "does",
  "didst": "did",
  "art": "are",
  "unto": "to",
  "wherefore": "why",
  "whence": "from where",
  "wilt": "will",
  "shalt": "shall",
  "hast": "have",
  "saith": "says",
  "cometh": "comes",
  "goeth": "goes",
  "behold": "look / see",
  "verily": "truly",
  "peradventure": "perhaps",
  "begat": "fathered / had children",
  "hearken": "listen",
  "fain": "gladly / eagerly",
  "anon": "soon / shortly",
  "abase": "humble / bring low",
  "abide": "remain / live",
  "aforetime": "formerly",
  "alway": "always",
  "bewray": "betray",
  "beseech": "beg / urgently request",
  "bosom": "chest / heart",
  "concupiscence": "lust / strong desire",
  "countenance": "face / expression",
  "divers": "various / different",
  "draught": "toilet / waste place",
  "ensample": "example",
  "eschew": "avoid",
  "haply": "perhaps / by chance",
  "holpen": "helped",
  "janitor": "doorkeeper",
  "kinsman": "relative",
  "letteth": "restrains / holds back",
  "meat": "food (not just meat)",
  "nay": "no",
  "nigh": "near",
  "quickened": "made alive",
  "raiment": "clothing",
  "rent": "tore",
  "shewed": "showed",
  "shew": "show",
  "sojourn": "stay temporarily",
  "sore": "greatly / severely",
  "staves": "staffs / sticks",
  "suffer": "allow",
  "sundry": "various",
  "tarry": "stay / wait",
  "wist": "knew",
  "wot": "know",
  "woe": "sorrow / distress",
  "wouldest": "would",
  "yonder": "over there",
  "thereof": "of it / from it",
  "therein": "in it",
  "herein": "in this",
  "hither": "here",
  "thither": "there",
  "howbeit": "however / nevertheless",
  "aught": "anything",
  "naught": "nothing",
  "durst": "dared",
  "ere": "before",
  "giveth": "gives",
  "loveth": "loves",
  "hateth": "hates",
  "knowest": "you know",
  "maketh": "makes",
  "taketh": "takes",
  "bringeth": "brings",
  "hearest": "you hear",
  "firmament": "sky / heavens",
  "sittest": "you sit",
  "recompense": "repay / reward",
  "multitude": "crowd / large group",
  "tribulation": "trouble / suffering",
  "vain": "worthless / futile",
  "fowl": "bird",
  "fowls": "birds",
  "breadth": "width",
  "beguiled": "deceived / misled",
  "shouldest": "should",
  "wast": "were",
  "gavest": "gave",
  "lieth": "lies",
  "creepeth": "creeps",
  "crieth": "cries",
  "comest": "you come",
  "fro": "away / from / back",
  "doth": "does",
  "escheweth": "avoids",
  "nought": "nothing / worthless",
  "feareth": "fears",
  "holdeth": "holds",
  "movedst": "you moved",
  "smote": "struck / hit forcefully",
  "tillest": "you cultivate",
  "henceforth": "from now on",
  "vagabond": "wanderer",
  "findeth": "finds",
  "slay": "kill",
  "slayeth": "kills",
  "slain": "killed",
  "sevenfold": "seven times as much",
  "hearkened": "listened",
  "doest": "do (you do)",
  "dost": "do (you)",
  "withal": "with it / with that",
  "speakest": "you speak",
  "speaketh": "speaks",
  "assay": "attempt / try",
  "potsherd": "broken piece of pottery",
  "wroth": "angry / furious",
  "sheweth": "shows",
  "taketh": "takes",
  "wilt": "will",
  "revile": "insult / speak abusively about",
  "wherewith": "with what / by which (depending on context)",
  "thenceforth": "from that time on",
  "trodden": "trampled / walked on",
  "bushel": "a container or unit of measure for dry goods (about 8 gallons)",
  "jot": "the smallest letter or mark (in Hebrew, refers to 'yod')",
  "tittle": "a tiny mark or stroke in writing (used to emphasize even the smallest detail)",
  "raca": "an Aramaic insult meaning 'empty-headed' or 'worthless'",
  "rememberest": "remember",
  "profitable": "beneficial / useful / valuable",
  "farthing": "a small coin of little value (1/4 of a penny)",
  "thence": "from there / from that place",
  "uttermost": "farthest / greatest / most extreme",
  "looketh": "looks",
  "smite": "strike / hit with force",
  "alms": "charitable giving / money or goods given to the poor",
  "fastest": "periods of fasting (not 'quickest')",
  "morrow": "the next day / tomorrow",
  "wherewithal": "with what / by what means",
  "mammon": "wealth or riches (often personified as a false god of materialism)",
  "beholdest": "you look at",
  "mete": "measure out / distribute",
  "mote": "a tiny speck or particle (especially of dust)",
  "beam": "a large piece of wood (used metaphorically for a major flaw or sin)",
  "heareth": "hears / listens to",
  "strait": "narrow / tight / constricted",
  "thereat": "at that place / at it",
  "thyself": "yourself",
  "meaneth": "means",
  "therefore": "for that reason or as a result",
  "variance": "conflict / division",
  "overcometh": "overcomes / conquers",
  "sufferest": "allow / permit",
  "notwithstanding": "despite / even though / nevertheless",
  "borne": "carried / endured / brought forth",
  "hence": "from here / from now (depending on context)",
  "tiller": "farmer / cultivator of soil",
  "lest": "for fear that / to avoid / so that not",
  "vanity": "worthlessness / emptiness"
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

function addTooltipsToVerseText(text) {
  return text.replace(/\b(\w+)\b/g, (match) => {
    const lower = match.toLowerCase();
    if (archaicWords[lower]) {
      // MODIFIED: Added dark mode classes for the tooltip's background and text color
      return `<span class="relative group inline whitespace-nowrap align-baseline tooltip-wrapper">${match}<span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 tooltip hidden group-hover:block bg-black text-white dark:bg-gray-100 dark:text-black text-xs rounded px-2 py-1 z-50">${archaicWords[lower]}</span></span>`;
    }
    return match;
  });
}

// Enhanced daily verse generation with better randomization
function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Use a more sophisticated randomization based on date
  const seed = today.getFullYear() * 1000 + dayOfYear;
  const randomIndex = (seed * 9301 + 49297) % bibleData.length;
  
  const verse = bibleData[randomIndex] || bibleData[0];
  const verseRef = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  
  return {
    date: today.toISOString().split("T")[0],
    verse: verseRef,
    text: verse.text
  };
}

// Enhanced search functionality moved from script.js
function searchBible(query, filter = 'all', currentBook = '') {
  query = query.trim().toLowerCase();
  if (!query) return { results: [], count: 0 };
  
  let filteredData = [...bibleData];
  
  // Apply filters
  if (filter === "ot") {
    filteredData = filteredData.filter(v => {
      const index = books.findIndex(b => b.toLowerCase() === v.book_name.toLowerCase());
      return index > -1 && index < 39;
    });
  } else if (filter === "nt") {
    filteredData = filteredData.filter(v => {
      const index = books.findIndex(b => b.toLowerCase() === v.book_name.toLowerCase());
      return index >= 39;
    });
  } else if (filter === "book" && currentBook) {
    filteredData = filteredData.filter(v => v.book_name.toLowerCase() === currentBook.toLowerCase());
  }
  
  // Search for matches
  const matches = filteredData.filter(v => v.text.toLowerCase().includes(query));
  
  // Process and format results
  const processedResults = matches.map(v => {
    let processedText = formatRedLetterText(v.text);
    processedText = formatTranslatorText(processedText);
    processedText = addTooltipsToVerseText(processedText);
    const finalText = cleanVerseText(processedText);
    
    // Highlight search terms
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = finalText.replace(regex, '<mark>$1</mark>');
    
    return {
      book_name: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: finalText,
      highlightedText: highlighted
    };
  });
  
  return {
    results: processedResults,
    count: processedResults.length,
    query: query
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

// API Routes to protect kjv.json
app.get('/api/bible-data', (req, res) => {
  res.json({ verses: bibleData });
});

app.get('/api/books', (req, res) => {
  res.json({ books, bookAbbreviations, chapterCounts });
});

app.get('/api/archaic-words', (req, res) => {
  res.json({ archaicWords });
});

app.get('/api/daily-verse', (req, res) => {
  res.json(getDailyVerse());
});

app.get('/api/search', (req, res) => {
  const query = req.query.q;
  const filter = req.query.filter || 'all';
  const currentBook = req.query.book;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  // Use the new server-side search function
  const searchResults = searchBible(query, filter, currentBook);
  
  // Limit results to 50 for performance
  const limitedResults = searchResults.results.slice(0, 50);
  
  res.json({ 
    results: limitedResults, 
    count: limitedResults.length,
    totalCount: searchResults.count,
    query: searchResults.query
  });
});

app.get('/api/verse/:book/:chapter/:verse', (req, res) => {
  const { book, chapter, verse } = req.params;
  
  const result = bibleData.find(v => 
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    parseInt(v.chapter) === parseInt(chapter) &&
    parseInt(v.verse) === parseInt(verse)
  );
  
  if (!result) {
    return res.status(404).json({ error: 'Verse not found' });
  }
  
  // Process the text on the server side
  let processedText = formatRedLetterText(result.text);
  processedText = formatTranslatorText(processedText);
  processedText = addTooltipsToVerseText(processedText);
  const finalText = cleanVerseText(processedText);
  
  res.json({
    ...result,
    processedText: finalText
  });
});

app.get('/api/chapter/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  
  const results = bibleData.filter(v => 
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    parseInt(v.chapter) === parseInt(chapter)
  );
  
  if (results.length === 0) {
    return res.status(404).json({ error: 'Chapter not found' });
  }
  
  // Process all verses on the server side
  const processedVerses = results.map(v => {
    let processedText = formatRedLetterText(v.text);
    processedText = formatTranslatorText(processedText);
    processedText = addTooltipsToVerseText(processedText);
    const finalText = cleanVerseText(processedText);
    
    return {
      ...v,
      processedText: finalText
    };
  });
  
  res.json({ verses: processedVerses });
});

// Route to serve Bible verses with pre-generated meta tags
app.get('/:book/:chapter/:verse?', (req, res) => {
  const { book, chapter, verse } = req.params;
  
  // Find the verse data
  let verseData = null;
  if (verse) {
    verseData = bibleData.find(v => {
      // Handle both "Psalm" and "Psalms" (and other similar cases)
      const bookName = v.book_name ? v.book_name.toLowerCase() : '';
      const searchBook = book.toLowerCase();
      
      // Check if book names match (including singular/plural variations)
      const bookMatch = bookName === searchBook || 
                       bookName === searchBook + 's' || 
                       bookName === searchBook.replace(/s$/, '');
      
      const chapterMatch = parseInt(v.chapter) === parseInt(chapter);
      const verseMatch = parseInt(v.verse) === parseInt(verse);
      
      return bookMatch && chapterMatch && verseMatch;
    });
  } else {
    // For chapter view, get first verse for description
    verseData = bibleData.find(v => {
      // Handle both "Psalm" and "Psalms" (and other similar cases)
      const bookName = v.book_name ? v.book_name.toLowerCase() : '';
      const searchBook = book.toLowerCase();
      
      // Check if book names match (including singular/plural variations)
      const bookMatch = bookName === searchBook || 
                       bookName === searchBook + 's' || 
                       bookName === searchBook.replace(/s$/, '');
      
      const chapterMatch = parseInt(v.chapter) === parseInt(chapter);
      
      return bookMatch && chapterMatch;
    });
  }
  
  if (!verseData) {
    return res.status(404).send('Verse not found');
  }
  
  // Generate meta tags
  const metaTags = generateVerseMetaTags(
    verseData.book_name, 
    verseData.chapter, 
    verse ? verseData.verse : null, 
    verseData.text
  );
  
  // Generate HTML with meta tags
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTags.title}</title>
  <meta name="description" content="${metaTags.description}">
  
  <!-- Open Graph meta tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${metaTags.ogUrl}">
  <meta property="og:title" content="${metaTags.ogTitle}">
  <meta property="og:description" content="${metaTags.ogDescription}">
  <meta property="og:image" content="https://thelivingwordonline.com/public/hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="The Living Word Online">
  
  <!-- Twitter Card meta tags -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${metaTags.twitterUrl}">
  <meta property="twitter:title" content="${metaTags.twitterTitle}">
  <meta property="twitter:description" content="${metaTags.twitterDescription}">
  <meta property="twitter:image" content="https://thelivingwordonline.com/public/hero.png">
  
  <link rel="canonical" href="${metaTags.ogUrl}">
  
  <script>
    // Redirect to main app with parameters after a delay
    setTimeout(() => {
      window.location.href = '/?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}${verse ? `&verse=${encodeURIComponent(verse)}` : ''}';
    }, 3000); // Wait 3 seconds before redirecting
  </script>
</head>
<body>
  <p>Redirecting to The Living Word Online...</p>
</body>
</html>`;
  
  res.send(html);
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