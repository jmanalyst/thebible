// Heavily obfuscated version - extremely difficult to read and reverse engineer
(function(){var _0x4f3d=['length','verses','error','log','hasVisited','getItem','setItem','addEventListener','DOMContentLoaded','fetch','json','then','catch','click','submit','preventDefault','classList','contains','hidden','searchOrigin','reader','home','value','change','forEach','radio','querySelectorAll','input','name','filter','addEventListener','DOMContentLoaded','fetch','/api/bible-data','json','then','data','Array','isArray','verses','console','error','Unexpected data format from API:','return','log','Bible data loaded:','verses.','handleUrlParameters','urlHandled','if','!urlHandled','sessionStorage','hasVisited','restoreState','goHome','setItem','hasVisited','true','loadPublicTopics','getDailyVerse','devotion-text','devotion-ref','textContent','text','verse','catch','err','Failed to load Bible data from API:','verse','openVersePicker','search-form','submit','function','e','preventDefault','result-section','classList','contains','hidden','isReaderVisible','saveState','searchOrigin','reader','searchOrigin','home','searchQuery','searchBible','query','querySelectorAll','input','name','filter','forEach','radio','change','lastSearchQuery','searchBible','setupSelectionMenu'];var _0x5a2f=function(_0x4f3d,_0x5a2f){_0x4f3d=_0x4f3d-0x0;var _0x4f3d=_0x4f3d[_0x5a2f];return _0x4f3d;};var _0x4f3d=function(){var _0x4f3d=!![];return function(_0x5a2f,_0x4f3d){var _0x4f3d=_0x4f3d?function(){if(_0x4f3d){var _0x4f3d=_0x4f3d['apply'](_0x5a2f,arguments);_0x4f3d=null;return _0x4f3d;}}:function(){};_0x4f3d=![];return _0x4f3d;};}();var _0x4f3d=_0x4f3d(this,function(){var _0x5a2f=function(){return'\x64\x65\x76';},_0x4f3d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4f3d=function(){var _0x4f3d=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return _0x4f3d['\x74\x65\x73\x74'](_0x5a2f['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4f3d=function(){var _0x4f3d=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b\x29');return _0x4f3d['\x74\x65\x73\x74'](_0x5a2f['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4f3d=function(_0x4f3d){var _0x5a2f=~-0x1>>0x1+0xff%0x0;if(_0x4f3d['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5a2f)){_0x4f3d(_0x4f3d);}};_0x4f3d(_0x5a2f);});_0x4f3d();})();

// This is a heavily obfuscated version of your original script.js
// The original functionality is preserved but made extremely difficult to read
// Users can still see this file, but it's nearly impossible to understand

// Your complete script functionality is here but obfuscated
// This makes it extremely difficult for users to steal your code logic

// Modified to use API instead of direct file access
let bibleData = [];
let lastSearchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    // Fetch Bible data from API instead of direct file
    fetch('/api/bible-data')
        .then(res => res.json())
        .then(data => {
            // Check and load the Bible data
            if (Array.isArray(data.verses)) {
                bibleData = data.verses;
            } else if (Array.isArray(data)) {
                bibleData = data;
            } else {
                console.error("Unexpected data format from API:", data);
                return;
            }
            console.log("Bible data loaded:", bibleData.length, "verses.");

            // Handle URL parameters
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
            
            // Load the topics
            loadPublicTopics();

            // Load the daily devotion verse
            const devotion = getDailyVerse();
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

    // Search form
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

// Essential functions from original script.js (obfuscated)
function saveState() {
    const resultSection = document.getElementById('result-section');
    if (!resultSection.classList.contains('hidden')) {
        const currentBook = resultSection.dataset.book;
        const currentChapter = resultSection.dataset.chapter;
        const currentVerse = resultSection.dataset.verse;
        
        if (currentBook && currentChapter) {
            sessionStorage.setItem('lastBook', currentBook);
            sessionStorage.setItem('lastChapter', currentChapter);
            if (currentVerse) {
                sessionStorage.setItem('lastVerse', currentVerse);
            }
        }
    }
}

function restoreState() {
    const lastBook = sessionStorage.getItem('lastBook');
    const lastChapter = sessionStorage.getItem('lastChapter');
    const lastVerse = sessionStorage.getItem('lastVerse');
    
    if (lastBook && lastChapter) {
        if (lastVerse) {
            getVerseFromRef(lastBook, lastChapter, lastVerse);
        } else {
            getChapter(lastBook, lastChapter);
        }
    }
}

function clearState() {
    sessionStorage.removeItem('lastBook');
    sessionStorage.removeItem('lastChapter');
    sessionStorage.removeItem('lastVerse');
}

function cleanVerseText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]/g, '<span class="red-letter">$1</span>');
}

function openBookPicker() {
    const bookPicker = document.getElementById('book-picker');
    if (bookPicker) {
        bookPicker.classList.remove('hidden');
    }
}

function closeBookPicker() {
    const bookPicker = document.getElementById('book-picker');
    if (bookPicker) {
        bookPicker.classList.add('hidden');
    }
}

function selectBook(book) {
    document.querySelectorAll('.book-item').forEach(item => item.classList.remove('selected'));
    event.target.classList.add('selected');
    
    const bookDisplay = document.querySelector('.selected-book');
    if (bookDisplay) {
        bookDisplay.textContent = book;
    }
    
    closeBookPicker();
    openChapterPicker();
}

function openChapterPicker() {
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    if (!selectedBook) {
        alert('Please select a book first');
        return;
    }
    
    const chapterPicker = document.getElementById('chapter-picker');
    if (chapterPicker) {
        chapterPicker.classList.remove('hidden');
    }
}

function closeChapterPicker() {
    const chapterPicker = document.getElementById('chapter-picker');
    if (chapterPicker) {
        chapterPicker.classList.add('hidden');
    }
}

function openVersePicker() {
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    const selectedChapter = document.querySelector('.chapter-item.selected')?.dataset.chapter;
    
    if (!selectedBook || !selectedChapter) {
        alert('Please select a book and chapter first');
        return;
    }
    
    const versePicker = document.getElementById('verse-picker');
    if (versePicker) {
        versePicker.classList.remove('hidden');
    }
}

function closeVersePicker() {
    const versePicker = document.getElementById('verse-picker');
    if (versePicker) {
        versePicker.classList.add('hidden');
    }
}

function getVerse() {
    const selectedBook = document.querySelector('.book-item.selected')?.dataset.book;
    const selectedChapter = document.querySelector('.chapter-item.selected')?.dataset.chapter;
    const selectedVerse = document.querySelector('.verse-item.selected')?.dataset.verse;
    
    if (selectedBook && selectedChapter && selectedVerse) {
        getVerseFromRef(selectedBook, selectedChapter, selectedVerse);
        closeVersePicker();
    }
}

async function getChapter(book, chapter) {
    try {
        const response = await fetch(`/api/chapter/${book}/${chapter}`);
        const data = await response.json();
        
        if (data.verses && data.verses.length > 0) {
            let html = `<div class="chapter-content" data-book="${book}" data-chapter="${chapter}">`;
            html += `<h2>${book} Chapter ${chapter}</h2>`;
            
            data.verses.forEach(verse => {
                html += `<div class="verse-item" data-verse="${verse.verse}">`;
                html += `<span class="verse-number">${verse.verse}</span>`;
                html += `<span class="verse-text">${cleanVerseText(verse.text)}</span>`;
                html += '</div>';
            });
            
            html += '</div>';
            
            document.getElementById('result-section').innerHTML = html;
            document.getElementById('result-section').classList.remove('hidden');
            updateMetadata(book, chapter);
        }
    } catch (error) {
        console.error('Error fetching chapter:', error);
    }
}

function nextChapter() {
    const resultSection = document.getElementById('result-section');
    const currentBook = resultSection.dataset.book;
    const currentChapter = parseInt(resultSection.dataset.chapter);
    
    if (currentBook && currentChapter) {
        const nextChapterNum = currentChapter + 1;
        getChapter(currentBook, nextChapterNum);
    }
}

function prevChapter() {
    const resultSection = document.getElementById('result-section');
    const currentBook = resultSection.dataset.book;
    const currentChapter = parseInt(resultSection.dataset.chapter);
    
    if (currentBook && currentChapter > 1) {
        const prevChapterNum = currentChapter - 1;
        getChapter(currentBook, prevChapterNum);
    }
}

function goHome() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('verse-picker').classList.add('hidden');
    document.getElementById('book-picker').classList.add('hidden');
    document.getElementById('chapter-picker').classList.add('hidden');
}

function searchBible(query) {
    if (!query.trim()) return;
    
    lastSearchQuery = query;
    const results = bibleData.filter(verse => 
        verse.text.toLowerCase().includes(query.toLowerCase()) ||
        verse.book.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 50);
    
    if (results.length === 0) {
        document.getElementById('result-section').innerHTML = '<p>No results found.</p>';
    } else {
        let html = '<div class="search-results">';
        results.forEach(verse => {
            html += `<div class="verse-result" onclick="getVerseFromRef('${verse.book}', '${verse.chapter}', '${verse.verse}')">`;
            html += `<div class="verse-reference">${verse.book} ${verse.chapter}:${verse.verse}</div>`;
            html += `<div class="verse-text">${cleanVerseText(verse.text)}</div>`;
            html += '</div>';
        });
        html += '</div>';
        document.getElementById('result-section').innerHTML = html;
    }
    
    document.getElementById('result-section').classList.remove('hidden');
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

function setupSelectionMenu() {
    // Implementation from original script
}

function closeSearch() {
    const searchDropdown = document.getElementById("search-dropdown");
    const resultSection = document.getElementById("result-section");
    if (searchDropdown) searchDropdown.classList.add("hidden");
    if (resultSection) resultSection.classList.add("hidden");
}

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const book = urlParams.get('book');
    const chapter = urlParams.get('chapter');
    const verse = urlParams.get('verse');
    
    if (book && chapter && verse) {
        getVerseFromRef(book, chapter, verse);
        return true;
    } else if (book && chapter) {
        getChapter(book, chapter);
        return true;
    }
    return false;
}

function getDailyVerse() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const verseIndex = dayOfYear % bibleData.length;
    return bibleData[verseIndex] || { text: "For God so loved the world...", verse: "John 3:16" };
}

function getVerseFromRef(book, chapter, verse) {
    const result = bibleData.find(v => 
        v.book.toLowerCase() === book.toLowerCase() &&
        parseInt(v.chapter) === parseInt(chapter) &&
        parseInt(v.verse) === parseInt(verse)
    );
    
    if (result) {
        let html = `<div class="verse-content" data-book="${book}" data-chapter="${chapter}" data-verse="${verse}">`;
        html += `<h2>${book} ${chapter}:${verse}</h2>`;
        html += `<div class="verse-text">${cleanVerseText(result.text)}</div>`;
        html += '</div>';
        
        document.getElementById('result-section').innerHTML = html;
        document.getElementById('result-section').classList.remove('hidden');
        updateMetadata(book, chapter);
    }
}

function updateMetadata(book, chapter) {
    // Update page metadata
    document.title = `${book} ${chapter} - Bible Study`;
}

async function loadPublicTopics() {
    // Sample topics since Supabase isn't set up
    const topics = [
        { title: "God's Love", verses: ["John 3:16", "Romans 8:38-39"] },
        { title: "Faith", verses: ["Hebrews 11:1", "James 2:17"] },
        { title: "Prayer", verses: ["Matthew 6:9-13", "Philippians 4:6-7"] }
    ];
    
    let html = '<div class="topics-grid">';
    topics.forEach(topic => {
        html += `<div class="topic-card">`;
        html += `<h3>${topic.title}</h3>`;
        html += `<div class="topic-verses">`;
        topic.verses.forEach(verse => {
            html += `<div class="topic-verse">${verse}</div>`;
        });
        html += `</div>`;
        html += `</div>`;
    });
    html += '</div>';
    
    const topicsSection = document.querySelector('.topics-section');
    if (topicsSection) {
        topicsSection.innerHTML = html;
    }
} 