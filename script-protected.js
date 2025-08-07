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

// Include all your other functions here...
// (Copy the rest of your original script.js functions)

// Placeholder for other functions - you'll need to copy them from your original script.js
function saveState() { /* implementation */ }
function restoreState() { /* implementation */ }
function clearState() { /* implementation */ }
function cleanVerseText(text) { /* implementation */ }
function addTooltipsToVerseText(text) { /* implementation */ }
function showPrevNextVerseButtons(ref) { /* implementation */ }
function readFullChapter() { /* implementation */ }
function nextVerse() { /* implementation */ }
function prevVerse() { /* implementation */ }
function openBookPicker() { /* implementation */ }
function closeBookPicker() { /* implementation */ }
function selectBook(book) { /* implementation */ }
function openChapterPicker() { /* implementation */ }
function closeChapterPicker() { /* implementation */ }
function openVersePicker() { /* implementation */ }
function closeVersePicker() { /* implementation */ }
function getVerse() { /* implementation */ }
function nextChapter() { /* implementation */ }
function prevChapter() { /* implementation */ }
function showResultArea() { /* implementation */ }
function goHome() { /* implementation */ }
function maybeAutoFetch() { /* implementation */ }
function startListening() { /* implementation */ }
function parseSpeechInput(input) { /* implementation */ }
function toggleSearch() { /* implementation */ }
function loadPublicTopics() { /* implementation */ }
function toggleDarkMode() { /* implementation */ }
function setupSelectionMenu() { /* implementation */ }
function getSavedHighlights() { /* implementation */ }
function saveHighlights(highlights) { /* implementation */ }
function applySavedHighlights() { /* implementation */ }
function closeSearch() { /* implementation */ }
function handleUrlParameters() { /* implementation */ }
function getDailyVerse() { /* implementation */ }
function formatRedLetterText(text) { /* implementation */ }
function formatTranslatorText(text) { /* implementation */ }
function updateMetadata(book, chapter) { /* implementation */ }
function displaySearchResults(results, query) { /* implementation */ }
function displayNoResults(query) { /* implementation */ } 