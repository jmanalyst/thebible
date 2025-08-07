// Protected version of script.js - uses server API instead of direct JSON access

let bibleData = [];
let lastSearchQuery = "";

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

// Copy all the essential functions from your original script.js
// These functions remain the same but work with the API data

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
        document.getElementById("pill-book").textContent = savedBook;
        document.getElementById("pill-chapter").textContent = savedChapter;
        document.getElementById("pill-verse").textContent = savedVerse || "Verse";
        
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

// Essential functions - you'll need to copy the rest from your original script.js
function openVersePicker() { /* Copy from original script.js */ }
function closeVersePicker() { /* Copy from original script.js */ }
function getVerse() { /* Copy from original script.js */ }
function nextChapter() { /* Copy from original script.js */ }
function prevChapter() { /* Copy from original script.js */ }
function setupSelectionMenu() { /* Copy from original script.js */ }
function getSavedHighlights() { /* Copy from original script.js */ }
function saveHighlights(highlights) { /* Copy from original script.js */ }
function applySavedHighlights() { /* Copy from original script.js */ }
function closeSearch() { /* Copy from original script.js */ }
function handleUrlParameters() { return false; }
function getDailyVerse() { 
    return {
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        verse: "John 3:16"
    };
}
function formatRedLetterText(text) { return text; }
function formatTranslatorText(text) { return text; }
function updateMetadata(book, chapter) { /* Copy from original script.js */ }
function displaySearchResults(results, query) { /* Copy from original script.js */ }
function displayNoResults(query) { /* Copy from original script.js */ }

// Make functions globally available
window.goHomeApp = goHome;
window.showResultArea = showResultArea;
window.toggleDarkMode = toggleDarkMode; 