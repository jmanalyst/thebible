// Minimal client-side script - all business logic is on the server
// This makes your code much harder to steal since the logic is hidden

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadDailyDevotion();
    handleUrlParameters();
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

// Functions called by HTML onclick handlers
function openBookPicker() {
    fetch('/api/book-picker')
        .then(res => res.json())
        .then(data => {
            document.getElementById("book-picker").innerHTML = data.html;
            document.getElementById("book-picker").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Failed to load book picker:", err);
        });
}

function openChapterPicker() {
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    if (!selectedBook) {
        alert('Please select a book first');
        return;
    }
    
    fetch(`/api/chapter-picker?book=${encodeURIComponent(selectedBook)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("chapter-picker").innerHTML = data.html;
            document.getElementById("chapter-picker").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Failed to load chapter picker:", err);
        });
}

function openVersePicker() {
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    const selectedChapter = document.querySelector('.chapter-item.selected')?.dataset.chapter;
    
    if (!selectedBook || !selectedChapter) {
        alert('Please select a book and chapter first');
        return;
    }
    
    fetch(`/api/verse-picker?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("verse-picker").innerHTML = data.html;
            document.getElementById("verse-picker").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Failed to load verse picker:", err);
        });
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

function toggleSearchDropdown() {
    const searchDropdown = document.getElementById("search-dropdown");
    if (searchDropdown) {
        searchDropdown.classList.toggle("hidden");
    }
}

function closeSearch() {
    const searchDropdown = document.getElementById("search-dropdown");
    const resultSection = document.getElementById("result-section");
    if (searchDropdown) searchDropdown.classList.add("hidden");
    if (resultSection) resultSection.classList.add("hidden");
}

function closeBookPicker() {
    document.getElementById("book-picker").classList.add("hidden");
}

function closeChapterPicker() {
    document.getElementById("chapter-picker").classList.add("hidden");
}

function closeVersePicker() {
    document.getElementById("verse-picker").classList.add("hidden");
}

function loadGenesis1() {
    // This is marked as "Coming Soon" in the HTML
    alert('This feature is coming soon!');
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
    document.getElementById("book-picker").classList.add("hidden");
    document.getElementById("chapter-picker").classList.add("hidden");
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

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const book = urlParams.get('book');
    const chapter = urlParams.get('chapter');
    const verse = urlParams.get('verse');
    
    if (book && chapter && verse) {
        // Load specific verse
        fetch(`/api/verse-content/${book}/${chapter}/${verse}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("result-section").innerHTML = data.html;
                document.getElementById("result-section").classList.remove("hidden");
            })
            .catch(err => {
                console.error("Failed to load verse:", err);
            });
    } else if (book && chapter) {
        // Load chapter
        fetch(`/api/chapter-content/${book}/${chapter}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("result-section").innerHTML = data.html;
                document.getElementById("result-section").classList.remove("hidden");
            })
            .catch(err => {
                console.error("Failed to load chapter:", err);
            });
    }
}

// Selection functions for pickers
function selectBook(book) {
    // Remove previous selection
    document.querySelectorAll('.book-item').forEach(item => item.classList.remove('selected'));
    // Add selection to clicked item
    event.target.classList.add('selected');
    
    // Update UI to show selected book
    const bookDisplay = document.querySelector('.selected-book');
    if (bookDisplay) {
        bookDisplay.textContent = book;
    }
    
    // Close book picker and open chapter picker
    closeBookPicker();
    openChapterPicker();
}

function selectChapter(chapter) {
    // Remove previous selection
    document.querySelectorAll('.chapter-item').forEach(item => item.classList.remove('selected'));
    // Add selection to clicked item
    event.target.classList.add('selected');
    
    // Update UI to show selected chapter
    const chapterDisplay = document.querySelector('.selected-chapter');
    if (chapterDisplay) {
        chapterDisplay.textContent = chapter;
    }
    
    // Close chapter picker and open verse picker
    closeChapterPicker();
    openVersePicker();
}

function selectVerse(verse) {
    // Remove previous selection
    document.querySelectorAll('.verse-item').forEach(item => item.classList.remove('selected'));
    // Add selection to clicked item
    event.target.classList.add('selected');
    
    // Get selected book and chapter
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    const selectedChapter = document.querySelector('.chapter-item.selected')?.dataset.chapter;
    
    if (selectedBook && selectedChapter) {
        // Load the selected verse
        fetch(`/api/verse-content/${selectedBook}/${selectedChapter}/${verse}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("result-section").innerHTML = data.html;
                document.getElementById("result-section").classList.remove("hidden");
                closeVersePicker();
            })
            .catch(err => {
                console.error("Failed to load verse:", err);
            });
    }
}

// This minimal script only handles UI interactions
// All business logic, data processing, and complex functions are on the server
// Users can see this code, but it doesn't contain your valuable logic 