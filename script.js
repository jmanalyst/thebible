// script.js





let bibleData = [];
let lastSearchQuery = "";

function cleanVerseText(text) {
  return text
    .replace(/\[|\]/g, '')       // remove square brackets [ ]
    .replace(/<|>/g, '')         // remove angle brackets < >
    .replace(/‹|›/g, '')         // remove single angle brackets ‹ ›
    .replace(/\s+/g, ' ')        // normalize whitespace
    .trim();
}












fetch('public/kjv.json')
  .then(res => res.json())
  .then(data => {
    // Check and load the actual verses
    if (Array.isArray(data)) {
      bibleData = data;
      console.log("Bible data loaded:", bibleData.length, "verses (raw array)");
    } else if (Array.isArray(data.verses)) {
      bibleData = data.verses;
      console.log("Bible data loaded:", bibleData.length, "verses (from .verses key)");
    } else {
      console.error("Unexpected data format in kjv.json:", data);
    }
  })
  .catch(err => {
    console.error("Failed to load kjv.json:", err);
  });





  const archaicWords = {
  "thee": "you",
  "thou": "you",
  "thy": "your",
  "thine": "yours",
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
  "thereof": "of it / from it (depending on context)"
};



function addTooltipsToVerseText(text) {
  return text.replace(/\b(\w+)\b/g, (match) => {
    const lower = match.toLowerCase();
    if (archaicWords[lower]) {
      return `<span class="relative group inline-block whitespace-nowrap align-baseline tooltip-wrapper">${match}<span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 tooltip hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-50">${archaicWords[lower]}</span></span>`;
    }
    return match;
  });
}



// ===== BOOKS =====
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu",
  "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa",
  "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr",
  "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro",
  "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer",
  "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel",
  "Amos": "Amo", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah",
  "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal",
  "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom",
  "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph",
  "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th",
  "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb",
  "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo",
  "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24,
  "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25,
  "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42,
  "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3,
  "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3,
  "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21,
  "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
  "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5,
  "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

// You already have functions: getChapter, getVerse, prevChapter, nextChapter
// These need slight extension for nextVerse/prevVerse/fullChapter

function showPrevNextVerseButtons(ref) {
  const result = document.getElementById("result");
  const btns = `
    <div class="flex gap-2 mt-4">
      <button onclick="prevVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Previous Verse</button> 
      <button onclick="readFullChapter()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Full Chapter</button>
      <button onclick="nextVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Next Verse</button>
    </div>
  `;
  result.innerHTML += btns;
}

function readFullChapter() {
  getChapter(currentBook, currentChapter);
}

function nextVerse() {
  getVerseFromRef(currentBook, currentChapter, currentVerse + 1);
}

function prevVerse() {
  if (currentVerse > 1) {
    getVerseFromRef(currentBook, currentChapter, currentVerse - 1);
  }
}




function getVerseFromRef(book, chapter, verse) {
  currentBook = book;
  currentChapter = chapter;
  currentVerse = verse;

  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  showResultArea();

  const verseObj = bibleData.find(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter) &&
    v.verse === parseInt(verse)
  );

  if (verseObj) {
    result.innerHTML = `
      <p class="font-semibold text-xl mb-2 leading-relaxed">${addTooltipsToVerseText(cleanVerseText(verseObj.text))}</p>
      <p class="text-sm text-gray-500">– ${book} ${chapter}:${verse}</p>
    `;
    showPrevNextVerseButtons(`${book} ${chapter}:${verse}`);
  } else {
    result.innerHTML = "Verse not found.";
  }
}




// Book Picker Modal
function openBookPicker() {
  const modal = document.getElementById("book-picker");
  const oldTestament = document.getElementById("old-testament");
  const newTestament = document.getElementById("new-testament");

  oldTestament.innerHTML = "";
  newTestament.innerHTML = "";

  const oldBooks = books.slice(0, 39);
  const newBooks = books.slice(39);

  oldBooks.forEach(book => {
    const btn = document.createElement("button");
    btn.textContent = bookAbbreviations[book] || book.substring(0, 3);
    btn.className = "border rounded px-2 py-1 text-sm hover:bg-blue-100";
    btn.onclick = () => selectBook(book);
    oldTestament.appendChild(btn);
  });

  newBooks.forEach(book => {
    const btn = document.createElement("button");
    btn.textContent = bookAbbreviations[book] || book.substring(0, 3);
    btn.className = "border rounded px-2 py-1 text-sm hover:bg-blue-100";
    btn.onclick = () => selectBook(book);
    newTestament.appendChild(btn);
  });

  modal.classList.remove("hidden");
}



function closeBookPicker() {
  document.getElementById("book-picker").classList.add("hidden");
}



function selectBook(book) {
  document.getElementById("book").value = book;
  document.getElementById("chapter").value = "";
  document.getElementById("verse").value = "";
  closeBookPicker();
  updatePillLabels(); 
  openChapterPicker();

  maybeAutoFetch();
}


// When chapter changes, reset verse
function openChapterPicker() {
  const book = document.getElementById("book").value;
  if (!book || !chapterCounts[book]) return;

  const grid = document.getElementById("chapter-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= chapterCounts[book]; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "px-2 py-1 rounded hover:bg-gray-200";
    btn.onclick = () => {
      document.getElementById("chapter").value = i;
      document.getElementById("verse").value = ""; // reset verse
      closeChapterPicker();
      updatePillLabels(); 
      maybeAutoFetch();
    };
    grid.appendChild(btn);
  }

  document.getElementById("chapter-picker-title").textContent = `Select Chapter (${book})`;
  document.getElementById("chapter-picker").classList.remove("hidden");
}



function closeChapterPicker() {
  document.getElementById("chapter-picker").classList.add("hidden");
}





// === VERSE PICKER ===
function openVersePicker() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  if (!book || !chapter) return;

  const grid = document.getElementById("verse-grid");
  const title = document.getElementById("verse-picker-title");
  const modal = document.getElementById("verse-picker");

  grid.innerHTML = "Loading...";
  title.textContent = `Select Verse (${book} ${chapter})`;
  modal.classList.remove("hidden");

  // Get verses from local data
  const verses = bibleData.filter(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter)
  );

  if (verses.length === 0) {
    grid.innerHTML = "<div class='col-span-6 text-gray-500'>No verses found</div>";
    return;
  }

  grid.innerHTML = "";
  verses.forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = v.verse;
    btn.className = "bg-gray-100 hover:bg-green-200 rounded px-2 py-1";
    btn.onclick = () => {
      document.getElementById("verse").value = v.verse;
      closeVersePicker();
      updatePillLabels();
      maybeAutoFetch();
    };
    grid.appendChild(btn);
  });
}


function closeVersePicker() {
  document.getElementById("verse-picker").classList.add("hidden");
  
}



document.addEventListener("DOMContentLoaded", () => {
  // Already present:
  document.getElementById("verse").addEventListener("click", openVersePicker);

  // ✅ New: Listen for form submit
  document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload
    const query = document.getElementById("searchQuery").value;
    searchBible(query);

      // ✅ Listen for radio filter change
  document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (lastSearchQuery) {
        searchBible(lastSearchQuery);
      }
    });
  });
    
  });
});




function getVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();
  const result = document.getElementById("result");

  if (!book || !chapter) {
    result.innerHTML = "Please select both a book and chapter.";
    return;
  }

  // Set current state
  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = verse ? parseInt(verse) : 0;

  result.innerHTML = "Loading...";
  showResultArea();

  if (verse === "") {
    getChapter(book, chapter);
  } else {
    getVerseFromRef(book, parseInt(chapter), parseInt(verse));
  }
}





async function getChapter(book, chapter) {
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  showResultArea();

  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = 0; // reset verse

  // Filter verses from local JSON
  const verses = bibleData.filter(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter)
  );

  if (verses.length > 0) {
    const verseList = verses.map(v => `<strong>${v.verse}</strong>. ${addTooltipsToVerseText(cleanVerseText(v.text))}`).join("\n\n");

    result.innerHTML = `
  <div class="max-w-prose mx-auto px-4 text-center">
    <h2 class="text-2xl font-bold mb-6 uppercase tracking-wide">${book} ${chapter}</h2>
  </div>
  <div class="max-w-prose mx-auto px-4 text-left text-lg leading-relaxed font-serif whitespace-pre-wrap">
  ${verses.map(v => `<strong>${v.verse}</strong>. ${addTooltipsToVerseText(cleanVerseText(v.text))}`).join("\n\n")}
</div>
  </div>
  <div class="fixed inset-y-0 left-0 flex items-center z-50">
  <button onclick="prevChapter()" class="ml-1 bg-transparent bg-white border shadow rounded-full px-2 py-1 text-sm hover:bg-gray-100 transition duration-200">
    ← 
  </button>
</div>

<div class="fixed inset-y-0 right-0 flex items-center z-50">
  <button onclick="nextChapter()" class="mr-1 bg-transparent bg-white border shadow rounded-full px-2 py-1 text-sm hover:bg-gray-100 transition duration-200">
     →
  </button>
</div>
`;
  } else {
    result.innerHTML = "Chapter not found.";
  }
}






function nextChapter() {
  const currentIndex = books.indexOf(currentBook);
  const chapterCount = chapterCounts[currentBook];

  if (currentChapter < chapterCount) {
    getChapter(currentBook, currentChapter + 1);
  } else if (currentIndex < books.length - 1) {
    const nextBook = books[currentIndex + 1];
    getChapter(nextBook, 1);
  } else {
    alert("You are at the end of the Bible.");
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}





function prevChapter() {
  const currentIndex = books.indexOf(currentBook);

 

  if (currentChapter > 1) {
    const newChapter = currentChapter - 1;

    // Update state and DOM
    currentChapter = newChapter;
    currentVerse = 0;
    document.getElementById("chapter").value = newChapter;
    document.getElementById("verse").value = "";
    updatePillLabels();

    getChapter(currentBook, newChapter);
  } else if (currentIndex > 0) {
    const prevBook = books[currentIndex - 1];
    const lastChapter = chapterCounts[prevBook];

 

    // 🔧 FIX: Update state and DOM BEFORE calling getChapter
    currentBook = prevBook;
    currentChapter = lastChapter;
    currentVerse = 0;

    document.getElementById("book").value = prevBook;
    document.getElementById("chapter").value = lastChapter;
    document.getElementById("verse").value = "";
    updatePillLabels();

    getChapter(prevBook, lastChapter);
  } else {
    alert("You are at the beginning of the Bible.");
    return;
  }

  // 🔄 Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}




function showResultArea() {
  document.getElementById("welcome-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("topics-wrapper").classList.add("hidden"); // 👈 HIDE topics
}





function goHome() {
  document.getElementById("welcome-section").classList.remove("hidden");
  document.getElementById("result-section").classList.add("hidden");
  document.getElementById("topics-wrapper").classList.remove("hidden"); // 👈 SHOW topics

  // Optional: Reset input fields
  document.getElementById("book").value = "";
  document.getElementById("chapter").value = "";
  document.getElementById("verse").value = "";
  updatePillLabels();
  document.getElementById("result").innerHTML = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}













function maybeAutoFetch() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();

  if (book && chapter && verse) {
    getVerseFromRef(book, parseInt(chapter), parseInt(verse));
  } else if (book && chapter && verse === "") {
    getChapter(book, chapter);
  }
}





function updatePillLabels() {
  document.getElementById("pill-book").textContent = document.getElementById("book").value || "Book";
  document.getElementById("pill-chapter").textContent = document.getElementById("chapter").value || "Chapter";
  document.getElementById("pill-verse").textContent = document.getElementById("verse").value || "Verse";
}



let recognition; // global so we can stop it later

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  if (recognition) {
    recognition.stop(); // Stop any ongoing recognition
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    parseSpeechInput(transcript);
    recognition.stop(); // Automatically stop after result
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    recognition.stop();
  };

  recognition.onend = () => {
    recognition = null; // clear it so it's ready next time
  };

  recognition.start();
}

function parseSpeechInput(input) {
  input = input.trim().toLowerCase();

  // Convert numbers like "three nineteen" to "3 19" if needed
  // Optional: You can add a number word-to-digit converter if you want

  // Try to match known book names
  const matchedBook = books.find(book => input.startsWith(book.toLowerCase()));
  if (!matchedBook) {
    alert("Could not recognize book name.");
    return;
  }

  const rest = input.replace(matchedBook.toLowerCase(), "").trim(); // e.g. "319" or "3 19"

  // Match patterns like "3 19" or "319"
  let chapter = "", verse = "";

  if (/^\d{1,3}\s\d{1,3}$/.test(rest)) {
    [chapter, verse] = rest.split(" ");
  } else if (/^\d{2,4}$/.test(rest)) {
    // e.g. "319" → 3:19, "113" → 1:13
    if (rest.length === 3) {
      chapter = rest[0];
      verse = rest.slice(1);
    } else if (rest.length === 4) {
      chapter = rest.slice(0, 2);
      verse = rest.slice(2);
    } else {
      alert("Couldn't parse chapter and verse.");
      return;
    }
  } else {
    alert("Please speak clearly: e.g., 'John 3 16' or 'Matthew 3 19'");
    return;
  }

  // Set values in inputs
   // Set values in inputs
  document.getElementById("book").value = matchedBook;
  document.getElementById("chapter").value = chapter;
  document.getElementById("verse").value = verse;

  updatePillLabels();
  showResultArea(); // Show results section
  getVerseFromRef(matchedBook, parseInt(chapter), parseInt(verse)); // ← FETCH the scripture!
}




function searchBible(query) {
  const result = document.getElementById("result");
  showResultArea();

  query = query.trim().toLowerCase();
  if (!query) return;

  lastSearchQuery = query;

  const filter = document.querySelector('input[name="filter"]:checked').value;
  const currentBook = document.getElementById("book").value;

  let filteredData = [...bibleData];

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

  const matches = filteredData.filter(v =>
    v.text.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    result.innerHTML = `No verses found for "${query}".`;
    return;
  }

  const rendered = matches.map(v => {
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = v.text.replace(regex, '<mark>$1</mark>');

    return `<div class="mb-3">
      <p class="text-sm text-gray-500">${v.book_name} ${v.chapter}:${v.verse}</p>
      <p class="text-base leading-relaxed">${highlighted}</p>
    </div>`;
  }).join("");

  result.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">Results for "${query}" (${matches.length} found):</h2>
    <div>${rendered}</div>
  `;
}


function toggleSearch() {
  const panel = document.getElementById("search-panel");
  panel.classList.toggle("hidden");
}







const supabase = window.supabase.createClient(
    'https://zotjqpwgsrswaakhwtzl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdGpxcHdnc3Jzd2Fha2h3dHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM1NjgsImV4cCI6MjA2ODY2OTU2OH0.z2B4Uss7ar1ccRxXOO0oZ3bqpW7Nka5xwbAZh_RRo7s'
  );



async function loadPublicTopics() {
  const { data: topics } = await supabase.from('topics').select('*');
  const { data: verses } = await supabase.from('topic_verses').select('*');

  const container = document.getElementById("topics-display");
  container.innerHTML = "";

  topics.forEach(topic => {
    const topicVerses = verses.filter(v => v.topic_id === topic.id);
const grouped = topicVerses.reduce((acc, v) => {
  const key = v.subtopic || "Misc";
  if (!acc[key]) acc[key] = [];
  acc[key].push(v);
  return acc;
}, {});

const verseList = Object.entries(grouped).map(([subtopic, verses]) => {
  const items = verses.map(v => {
    const match = bibleData.find(b =>
      b.book_name.toLowerCase() === v.book.toLowerCase() &&
      b.chapter === parseInt(v.chapter) &&
      b.verse === parseInt(v.verse)
    );
    const verseText = match ? cleanVerseText(match.text) : "(verse not found)";
    return `<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${verseText}</li>`;
  }).join("");

  // 🧼 Normalize "Misc" to hide the heading if it was stored literally
  const isPlaceholder = !subtopic || subtopic.trim().toLowerCase() === "misc";

  return isPlaceholder
    ? `<ul class="list-disc pl-5">${items}</ul>`
    : `<h4 class="mt-4 font-semibold text-lg">${subtopic}</h4><ul class="list-disc pl-5">${items}</ul>`;
}).join("");



    container.innerHTML += `
      <div class="border border-gray-200 rounded p-4 bg-white">
        <button onclick="toggleTopic('${topic.id}')" class="text-lg font-semibold text-left w-full text-gray-800 hover:text-sky-500">
          ${topic.title}
        </button>
        <ul id="topic-${topic.id}" class="ml-4 mt-2 list-disc text-sm hidden">
          ${verseList}
        </ul>
      </div>
    `;
  });
}



// Toggle topic visibility
window.toggleTopic = function(id) {
  const el = document.getElementById("topic-" + id);
  el.classList.toggle("hidden");
};

// Call this on DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadPublicTopics();
});






let tooltipVisible = false;

document.addEventListener("keydown", function (e) {
  if (e.key.toLowerCase() === "t") {
    tooltipVisible = !tooltipVisible;

    const tooltips = document.querySelectorAll(".tooltip");
    tooltips.forEach(tip => {
      if (tooltipVisible) {
        tip.classList.remove("hidden");
        tip.classList.add("block");
      } else {
        tip.classList.remove("block");
        tip.classList.add("hidden");
      }
    });
  }
});