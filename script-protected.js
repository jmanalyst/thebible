// Protected version of script.js - uses server API instead of direct JSON access

let bibleData = [];
let lastSearchQuery = "";
let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

// Essential data structures
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu", "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa", "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr", "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro", "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal", "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom", "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th", "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb", "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo", "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    // Fetch Bible data from server API instead of direct JSON file
    fetch('/api/bible-data')
        .then(res => res.json())
        .then(data => {
            // Step 1: Check and load the Bible data
            if (Array.isArray(data.verses)) {
                bibleData = data.verses;
            } else {
                console.error("Unexpected data format from API:", data);
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
            console.error("Failed to load Bible data from API:", err);
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

// Modified search function to use server API
async function searchBible(query) {
    if (!query.trim()) return;
    
    lastSearchQuery = query;
    
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displaySearchResults(data.results, query);
        } else {
            displayNoResults(query);
        }
    } catch (error) {
        console.error("Search failed:", error);
        displayNoResults(query);
    }
}

// Modified function to get verse from server API
async function getVerseFromRef(book, chapter, verse) {
    try {
        const response = await fetch(`/api/verse/${encodeURIComponent(book)}/${chapter}/${verse}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch verse:", error);
        return null;
    }
}

// Modified function to get chapter from server API
async function getChapter(book, chapter) {
    try {
        const response = await fetch(`/api/chapter/${encodeURIComponent(book)}/${chapter}`);
        const data = await response.json();
        return data.verses || [];
    } catch (error) {
        console.error("Failed to fetch chapter:", error);
        return [];
    }
}

// Essential functions from original script.js
function saveState() {
    const currentBook = document.getElementById("book")?.value;
    const currentChapter = document.getElementById("chapter")?.value;
    const currentVerse = document.getElementById("verse")?.value;
    
    if (currentBook && currentChapter) {
        sessionStorage.setItem('currentBook', currentBook);
        sessionStorage.setItem('currentChapter', currentChapter);
        sessionStorage.setItem('currentVerse', currentVerse || '');
    }
}

function restoreState() {
    const savedBook = sessionStorage.getItem('currentBook');
    const savedChapter = sessionStorage.getItem('currentChapter');
    const savedVerse = sessionStorage.getItem('currentVerse');
    
    if (savedBook && savedChapter) {
        document.getElementById("book").value = savedBook;
        document.getElementById("chapter").value = savedChapter;
        document.getElementById("verse").value = savedVerse || '';
        
        // Update pill display
        updatePillLabels();
        
        // Load the content
        maybeAutoFetch();
        showResultArea();
    }
}

function clearState() {
    sessionStorage.removeItem('currentBook');
    sessionStorage.removeItem('currentChapter');
    sessionStorage.removeItem('currentVerse');
    sessionStorage.removeItem('hasVisited');
}

function cleanVerseText(text) {
    return text.trim();
}

function showResultArea() {
    document.getElementById("welcome-section").classList.add("hidden");
    document.getElementById("result-section").classList.remove("hidden");
    document.getElementById("topics-wrapper").classList.add("hidden");
}

function goHome() {
    document.getElementById("welcome-section").classList.remove("hidden");
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("topics-wrapper").classList.remove("hidden");
}

function maybeAutoFetch() {
    const book = document.getElementById("book").value;
    const chapter = document.getElementById("chapter").value;
    const verse = document.getElementById("verse").value;
    
    if (book && chapter) {
        if (verse) {
            getVerse();
        } else {
            getChapter(book, chapter);
        }
    }
}

function updatePillLabels() {
    const book = document.getElementById("book").value;
    const chapter = document.getElementById("chapter").value;
    const verse = document.getElementById("verse").value;
    
    document.getElementById("pill-book").textContent = book || "Book";
    document.getElementById("pill-chapter").textContent = chapter || "Chapter";
    document.getElementById("pill-verse").textContent = verse || "Verse";
}

// Book picker functions
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

// Chapter picker functions
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

// Verse picker functions
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
        btn.className = "px-2 py-1 rounded hover:bg-gray-200";
        btn.onclick = () => {
            document.getElementById("verse").value = v.verse;
            closeVersePicker();
            updatePillLabels();
            getVerse();
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
        grid.appendChild(btn);
    });
}

function closeVersePicker() {
    document.getElementById("verse-picker").classList.add("hidden");
}

// Bible Topics Function - using sample data for now
async function loadPublicTopics() {
    console.log("=== Loading Public Topics ===");
    
    const sampleTopics = [
        {
            id: 1,
            title: "God's Love",
            verses: [
                { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
                { book: "1 John", chapter: 4, verse: 8, text: "He that loveth not knoweth not God; for God is love." }
            ]
        },
        {
            id: 2,
            title: "Faith",
            verses: [
                { book: "Hebrews", chapter: 11, verse: 1, text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
                { book: "Romans", chapter: 10, verse: 17, text: "So then faith cometh by hearing, and hearing by the word of God." }
            ]
        },
        {
            id: 3,
            title: "Prayer",
            verses: [
                { book: "Matthew", chapter: 6, verse: 9, text: "After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name." },
                { book: "Philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." }
            ]
        }
    ];
    
    const container = document.getElementById("topics-display");
    if (!container) {
        console.error("Topics container not found!");
        return;
    }
    container.innerHTML = "";

    sampleTopics.forEach((topic) => {
        const verseList = topic.verses.map(v => 
            `<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${v.text}</li>`
        ).join("");

        const topicHTML = `
            <div class="rounded p-4 bg-theme-surface">
                <button onclick="toggleTopic('${topic.id}')" class="text-lg font-semibold text-left w-full text-theme-text hover:text-theme-accent flex justify-between items-center">
                    <span>${topic.title}</span>
                    <span id="toggle-icon-${topic.id}" class="text-xl">+</span>
                </button>
                <div id="topic-${topic.id}" class="ml-4 mt-2 text-sm text-theme-subtle-text hidden overflow-hidden transition-all duration-300 ease-in-out">
                    <ul class="list-disc pl-5">${verseList}</ul>
                </div>
            </div>
        `;
        
        container.innerHTML += topicHTML;
    });
}

// Topic toggle function
window.toggleTopic = function(id) {
    const el = document.getElementById("topic-" + id);
    const icon = document.getElementById("toggle-icon-" + id);
    
    if (!el || !icon) return;
    
    const isCurrentlyHidden = el.classList.contains("hidden");
    
    if (isCurrentlyHidden) {
        el.classList.remove("hidden");
        el.style.maxHeight = "0px";
        el.style.overflow = "hidden";
        el.style.transition = "max-height 0.4s ease-out";
        
        const scrollHeight = el.scrollHeight;
        requestAnimationFrame(() => {
            el.style.maxHeight = scrollHeight + "px";
        });
        
        icon.textContent = "−";
        
        setTimeout(() => {
            el.style.maxHeight = "none";
            el.style.overflow = "";
            el.style.transition = "";
        }, 400);
    } else {
        const currentHeight = el.scrollHeight;
        el.style.maxHeight = currentHeight + "px";
        el.style.overflow = "hidden";
        el.style.transition = "max-height 0.4s ease-out";
        
        requestAnimationFrame(() => {
            el.style.maxHeight = "0px";
        });
        
        icon.textContent = "+";
        
        setTimeout(() => {
            el.classList.add("hidden");
            el.style.maxHeight = "";
            el.style.overflow = "";
            el.style.transition = "";
        }, 400);
    }
};

// Dark mode function
function toggleDarkMode() {
    const sunIcon = document.getElementById('theme-toggle-sun-icon');
    const moonIcon = document.getElementById('theme-toggle-moon-icon');
    sunIcon.classList.toggle('hidden');
    moonIcon.classList.toggle('hidden');

    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
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

// Essential functions - simplified implementations
function getVerse() {
    const book = document.getElementById("book").value;
    const chapter = document.getElementById("chapter").value;
    const verse = document.getElementById("verse").value;
    
    if (book && chapter && verse) {
        getVerseFromRef(book, chapter, verse);
    }
}

function nextChapter() {
    const book = document.getElementById("book").value;
    const chapter = parseInt(document.getElementById("chapter").value);
    
    if (book && chapter && chapterCounts[book] && chapter < chapterCounts[book]) {
        document.getElementById("chapter").value = chapter + 1;
        document.getElementById("verse").value = "";
        updatePillLabels();
        getChapter(book, chapter + 1);
    }
}

function prevChapter() {
    const book = document.getElementById("book").value;
    const chapter = parseInt(document.getElementById("chapter").value);
    
    if (book && chapter && chapter > 1) {
        document.getElementById("chapter").value = chapter - 1;
        document.getElementById("verse").value = "";
        updatePillLabels();
        getChapter(book, chapter - 1);
    }
}

function setupSelectionMenu() {
    // Simplified implementation
    console.log("Selection menu setup complete");
}

function getSavedHighlights() {
    return JSON.parse(localStorage.getItem('highlights') || '{}');
}

function saveHighlights(highlights) {
    localStorage.setItem('highlights', JSON.stringify(highlights));
}

function applySavedHighlights() {
    // Simplified implementation
}

function closeSearch() {
    const dropdown = document.getElementById("search-dropdown");
    if (dropdown) {
        dropdown.classList.add("hidden");
    }
}

function handleUrlParameters() { 
    return false; 
}

function getDailyVerse() { 
    return {
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        verse: "John 3:16"
    };
}

function formatRedLetterText(text) { 
    return text; 
}

function formatTranslatorText(text) { 
    return text; 
}

function updateMetadata(book, chapter) { 
    // Simplified implementation
}

function displaySearchResults(results, query) { 
    // Simplified implementation
    console.log("Search results:", results);
}

function displayNoResults(query) { 
    // Simplified implementation
    console.log("No results for:", query);
}

// Make functions globally available
window.goHomeApp = goHome;
window.showResultArea = showResultArea;
window.toggleDarkMode = toggleDarkMode;
window.openBookPicker = openBookPicker;
window.openChapterPicker = openChapterPicker;
window.openVersePicker = openVersePicker; 