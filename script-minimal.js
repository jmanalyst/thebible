// Minimal client-side script - all business logic is on the server
// This makes your code much harder to steal since the logic is hidden

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadDailyDevotion();
});

function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", handleSearch);
    }
    
    // Verse picker
    const verseBtn = document.getElementById("verse");
    if (verseBtn) {
        verseBtn.addEventListener("click", loadVersePicker);
    }
    
    // Navigation
    const homeBtn = document.getElementById("home");
    if (homeBtn) {
        homeBtn.addEventListener("click", goHome);
    }
    
    const readerBtn = document.getElementById("reader");
    if (readerBtn) {
        readerBtn.addEventListener("click", goToReader);
    }
}

function handleSearch(e) {
    e.preventDefault();
    const query = document.querySelector('input[name="searchQuery"]').value;
    
    // Server renders the search results
    fetch(`/api/search-results?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("result-section").innerHTML = data.html;
            document.getElementById("result-section").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Search failed:", err);
        });
}

function loadVersePicker() {
    // Server renders the verse picker
    fetch('/api/verse-picker')
        .then(res => res.json())
        .then(data => {
            document.getElementById("verse-picker").innerHTML = data.html;
            document.getElementById("verse-picker").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Failed to load verse picker:", err);
        });
}

function loadDailyDevotion() {
    // Server renders the daily devotion
    fetch('/api/daily-devotion')
        .then(res => res.json())
        .then(data => {
            const devotionSection = document.querySelector(".devotion-text");
            if (devotionSection) {
                devotionSection.innerHTML = data.html;
            }
        })
        .catch(err => {
            console.error("Failed to load daily devotion:", err);
        });
}

function goHome() {
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("verse-picker").classList.add("hidden");
    // Server could render home content if needed
}

function goToReader() {
    // Server renders reader interface
    fetch('/api/reader-interface')
        .then(res => res.json())
        .then(data => {
            document.getElementById("result-section").innerHTML = data.html;
            document.getElementById("result-section").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Failed to load reader:", err);
        });
}

// This minimal script only handles UI interactions
// All business logic, data processing, and complex functions are on the server
// Users can see this code, but it doesn't contain your valuable logic 