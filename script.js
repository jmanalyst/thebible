// script.js

let bibleData = [];
let lastSearchQuery = "";



// DOM Content

document.addEventListener("DOMContentLoaded", () => {
    // Fetch Bible data first
    fetch('public/kjv.json')
      .then(res => res.json())
     .then(data => {
    // Step 1: Check and load the Bible data
    if (Array.isArray(data)) {
        bibleData = data;
    } else if (Array.isArray(data.verses)) {
        bibleData = data.verses;
    } else {
        console.error("Unexpected data format in kjv.json:", data);
        return; // Stop if data is bad
    }
    console.log("Bible data loaded:", bibleData.length, "verses.");

    // Step 2: NEW LOGIC to determine what to show on page load
    const urlHandled = handleUrlParameters();

    // If a shared URL was not opened, then decide between restoring state or showing home
    if (!urlHandled) {
        // Check if we've already been on the site in this session
        if (sessionStorage.getItem('hasVisited')) {
            // This is a REFRESH, so restore the last state
            restoreState();
        } else {
            // This is a NEW VISIT, so go to the homepage
            goHome();
        }
    }
    
    // Mark that this session has been active
    sessionStorage.setItem('hasVisited', 'true');
    
    // Step 3: Load the topics
    loadPublicTopics();




      // ✅ Step 4: Load the daily devotion verse
  const devotion = getDailyVerse(); // your custom function
  const textEl = document.getElementById("devotion-text");
  const refEl = document.getElementById("devotion-ref");
  if (textEl && refEl) {
    textEl.textContent = devotion.text;
    refEl.textContent = `– ${devotion.verse}`;
  }



})




             .catch(err => {
         console.error("Failed to load kjv.json:", err);
       });

    // Setup other event listeners
    document.getElementById("verse").addEventListener("click", openVersePicker);

    // MODIFIED: This block now checks where the search started from
         document.getElementById("search-form").addEventListener("submit", function (e) {
         e.preventDefault(); 
          
         // Check if we are in the reader view or on the homepage
         const isReaderVisible = !document.getElementById('result-section').classList.contains('hidden');
          
         if (isReaderVisible) {
             saveState(); // Save the reading position
             sessionStorage.setItem('searchOrigin', 'reader');
         } else {
             sessionStorage.setItem('searchOrigin', 'home');
         }
          
         const query = document.getElementById("searchQuery").value;
         searchBible(query);
     });

    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener("change", () => {
            if (lastSearchQuery) {
                searchBible(lastSearchQuery);
            }
        });
    });

    setupSelectionMenu();
});

// --- STATE MANAGEMENT (NEW) ---
// Saves the current view (book, chapter, verse, results) to localStorage.
function saveState() {
  const state = {
    book: document.getElementById("book").value,
    chapter: document.getElementById("chapter").value,
    verse: document.getElementById("verse").value,
    resultHTML: document.getElementById("result").innerHTML,
    isResultVisible: !document.getElementById("result-section").classList.contains("hidden"),
    lastSearchQuery: lastSearchQuery,
    activeFilter: document.querySelector('input[name="filter"]:checked') ? document.querySelector('input[name="filter"]:checked').value : 'all',
    scrollPosition: window.scrollY
    
  };
  // Only save if the result area is visible.
  if (state.isResultVisible) {
    localStorage.setItem('bibleAppState', JSON.stringify(state));
  } else {
    clearState(); // Clear state if on the home screen.
  }
}

// --- STATE MANAGEMENT (NEW) ---
// Restores the view from localStorage when the page loads.
function restoreState() {
  const savedStateJSON = localStorage.getItem('bibleAppState');
  if (!savedStateJSON) return;

  const savedState = JSON.parse(savedStateJSON);

  // Restore form inputs and global variables
  document.getElementById("book").value = savedState.book || "";
  document.getElementById("chapter").value = savedState.chapter || "";
  document.getElementById("verse").value = savedState.verse || "";
  lastSearchQuery = savedState.lastSearchQuery || "";
  
  // Restore global state for navigation functions
  currentBook = savedState.book;
  currentChapter = parseInt(savedState.chapter);
  currentVerse = parseInt(savedState.verse);

  // Restore the search filter radio button
  if (savedState.activeFilter) {
    const filterRadio = document.querySelector(`input[name="filter"][value="${savedState.activeFilter}"]`);
    if (filterRadio) {
      filterRadio.checked = true;
    }
  }
  
  updatePillLabels();

  // If the result section was visible, restore its content and show it.
  if (savedState.isResultVisible) {
    document.getElementById("result").innerHTML = savedState.resultHTML;
     showResultArea();
    
    // ADD THIS BLOCK to restore the scroll position
    if (savedState.scrollPosition) {
        setTimeout(() => {
            window.scrollTo({
                top: savedState.scrollPosition,
                behavior: 'smooth' 
            });
        }, 100); // 100ms delay for rendering
    }
  }

  applySavedHighlights();





}

// --- STATE MANAGEMENT (NEW) ---
// Clears the saved state from localStorage.
function clearState() {
  localStorage.removeItem('bibleAppState');
}


// Replace your old cleanVerseText function with this one in script.js

function cleanVerseText(text) {
    // The only job of this function is now to trim whitespace.
    return text.trim();
}


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

// In script.js

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

const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu", "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa", "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr", "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro", "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal", "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom", "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th", "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb", "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo", "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

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
  // 1. Clear the verse from the state
  document.getElementById('verse').value = '';
  currentVerse = 0; // Reset the global variable

  // 2. NEW: Clean the verse parameter from the URL
  const params = new URLSearchParams(window.location.search);
  params.delete('verse');
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState({}, '', newUrl);

  // 3. Update the header pills
  updatePillLabels();

  // 4. Now, get the full chapter
  getChapter(currentBook, currentChapter);
}

function nextVerse() {
  const newVerse = currentVerse + 1;
  // NEW: Update the input value and the pill display
  document.getElementById('verse').value = newVerse;
  updatePillLabels();
  getVerseFromRef(currentBook, currentChapter, newVerse);
}

// And replace the prevVerse function with this:

function prevVerse() {
  if (currentVerse > 1) {
    const newVerse = currentVerse - 1;
    // NEW: Update the input value and the pill display
    document.getElementById('verse').value = newVerse;
    updatePillLabels();
    getVerseFromRef(currentBook, currentChapter, newVerse);
  }
}

function getVerseFromRef(book, chapter, verse) {
  updateMetadata(book, chapter);
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
  // MODIFIED: Save state after rendering the verse.
  saveState();
}

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    grid.appendChild(btn);
  }

  document.getElementById("chapter-picker-title").textContent = `Select Chapter (${book})`;
  document.getElementById("chapter-picker").classList.remove("hidden");
}

function closeChapterPicker() {
  document.getElementById("chapter-picker").classList.add("hidden");
}

// openVersePicker function

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
    grid.innerHTML = "<div class='col-span-7 text-theme-subtle-text'>No verses found</div>";
    return;
  }

  grid.innerHTML = "";
  verses.forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = v.verse;
    
    // MODIFIED: Replaced old classes with new theme-aware classes
    btn.className = "bg-theme-surface hover:bg-theme-accent hover:text-white rounded px-2 py-1";
    
    btn.onclick = () => {
      document.getElementById("verse").value = v.verse;
      closeVersePicker();
      updatePillLabels();
      maybeAutoFetch();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    grid.appendChild(btn);
  });
}

function closeVersePicker() {
  document.getElementById("verse-picker").classList.add("hidden");
}



function getVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();
  const result = document.getElementById("result");

  if (!book || !chapter) {
    result.innerHTML = "Please select both a book and chapter.";
    return;
  }

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



//  getChapter function 

// In script.js

async function getChapter(book, chapter) {
  updateMetadata(book, chapter);
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  showResultArea();

  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = 0;

  const verses = bibleData.filter(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter)
  );

   if (verses.length > 0) {
    // MODIFIED: This block now has a safer, clearer text-formatting process
    const verseList = verses.map(v => {
      let processedText = formatRedLetterText(v.text);
      processedText = formatTranslatorText(processedText); // New, safer step for italics
      processedText = addTooltipsToVerseText(processedText);
      const finalText = cleanVerseText(processedText);

      return `<p class="verse-line p-2 -m-2 rounded-md mb-8" data-verse-ref="${book} ${chapter}:${v.verse}" data-book="${book}" data-chapter="${chapter}" data-verse="${v.verse}"><sup class="font-semibold text-theme-subtle-text mr-1">${v.verse}</sup><span class="verse-text">${finalText}</span></p>`
    }).join("");

    result.innerHTML = `
      <div class="max-w-sm mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-6 uppercase tracking-wide">${book} ${chapter}</h2>
      </div>
      <div class="max-w-prose mx-auto px-4 text-left text-[16pt] leading-relaxed font-serif whitespace-pre-wrap">
      ${verseList}
      </div>
      
      <div class="fixed top-1/2 -translate-y-1/2 left-0 z-40">
        <button onclick="prevChapter()" class="ml-1 lg:ml-4 border border-theme-border text-theme-text shadow rounded-full w-10 h-10 hover:bg-theme-border transition duration-200 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
      </div>

      <div class="fixed top-1/2 -translate-y-1/2 right-0 z-40">
        <button onclick="nextChapter()" class="mr-1 lg:mr-4 border border-theme-border text-theme-text shadow rounded-full w-10 h-10 hover:bg-theme-border transition duration-200 flex items-center justify-center">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    `;

    applySavedHighlights();
    
  } else {
    result.innerHTML = "Chapter not found.";
  }
  
  saveState();
}

function nextChapter() {
  const currentIndex = books.indexOf(currentBook);
  const chapterCount = chapterCounts[currentBook];

  if (currentChapter < chapterCount) {
    const newChapter = currentChapter + 1;
    // NEW: Update the input value and the pill display
    document.getElementById('chapter').value = newChapter;
    updatePillLabels();
    getChapter(currentBook, newChapter);

  } else if (currentIndex < books.length - 1) {
    const nextBook = books[currentIndex + 1];
    // NEW: Update for the next book and reset chapter to 1
    document.getElementById('book').value = nextBook;
    document.getElementById('chapter').value = 1;
    updatePillLabels();
    getChapter(nextBook, 1);
    
  } else {
    // You are at the end of the Bible
    return; 
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevChapter() {
  const currentIndex = books.indexOf(currentBook);
  if (currentChapter > 1) {
    const newChapter = currentChapter - 1;
    currentChapter = newChapter;
    currentVerse = 0;
    document.getElementById("chapter").value = newChapter;
    document.getElementById("verse").value = "";
    updatePillLabels();
    getChapter(currentBook, newChapter);
  } else if (currentIndex > 0) {
    const prevBook = books[currentIndex - 1];
    const lastChapter = chapterCounts[prevBook];
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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showResultArea() {
  document.getElementById("welcome-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("topics-wrapper").classList.add("hidden");
}

function goHome() {
  // MODIFIED: Find and remove the temporary flicker-fix style tag.
  const flickerFixStyle = document.getElementById('flicker-fix-style');
  if (flickerFixStyle) {
    flickerFixStyle.remove();
  }

  document.getElementById('search-close-button').classList.add('hidden');


    // --- NEW: Clean the URL in the address bar ---
  // This removes the ?book=... part without reloading the page.
  const cleanUrl = window.location.pathname; 
  history.replaceState({}, '', cleanUrl);
  // --- End of new code ---


  document.getElementById("welcome-section").classList.remove("hidden");
  document.getElementById("result-section").classList.add("hidden");
  document.getElementById("topics-wrapper").classList.remove("hidden"); 

  // Optional: Reset input fields
  document.getElementById("book").value = "";
  document.getElementById("chapter").value = "";
  document.getElementById("verse").value = "";
  updatePillLabels();
  document.getElementById("result").innerHTML = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
  
  // Clear state when going home
  clearState();
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

let recognition;
function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported.");
    return;
  }
  if (recognition) {
    recognition.stop();
  }
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    parseSpeechInput(transcript);
    recognition.stop();
  };
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    recognition.stop();
  };
  recognition.onend = () => {
    recognition = null;
  };
  recognition.start();
}

function parseSpeechInput(input) {
  input = input.trim().toLowerCase();
  const matchedBook = books.find(book => input.startsWith(book.toLowerCase()));
  if (!matchedBook) {
    alert("Could not recognize book name.");
    return;
  }
  const rest = input.replace(matchedBook.toLowerCase(), "").trim();
  let chapter = "", verse = "";
  if (/^\d{1,3}\s\d{1,3}$/.test(rest)) {
    [chapter, verse] = rest.split(" ");
  } else if (/^\d{2,4}$/.test(rest)) {
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
  document.getElementById("book").value = matchedBook;
  document.getElementById("chapter").value = chapter;
  document.getElementById("verse").value = verse;
  updatePillLabels();
  showResultArea();
  getVerseFromRef(matchedBook, parseInt(chapter), parseInt(verse));
}

function searchBible(query) {

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const result = document.getElementById("result");
  showResultArea();


  document.getElementById('search-close-button').classList.remove('hidden');



  query = query.trim().toLowerCase();
  if (!query) return;
  lastSearchQuery = query;
  const filter = document.querySelector('input[name="filter"]:checked').value;
  const currentBookName = document.getElementById("book").value;
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
  } else if (filter === "book" && currentBookName) {
    filteredData = filteredData.filter(v => v.book_name.toLowerCase() === currentBookName.toLowerCase());
  }
  const matches = filteredData.filter(v =>
    v.text.toLowerCase().includes(query)
  );
  if (matches.length === 0) {
    result.innerHTML = `No verses found for "${query}".`;
  } else {
    const rendered = matches.map(v => {
      const regex = new RegExp(`(${query})`, 'gi');
      const highlighted = v.text.replace(regex, '<mark>$1</mark>');
      return `<div class="mb-3">
        <p class="text-sm text-gray-500">${v.book_name} ${v.chapter}:${v.verse}</p>
        <p class="text-base leading-relaxed">${highlighted}</p>
      </div>`;
    }).join("");
    result.innerHTML = `
      <div class="relative pb-2 mb-4 border-b border-theme-border">
          <h2 class="text-xl font-bold">Search Results</h2>
          <p class="text-sm text-theme-subtle-text">${matches.length} verses found for "${query}"</p>
      </div>
      <div>${rendered}</div>
    `;
  }
  // MODIFIED: Save state after rendering search results.
  // saveState();
}

function toggleSearch() {
  const panel = document.getElementById("search-panel");
  panel.classList.toggle("hidden");
}

const supabase = window.supabase.createClient(
    'https://zotjqpwgsrswaakhwtzl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdGpxcHdnc3Jzd2Fha2h3dHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM1NjgsImV4cCI6MjA2ODY2OTU2OH0.z2B4Uss7ar1ccRxXOO0oZ3bqpW7Nka5xwbAZh_RRo7s'
  );

// Load Public Topics

async function loadPublicTopics() {
  console.log("=== Loading Public Topics ===");
  
  const { data: topics } = await supabase.from('topics').select('*').order('order', { ascending: true });
  const { data: verses } = await supabase.from('topic_verses').select('*');
  const { data: subtopics } = await supabase.from('subtopics').select('*').order('order', { ascending: true });

  console.log("Topics loaded:", topics?.length || 0);
  console.log("Verses loaded:", verses?.length || 0);
  console.log("Subtopics loaded:", subtopics?.length || 0);
  
  // Debug: Log some verse data to see what we're working with
  if (verses && verses.length > 0) {
    console.log("Sample verses:", verses.slice(0, 3).map(v => ({
      id: v.id,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      note: v.note,
      subtopic: v.subtopic
    })));
  }

  const container = document.getElementById("topics-display");
  if (!container) {
    console.error("Topics container not found!");
    return;
  }
  container.innerHTML = "";

  topics.forEach((topic, index) => {
    console.log(`Processing topic ${index + 1}:`, topic.title, "ID:", topic.id);
    const topicVerses = verses.filter(v => v.topic_id === topic.id);
    const topicSubtopics = subtopics?.filter(s => s.topic_id === topic.id) || [];
    
    // Group verses by subtopic
    const grouped = topicVerses.reduce((acc, v) => {
      const key = v.subtopic || "Misc";
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});

    // Build verse list based on subtopics table order
    const verseList = topicSubtopics.map(subtopic => {
      const subtopicName = subtopic.title;
      const verses = grouped[subtopicName] || [];
      const items = verses.map(v => {
        // Check if this is a verse range by looking for "(Range: X-Y)" in the note
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${startVerse}-${endVerse}`;
          
          console.log("Processing verse range:", { 
            book: v.book, 
            chapter: v.chapter, 
            verse: v.verse, 
            note: v.note, 
            startVerse, 
            endVerse, 
            verseRef 
          });
          
          // For ranges, show all verses in the range
          let allVersesText = "";
          for (let verseNum = parseInt(startVerse); verseNum <= parseInt(endVerse); verseNum++) {
            const match = bibleData.find(b =>
              b.book_name.toLowerCase() === v.book.toLowerCase() &&
              b.chapter === parseInt(v.chapter) &&
              b.verse === verseNum
            );
            
            if (match) {
              const verseResult = cleanVerseText(match.text);
              let displayText = "";
              if (typeof verseResult === 'object' && verseResult.text) {
                displayText = verseResult.text;
              } else {
                displayText = typeof verseResult === 'string' ? verseResult : verseResult.text || verseResult;
              }
              displayText = displayText.replace(/[¶\[\]‹›]/g, '').trim();
              
              allVersesText += `<strong>${verseNum}:</strong> ${displayText} `;
            }
          }
          
          if (!allVersesText) {
            allVersesText = "(verses not found)";
          }
          
          return `<li><strong>${verseRef}</strong> – ${allVersesText}</li>`;
        }
        
        const match = bibleData.find(b =>
          b.book_name.toLowerCase() === v.book.toLowerCase() &&
          b.chapter === parseInt(v.chapter) &&
          b.verse === parseInt(v.verse)
        );
        const verseResult = match ? cleanVerseText(match.text) : "(verse not found)";
        
        // For topics, we want just the text without descriptions, and remove unwanted symbols
        let displayText = "";
        if (typeof verseResult === 'object' && verseResult.text) {
          displayText = verseResult.text;
        } else {
          displayText = typeof verseResult === 'string' ? verseResult : verseResult.text || verseResult;
        }
        
        // Remove additional symbols for topics display
        displayText = displayText.replace(/[¶\[\]‹›]/g, '').trim();
        
        return `<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${displayText}</li>`;
      }).join("");

      return `<h4 class="mt-4 font-semibold text-lg text-theme-text">${subtopicName}</h4><ul class="list-disc pl-5">${items}</ul>`;
    }).join("");
    
    // Add any misc verses that don't belong to a subtopic
    if (grouped["Misc"] && grouped["Misc"].length > 0) {
      const miscItems = grouped["Misc"].map(v => {
        // Check if this is a verse range by looking for "(Range: X-Y)" in the note
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${startVerse}-${endVerse}`;
          
          // For ranges, show all verses in the range
          let allVersesText = "";
          for (let verseNum = parseInt(startVerse); verseNum <= parseInt(endVerse); verseNum++) {
            const match = bibleData.find(b =>
              b.book_name.toLowerCase() === v.book.toLowerCase() &&
              b.chapter === parseInt(v.chapter) &&
              b.verse === verseNum
            );
            
            if (match) {
              const verseResult = cleanVerseText(match.text);
              let displayText = "";
              if (typeof verseResult === 'object' && verseResult.text) {
                displayText = verseResult.text;
              } else {
                displayText = typeof verseResult === 'string' ? verseResult : verseResult.text || verseResult;
              }
              displayText = displayText.replace(/[¶\[\]‹›]/g, '').trim();
              
              allVersesText += `<strong>${verseNum}:</strong> ${displayText} `;
            }
          }
          
          if (!allVersesText) {
            allVersesText = "(verses not found)";
          }
          
          return `<li><strong>${verseRef}</strong> – ${allVersesText}</li>`;
        }
        
        const match = bibleData.find(b =>
          b.book_name.toLowerCase() === v.book.toLowerCase() &&
          b.chapter === parseInt(v.chapter) &&
          b.verse === parseInt(v.verse)
        );
        const verseResult = match ? cleanVerseText(match.text) : "(verse not found)";
        
        let displayText = "";
        if (typeof verseResult === 'object' && verseResult.text) {
          displayText = verseResult.text;
        } else {
          displayText = typeof verseResult === 'string' ? verseResult : verseResult.text || verseResult;
        }
        
        displayText = displayText.replace(/[¶\[\]‹›]/g, '').trim();
        
        return `<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${displayText}</li>`;
      }).join("");
      
      verseList += `<ul class="list-disc pl-5">${miscItems}</ul>`;
    }

    const topicHTML = `
      <div class="rounded p-4 bg-theme-surface">
        <button onclick="toggleTopic('${topic.id}')" class="text-lg font-semibold text-left w-full text-theme-text hover:text-theme-accent flex justify-between items-center">
          <span>${topic.title}</span>
          <span id="toggle-icon-${topic.id}" class="text-xl">+</span>
        </button>
        <div id="topic-${topic.id}" class="ml-4 mt-2 text-sm text-theme-subtle-text hidden overflow-hidden transition-all duration-300 ease-in-out">
          ${verseList}
        </div>
      </div>
    `;
    
    console.log(`Generated HTML for topic ${topic.id}:`, topicHTML.substring(0, 200) + "...");
    container.innerHTML += topicHTML;
  });
}

window.toggleTopic = function(id) {
  console.log("=== Toggling topic:", id, "===");
  
  const el = document.getElementById("topic-" + id);
  const icon = document.getElementById("toggle-icon-" + id);
  
  if (!el || !icon) {
    console.log("ERROR: Element not found for topic:", id);
    console.log("- Content element:", el);
    console.log("- Icon element:", icon);
    return;
  }
  
  const isCurrentlyHidden = el.classList.contains("hidden");
  console.log("Current state - Hidden:", isCurrentlyHidden, "for topic", id);
  
  if (isCurrentlyHidden) {
    // OPENING: Show the content with animation
    console.log("OPENING topic", id);
    
    // Remove hidden class and prepare for animation
    el.classList.remove("hidden");
    el.style.maxHeight = "0px";
    el.style.overflow = "hidden";
    el.style.transition = "max-height 0.4s ease-out";
    
    // Get the target height
    const scrollHeight = el.scrollHeight;
    console.log("Target height for topic", id, ":", scrollHeight);
    
    // Animate to full height
    requestAnimationFrame(() => {
      el.style.maxHeight = scrollHeight + "px";
    });
    
    // Update icon
    icon.textContent = "−";
    
    // Clean up after animation
    setTimeout(() => {
      el.style.maxHeight = "none";
      el.style.overflow = "";
      el.style.transition = "";
    }, 400);
    
  } else {
    // CLOSING: Hide the content with animation
    console.log("CLOSING topic", id);
    
    // Set current height and prepare for animation
    const currentHeight = el.scrollHeight;
    el.style.maxHeight = currentHeight + "px";
    el.style.overflow = "hidden";
    el.style.transition = "max-height 0.4s ease-out";
    
    // Animate to 0 height
    requestAnimationFrame(() => {
      el.style.maxHeight = "0px";
    });
    
    // Update icon
    icon.textContent = "+";
    
    // Hide completely after animation
    setTimeout(() => {
      el.classList.add("hidden");
      el.style.maxHeight = "";
      el.style.overflow = "";
      el.style.transition = "";
    }, 400);
  }
  
  console.log("=== Toggle initiated for topic:", id, "===");
};

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






// DARK MODE

function toggleDarkMode() {
    // toggle icons inside button
    const sunIcon = document.getElementById('theme-toggle-sun-icon');
    const moonIcon = document.getElementById('theme-toggle-moon-icon');
    sunIcon.classList.toggle('hidden');
    moonIcon.classList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
}












// --- TEXT SELECTION MENU LOGIC ---



function setupSelectionMenu() {
    const resultArea = document.getElementById('result');
    const selectionMenu = document.getElementById('selection-menu');
    const copyButton = document.getElementById('copy-button');
    const shareButton = document.getElementById('share-button');
    const highlightColorButtons = document.getElementById('highlight-colors');
    const removeHighlightButton = document.getElementById('remove-highlight-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const selectedRef = document.getElementById('selected-ref');

    if (!resultArea || !selectionMenu) return;

    let lastClickedVerseElement = null;

    const showMenu = () => {
        selectionMenu.classList.remove('hidden');
    };

    const hideMenu = () => {
        selectionMenu.classList.add('hidden');
        const currentlySelected = document.querySelector('.verse-selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('verse-selected');
        }
    };

    // MODIFIED: This single event listener now handles all click logic
    document.addEventListener('click', (e) => {
        const clickedVerse = e.target.closest('.verse-line');
        const clickedInsideMenu = e.target.closest('#selection-menu');
        
        // Case 1: The user clicked inside the menu. Do nothing.
        if (clickedInsideMenu) {
            return;
        }

        // Case 2: The user clicked on a verse.
        if (clickedVerse) {
            const isAlreadySelected = clickedVerse.classList.contains('verse-selected');

            // First, deselect any other verse
            const previouslySelected = document.querySelector('.verse-selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('verse-selected');
            }

            // If the clicked verse was already the selected one, hide the menu (toggle off)
            if (isAlreadySelected) {
                hideMenu();
                return;
            }

            // Otherwise, select the new verse...
            clickedVerse.classList.add('verse-selected');
            lastClickedVerseElement = clickedVerse;
            
            // ...scroll it into view if needed...
            const menuHeight = selectionMenu.offsetHeight || 150;
            const verseRect = clickedVerse.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (verseRect.bottom > (windowHeight - menuHeight)) {
                const scrollAmount = verseRect.bottom - (windowHeight - menuHeight) + 150;
                window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }

            // ...and show the menu.
            showMenu();
            
            // Update menu content
            selectedRef.textContent = clickedVerse.dataset.verseRef;
            const textSpan = clickedVerse.querySelector('.verse-text');
            const isHighlighted = textSpan && Array.from(textSpan.classList).some(c => c.startsWith('highlight-'));
            removeHighlightButton.classList.toggle('hidden', !isHighlighted);

        } else {
            // Case 3: The user clicked anywhere else (not a verse, not the menu)
            hideMenu();
        }
    });
    
    // --- Button Actions (These are unchanged) ---

    highlightColorButtons.addEventListener('click', (e) => {
        if (e.target.dataset.color && lastClickedVerseElement) {
            const color = e.target.dataset.color;
            const textSpan = lastClickedVerseElement.querySelector('.verse-text');
            if (!textSpan) return;
            textSpan.classList.remove('highlight-yellow', 'highlight-blue', 'highlight-green', 'highlight-pink');
            textSpan.classList.add(`highlight-${color}`);
            const verseRef = lastClickedVerseElement.dataset.verseRef;
            const highlights = getSavedHighlights();
            highlights[verseRef] = color;
            saveHighlights(highlights);
            hideMenu(); // Hide menu after highlighting
        }
    });

    removeHighlightButton.addEventListener('click', () => {
        if (lastClickedVerseElement) {
            const textSpan = lastClickedVerseElement.querySelector('.verse-text');
            if (textSpan) {
                textSpan.classList.remove('highlight-yellow', 'highlight-blue', 'highlight-green', 'highlight-pink');
                const verseRef = lastClickedVerseElement.dataset.verseRef;
                const highlights = getSavedHighlights();
                delete highlights[verseRef];
                saveHighlights(highlights);
            }
            hideMenu(); 
        }
    });

    copyButton.addEventListener('click', () => {
        if (!lastClickedVerseElement) return;
        const book = lastClickedVerseElement.dataset.book;
        const chapter = parseInt(lastClickedVerseElement.dataset.chapter);
        const verse = parseInt(lastClickedVerseElement.dataset.verse);
        const originalVerse = bibleData.find(v => v.book_name === book && v.chapter === chapter && v.verse === verse);
        const cleanOriginalText = originalVerse ? cleanVerseText(originalVerse.text) : lastClickedVerseElement.querySelector('.verse-text').textContent;
        const verseRef = lastClickedVerseElement.dataset.verseRef;
        const urlParams = new URLSearchParams({ book, chapter, verse });
        const shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
        const textToCopy = `"${cleanOriginalText}"\n- ${verseRef}\n\n${shareUrl}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalContent = copyButton.innerHTML;
            copyButton.innerHTML = `<svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!`;
            setTimeout(() => {
                copyButton.innerHTML = originalContent;
                hideMenu();
            }, 1000);
        });
    });

    // SHARE BUTTON
shareButton.addEventListener('click', () => {
    if (!lastClickedVerseElement) return;
    const verseText = lastClickedVerseElement.querySelector('.verse-text').textContent;
    const verseRef = lastClickedVerseElement.dataset.verseRef;

    // Build the shareable URL
    const book = lastClickedVerseElement.dataset.book;
    const chapter = lastClickedVerseElement.dataset.chapter;
    const verse = lastClickedVerseElement.dataset.verse;
    const urlParams = new URLSearchParams({ book, chapter, verse });
    const shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    
    
    if (navigator.share) {
        navigator.share({
            // title: `Verse from The Living Word`,
            // This 'text' property already includes the scripture
            text: `"${verseText}" - ${verseRef}\n${shareUrl}`, 
            url: shareUrl 
        });
    } else {
        alert("Web Share API not supported by your browser.");
    }
});
    
    closeMenuButton.addEventListener('click', hideMenu);
}





// Add these two functions to script.js

function getSavedHighlights() {
    // Gets the highlights from localStorage, or returns an empty object if none exist.
    const highlightsJSON = localStorage.getItem('bibleAppHighlights');
    return highlightsJSON ? JSON.parse(highlightsJSON) : {};
}

function saveHighlights(highlights) {
    // Saves the updated highlights object back to localStorage.
    localStorage.setItem('bibleAppHighlights', JSON.stringify(highlights));
}





// Add this new function to script.js

function applySavedHighlights() {
    const highlights = getSavedHighlights();
    if (Object.keys(highlights).length === 0) return; // No highlights to apply

    const verseElements = document.querySelectorAll('.verse-line');
    verseElements.forEach(verseEl => {
        const verseRef = verseEl.dataset.verseRef;
        if (highlights[verseRef]) {
            const color = highlights[verseRef];
            const textSpan = verseEl.querySelector('.verse-text');
            if (textSpan) {
                textSpan.classList.add(`highlight-${color}`);
            }
        }
    });
}




// Add this new function to script.js

function closeSearch() {
    const origin = sessionStorage.getItem('searchOrigin');
    
    if (origin === 'reader') {
        restoreState();
    } else {
        goHome();
    }
    
    sessionStorage.removeItem('searchOrigin'); // Clean up the flag



     document.getElementById('search-close-button').classList.add('hidden');
}








// Add this entire new function to script.js

function handleUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const book = params.get('book');
    const chapter = params.get('chapter');
    const verse = params.get('verse');

    if (book && chapter) {
        // If the URL has parameters, load the specified scripture
        document.getElementById("book").value = book;
        document.getElementById("chapter").value = chapter;
        document.getElementById("verse").value = verse || "";

        updatePillLabels();

        if (verse) {
            getVerseFromRef(book, chapter, verse);
        } else {
            getChapter(book, chapter);
        }
        return true; // Indicate that a URL was handled
    }
    return false; // Indicate no URL was handled
}






function getDailyVerse() {
  const today = new Date().toISOString().split("T")[0]; // "2025-07-26"
  const saved = JSON.parse(localStorage.getItem("dailyDevotion")) || {};

  if (saved.date === today && saved.verse) {
    return saved.verse;
  }

  // Pick a random verse
  const random = bibleData[Math.floor(Math.random() * bibleData.length)];
  const verseRef = `${random.book_name} ${random.chapter}:${random.verse}`;

  const newVerse = {
    date: today,
    verse: verseRef,
    text: random.text
  };

  localStorage.setItem("dailyDevotion", JSON.stringify(newVerse));
  return newVerse;
}





// In script.js

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









function updateMetadata(book, chapter) {
    const firstVerse = bibleData.find(v => v.book_name === book && v.chapter === parseInt(chapter) && v.verse === 1);
    const descriptionContent = firstVerse 
        ? `${book} ${chapter}: ${cleanVerseText(firstVerse.text).substring(0, 150)}...`
        : `Read ${book} chapter ${chapter} from the Bible on The Living Word Online.`;

    // Update the page title
    document.title = `${book} ${chapter} | The Living Word Online`;

    // Find and update the meta description tag
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        descriptionTag.setAttribute('content', descriptionContent);
    }
}










