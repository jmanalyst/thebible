// script.js

let bibleData = [];
let lastSearchQuery = "";
let currentTranslation = "kjv";

// Translation mapping
const translations = {
    kjv: { name: "King James Version", file: "kjv.json", display: "KJV" },
    asv: { name: "American Standard Version", file: "asv.json", display: "ASV" },
    rvg: { name: "Reina Valera Gómez", file: "rvg.json", display: "RVG" },
    rvg_2004: { name: "Reina Valera Gómez 2004", file: "rvg_2004.json", display: "RVG 2004" },
    rv_1909: { name: "Reina Valera 1909", file: "rv_1909.json", display: "RV 1909" },
    web: { name: "World English Bible", file: "web.json", display: "WEB" }
};

// SECURE: Function to initialize a translation (no data loading)
async function loadTranslation(translationKey) {
    console.log('Initializing translation:', translationKey);
    
    if (!translations[translationKey]) {
        console.error("Invalid translation key:", translationKey);
        return;
    }
    
    // Show loading state
    updateTranslationDisplay('Loading...');
    
    try {
        // SECURITY: We no longer load entire Bible files
        // Instead, we just set the current translation and load content on-demand
        
        currentTranslation = translationKey;
        localStorage.setItem('preferredTranslation', translationKey);
        
        // Clear any existing Bible data (security measure)
        bibleData = [];
        
        // Update the UI to show current translation
        updateTranslationDisplay();
        
        // Dispatch global event to trigger refresh
        document.dispatchEvent(new CustomEvent('translationChanged', {
            detail: { translation: translationKey, verseCount: 0 }
        }));
        
        console.log(`${translations[translationKey].name} initialized. Content will be loaded on-demand.`);
        
        return { success: true, translation: translationKey };
    } catch (error) {
        console.error("Failed to initialize translation:", error);
        // Revert to previous translation on error
        updateTranslationDisplay();
        showNotification(`Failed to initialize ${translations[translationKey].name}. Please try again.`, 5000);
        throw error;
    }
}

// NEW: Secure function to get a specific verse
async function getSecureVerse(book, chapter, verse, translation = currentTranslation) {
    try {
        const response = await fetch(`/api/verse/${book}/${chapter}/${verse}?translation=${translation}`);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 404) {
                throw new Error('Verse not found.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const verseData = await response.json();
        return verseData;
    } catch (error) {
        console.error("Failed to get secure verse:", error);
        throw error;
    }
}

// NEW: Secure function to get a specific chapter
async function getSecureChapter(book, chapter, translation = currentTranslation) {
    try {
        const response = await fetch(`/api/chapter/${book}/${chapter}?translation=${translation}`);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 404) {
                throw new Error('Chapter not found.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const chapterData = await response.json();
        return chapterData;
    } catch (error) {
        console.error("Failed to get secure chapter:", error);
        throw error;
    }
}

// Function to initialize the translation selector
function initializeTranslationSelector() {
    // No translation selector to initialize since it was removed
    console.log('Translation selector initialization skipped - element was removed');
}

// Function to update the translation display in the UI
function updateTranslationDisplay(loadingText = null) {
    const displayElements = [
        document.getElementById('current-translation'),
        document.getElementById('current-translation-small'),
        document.getElementById('current-translation-results')
    ];
    
    displayElements.forEach(element => {
        if (element) {
            if (loadingText) {
                element.textContent = loadingText;
            } else if (translations[currentTranslation]) {
                element.textContent = translations[currentTranslation].display;
            }
        }
    });
}

// Function to show a temporary notification
function showNotification(message, duration = 3000) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.translation-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'translation-notification fixed top-20 left-1/2 transform -translate-x-1/2 bg-theme-accent text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// Function to toggle the search dropdown
function toggleSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close search dropdown when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.getElementById('search-container');
    const dropdown = document.getElementById('search-dropdown');
    
    if (searchContainer && dropdown && !searchContainer.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K to open search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleSearchDropdown();
        const searchInput = document.getElementById('searchQuery');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Ctrl/Cmd + T to toggle translation bar - removed since translation bar no longer exists
    
    // Escape to close search dropdown
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    }
});

// Function to load Genesis chapter 1 (for the Start Reading button)
function loadGenesis1() {
    // Set the form values directly
    document.getElementById('book').value = 'Genesis';
    document.getElementById('chapter').value = '1';
    document.getElementById('verse').value = '';
    
    // Update pill labels
    updatePillLabels();
    
    // Load the chapter with smooth transition
    getChapter('Genesis', 1);
}

// Function to show a sample verse from the current translation
function showTranslationSample() {
    // Array of uplifting and inspiring Bible verses
    const upliftingVerses = [
        {
            reference: "John 3:16",
            text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
        },
        {
            reference: "Psalm 23:1-3",
            text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake."
        },
        {
            reference: "Philippians 4:13",
            text: "I can do all things through Christ which strengtheneth me."
        },
        {
            reference: "Isaiah 40:31",
            text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
        },
        {
            reference: "Romans 8:28",
            text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."
        },
        {
            reference: "Jeremiah 29:11",
            text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."
        },
        {
            reference: "Matthew 11:28",
            text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest."
        },
        {
            reference: "Joshua 1:9",
            text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest."
        }
    ];
    
    // Select 1 random verse
    const randomIndex = Math.floor(Math.random() * upliftingVerses.length);
    const selectedVerse = upliftingVerses[randomIndex];
    
    const sampleHTML = `
        <div class="text-center py-8">
            <div class="bg-theme-surface border border-theme-border rounded-lg p-6 max-w-2xl mx-auto">
                <p class="text-theme-subtle-text text-sm mb-2">${selectedVerse.reference}</p>
                <p class="text-theme-text text-lg leading-relaxed italic">"${selectedVerse.text}"</p>
            </div>
        </div>
    `;
    
    // Insert the sample after the welcome section
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
        // Remove any existing sample
        const existingSample = document.querySelector('.translation-sample');
        if (existingSample) {
            existingSample.remove();
        }
        
        // Add new sample
        const sampleDiv = document.createElement('div');
        sampleDiv.className = 'translation-sample';
        sampleDiv.innerHTML = sampleHTML;
        welcomeSection.parentNode.insertBefore(sampleDiv, welcomeSection.nextSibling);
    }
}

// Function to clear the translation sample
function clearTranslationSample() {
    const existingSample = document.querySelector('.translation-sample');
    if (existingSample) {
        existingSample.remove();
    }
}

// Debug function to test translation switching (call from browser console)
function testTranslationSwitch(translationKey = 'asv') {
    console.log('=== Testing Translation Switch ===');
    console.log('Current translation:', currentTranslation);
    
    // Change translation
    console.log('Changing to:', translationKey);
    loadTranslation(translationKey).then(() => {
        console.log('Translation loaded successfully');
        console.log('New translation:', currentTranslation);
        
        // Test getting Genesis 1
        console.log('Testing Genesis 1 with new translation...');
        getChapter('Genesis', 1);
    }).catch(error => {
        console.error('Translation switch failed:', error);
    });
}

// Force refresh function that definitely works
let isRefreshing = false; // Prevent duplicate refreshes

function forceRefreshCurrentView() {
    if (isRefreshing) {
        console.log('Refresh already in progress, skipping...');
        return;
    }
    
    isRefreshing = true;
    console.log('=== FORCE REFRESH CURRENT VIEW ===');
    
    const currentBook = document.getElementById('book').value;
    const currentChapter = document.getElementById('chapter').value;
    const currentVerse = document.getElementById('verse').value;
    
    console.log('Current state:', { currentBook, currentChapter, currentVerse });
    console.log('Current translation:', currentTranslation);
    
    // Show immediate loading state
    const result = document.getElementById('result');
    if (result) {
        result.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent"></div>
                <p class="mt-2 text-theme-subtle-text">Refreshing with ${translations[currentTranslation].name}...</p>
            </div>
        `;
    }
    
    // Force refresh after a short delay
    setTimeout(() => {
        if (currentBook && currentChapter) {
            if (currentVerse) {
                console.log('Force refreshing verse:', currentBook, currentChapter, currentVerse);
                getVerseFromRef(currentBook, currentChapter, currentVerse);
            } else {
                console.log('Force refreshing chapter:', currentBook, currentChapter);
                getChapter(currentBook, currentChapter);
            }
        } else {
            console.log('No book/chapter selected, cannot refresh');
            // Try to restore from session storage if available
            const savedState = sessionStorage.getItem('lastReadingState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    if (state.book && state.chapter) {
                        console.log('Restoring from session storage:', state);
                        document.getElementById('book').value = state.book;
                        document.getElementById('chapter').value = state.chapter;
                        if (state.verse) {
                            document.getElementById('verse').value = state.verse;
                        }
                        // Now try to refresh
                        getChapter(state.book, state.chapter);
                        isRefreshing = false;
                        return;
                    }
                } catch (e) {
                    console.log('Failed to parse saved state');
                }
            }
            
            // Clear loading state
            if (result) {
                result.innerHTML = '<div class="text-center py-8 text-theme-subtle-text">No content to refresh</div>';
            }
        }
        
        // Reset refresh flag
        isRefreshing = false;
    }, 500);
}

// Function to force refresh the current view with new translation
function refreshCurrentView() {
    const currentBook = document.getElementById('book').value;
    const currentChapter = document.getElementById('chapter').value;
    const currentVerse = document.getElementById('verse').value;
    
    console.log('Refreshing current view:', { currentBook, currentChapter, currentVerse });
    console.log('Current translation:', currentTranslation);
    
    if (currentBook && currentChapter) {
        console.log('About to refresh with:', { currentBook, currentChapter, currentVerse, translation: currentTranslation });
        if (currentVerse) {
            // User was viewing a specific verse - refresh that verse
            console.log('Refreshing specific verse');
            getVerseFromRef(currentBook, currentChapter, currentVerse);
        } else {
            // User was viewing a chapter - refresh that chapter
            console.log('Refreshing chapter');
            getChapter(currentBook, currentChapter);
        }
    } else {
        console.log('No book/chapter selected, skipping refresh');
    }
}



// DOM Content

document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme toggle icons based on current theme
    initializeThemeIcons();
    
    // Load user's preferred translation or default to KJV
    currentTranslation = localStorage.getItem('preferredTranslation') || 'kjv';
    
    // Initialize the translation selector
    initializeTranslationSelector();
    
    // Initialize translation bar visibility - removed since translation bar no longer exists
    
            // Load the preferred translation
        loadTranslation(currentTranslation).then(() => {
            // Step 2: NEW LOGIC to determine what to show on page load
            const urlHandled = handleUrlParameters();

            // If a shared URL was not opened, then decide between restoring state or showing home
            if (!urlHandled) {
                // Check if we've already been on the site in this session
                const hasVisited = sessionStorage.getItem('hasVisited');
                const wasOnHomePage = sessionStorage.getItem('wasOnHomePage');
                console.log('🔍 Debug - hasVisited:', hasVisited, 'wasOnHomePage:', wasOnHomePage);
                
                if (hasVisited && !wasOnHomePage) {
                    // This is a REFRESH while reading, so restore the last state
                    console.log('🔄 This is a REFRESH while reading - restoring state');
                    restoreState();
                } else {
                    // This is either a NEW VISIT or a refresh from home page, so show home
                    console.log('🏠 This is a NEW VISIT or refresh from home - going home');
                    goHome();
                    // Show the KJV sample
                    console.log('📖 Attempting to show KJV sample...');
                    setTimeout(() => {
                        console.log('⏰ Timeout fired, calling showTranslationSample()');
                        showTranslationSample();
                    }, 100);
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
        }).catch(err => {
            console.error("Failed to load translation:", err);
        });

    // Setup other event listeners
    document.getElementById("verse").addEventListener("click", openVersePicker);
    
    // Add click handlers for individual verses in the chapter
    document.addEventListener('click', function(e) {
      if (e.target.closest('.verse-line')) {
        const verseLine = e.target.closest('.verse-line');
        const book = verseLine.dataset.book;
        const chapter = verseLine.dataset.chapter;
        const verse = verseLine.dataset.verse;
        
        console.log('🔍 Verse clicked:', { book, chapter, verse });
        
        // Always select the clicked verse (no more toggle)
        console.log('🔍 Selecting verse:', verse);
        
        // Remove selection from all other verses
        document.querySelectorAll('.verse-line').forEach(line => line.classList.remove('verse-selected'));
        
        // Select this verse
        verseLine.classList.add('verse-selected');
        document.getElementById('verse').value = verse;
        currentVerse = parseInt(verse);
        
        // Update meta tags and URL for sharing
        updateMetaTags(book, chapter, verse, verseLine.querySelector('.verse-text').textContent);
        
        // Update pill labels
        updatePillLabels();
      } else {
        // Click outside verses - deselect current selection
        const currentlySelected = document.querySelector('.verse-line.verse-selected');
        if (currentlySelected) {
          console.log('🔍 Click outside - deselecting current verse');
          
          // Get book and chapter from the selected verse
          const book = currentlySelected.dataset.book;
          const chapter = currentlySelected.dataset.chapter;
          
          // Remove selection
          currentlySelected.classList.remove('verse-selected');
          
          // Force reset all inline styles
          currentlySelected.style.backgroundColor = '';
          currentlySelected.style.borderLeft = '';
          currentlySelected.style.paddingLeft = '';
          currentlySelected.style.marginLeft = '';
          currentlySelected.style.borderRadius = '';
          
          // Reset text decoration
          const verseText = currentlySelected.querySelector('.verse-text');
          if (verseText) {
            verseText.style.textDecoration = '';
          }
          
          // Clear verse picker
          document.getElementById('verse').value = '';
          currentVerse = 0;
          
          // Update meta tags for chapter only (no specific verse)
          updateMetaTags(book, chapter, '', '');
          
          // Update pill labels
          updatePillLabels();
        }
      }
    });
    
    // Global translation change listener - catch any translation changes
    document.addEventListener('translationChanged', function(event) {
        console.log('Global translation change detected:', event.detail);
        
        // Update the results translation dropdown
        updateResultsTranslationDropdown(event.detail.translation);
        
        // Refresh the current view with the new translation
        setTimeout(() => {
            refreshCurrentView();
        }, 100);
    });

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

    // Initialize the translation dropdown in results section
    initializeResultsTranslationDropdown();
    
    // Initialize the main translation selector - removed since element no longer exists
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
    
    // Also save to session storage for translation changes
    const readingState = {
      book: state.book,
      chapter: state.chapter,
      verse: state.verse,
      timestamp: Date.now()
    };
    sessionStorage.setItem('lastReadingState', JSON.stringify(readingState));
    console.log('Saved reading state to session storage:', readingState);
    
    // Clear the home page flag since user is now reading
    sessionStorage.removeItem('wasOnHomePage');
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
  
  // Update the results translation dropdown
  updateResultsTranslationDropdown(currentTranslation);

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
  // Set the home page flag when clearing state (going home)
  sessionStorage.setItem('wasOnHomePage', 'true');
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

// This function is no longer needed since we show full chapters with verse selection
// function showPrevNextVerseButtons(ref) {
//   const result = document.getElementById("result");
//   const btns = `
//     <div class="flex gap-2 mt-4">
//       <button onclick="prevVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Previous Verse</button> 
//       <button onclick="readFullChapter()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Full Chapter</button>
//       <button onclick="nextVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Next Verse</button>
//     </div>
//   `;
//   result.innerHTML += btns;
// }

















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

  // 4. Now, get the full chapter without verse selection
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

async function getVerseFromRef(book, chapter, verse) {
  console.log('🔍 getVerseFromRef called with:', { book, chapter, verse });
  
  updateMetadata(book, chapter);
  currentBook = book;
  currentChapter = chapter;
  currentVerse = verse;

  // Set form values so translation changes work properly
  const bookSelect = document.getElementById('book');
  const chapterSelect = document.getElementById('chapter');
  const verseSelect = document.getElementById('verse');
  
  if (bookSelect) bookSelect.value = book;
  if (chapterSelect) chapterSelect.value = chapter;
  if (verseSelect) verseSelect.value = verse;
  
  // Update pill labels
  updatePillLabels();
  
  console.log('Form values set in getVerseFromRef:', {
    book: bookSelect ? bookSelect.value : 'N/A',
    chapter: chapterSelect ? chapterSelect.value : 'N/A',
    verse: verseSelect ? verseSelect.value : 'N/A'
  });

  try {
    // Fetch verses from API instead of using empty bibleData
    const response = await fetch(`/api/chapter/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}?translation=${currentTranslation}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const verses = data.verses || [];
    
    console.log('🔍 Found verses:', verses.length);
    console.log('🔍 First few verses:', verses.slice(0, 3));
    
    // Update meta tags for social sharing
    if (verses.length > 0) {
      const selectedVerse = verses.find(v => v.verse === parseInt(verse));
      if (selectedVerse) {
        updateMetaTags(book, chapter, verse, selectedVerse.text);
      } else {
        updateMetaTags(book, chapter, '', '');
      }
      
      // Format all verses in the chapter
      const verseList = verses.map(v => {
        let processedText = formatRedLetterText(v.text);
        processedText = formatTranslatorText(processedText);
        processedText = addTooltipsToVerseText(processedText);
        const finalText = cleanVerseText(processedText);

        // Add a special class to the selected verse for highlighting
        const isSelectedVerse = v.verse === parseInt(verse);
        const selectedClass = isSelectedVerse ? 'verse-selected' : '';

        return `<p class="verse-line p-2 -m-2 rounded-md mb-8 ${selectedClass}" data-verse-ref="${book} ${chapter}:${v.verse}" data-book="${book}" data-chapter="${chapter}" data-verse="${v.verse}"><sup class="font-semibold text-theme-subtle-text mr-1">${v.verse}</sup><span class="verse-text">${finalText}</span></p>`
      }).join("");

      const completeContent = `
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

      // Set the content first, then show the result area - no flicker!
      const result = document.getElementById("result");
      result.innerHTML = completeContent;
      showResultArea();
      
      applySavedHighlights();
      
      // Scroll to the selected verse after a short delay to ensure rendering is complete
      setTimeout(() => {
        const selectedVerseElement = document.querySelector('.verse-selected');
        if (selectedVerseElement) {
          selectedVerseElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    } else {
      const result = document.getElementById("result");
      result.innerHTML = "Chapter not found.";
      showResultArea();
    }
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    const result = document.getElementById("result");
    result.innerHTML = "Error loading chapter. Please try again.";
    showResultArea();
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

async function openVersePicker() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  if (!book || !chapter) return;

  const grid = document.getElementById("verse-grid");
  const title = document.getElementById("verse-picker-title");
  const modal = document.getElementById("verse-picker");

  grid.innerHTML = "Loading...";
  title.textContent = `Select Verse (${book} ${chapter})`;
  modal.classList.remove("hidden");

  try {
    // Fetch verses from API instead of using empty bibleData
    const response = await fetch(`/api/chapter/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}?translation=${currentTranslation}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const verses = data.verses || [];

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
  } catch (error) {
    console.error('Error fetching verses for verse picker:', error);
    grid.innerHTML = "<div class='col-span-7 text-theme-subtle-text'>Error loading verses</div>";
  }
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
  console.log('getChapter called with:', { book, chapter });
  console.log('Current translation:', currentTranslation);
  
  updateMetadata(book, chapter);
  const result = document.getElementById("result");
  
  // Set form values first
  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = 0;
  
  const bookSelect = document.getElementById('book');
  const chapterSelect = document.getElementById('chapter');
  const verseSelect = document.getElementById('verse');
  
  if (bookSelect) bookSelect.value = book;
  if (chapterSelect) chapterSelect.value = chapter;
  if (verseSelect) verseSelect.value = '';
  
  // Update pill labels
  updatePillLabels();
  
  console.log('Form values set:', {
    book: bookSelect ? bookSelect.value : 'N/A',
    chapter: chapterSelect ? chapterSelect.value : 'N/A',
    verse: verseSelect ? verseSelect.value : 'N/A'
  });

  try {
    // SECURITY: Use secure endpoint instead of local data
    const chapterData = await getSecureChapter(book, chapter, currentTranslation);
    
          if (chapterData && chapterData.verses && chapterData.verses.length > 0) {
        // Automatically set verse 1 when chapter loads
        const firstVerse = chapterData.verses[0];
        document.getElementById('verse').value = firstVerse.verse;
        currentVerse = firstVerse.verse;
        
        // Update pill labels to show verse 1
        updatePillLabels();
        
        // Update meta tags for social sharing with verse 1
        updateMetaTags(book, chapter, firstVerse.verse, firstVerse.text);
        
        // Process verses from secure endpoint
        const verseList = chapterData.verses.map(v => {
        let processedText = formatRedLetterText(v.text);
        processedText = formatTranslatorText(processedText);
        processedText = addTooltipsToVerseText(processedText);
        const finalText = cleanVerseText(processedText);

        return `<p class="verse-line p-2 -m-2 rounded-md mb-8" data-verse-ref="${book} ${chapter}:${v.verse}" data-book="${book}" data-chapter="${chapter}" data-verse="${v.verse}"><sup class="font-semibold text-theme-subtle-text mr-1">${v.verse}</sup><span class="verse-text">${finalText}</span></p>`
      }).join("");

      // Prepare the complete content before showing anything
      const completeContent = `
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
      
      // Set the content first, then show the result area - no flicker!
      result.innerHTML = completeContent;
      showResultArea();
      
      applySavedHighlights();
      
    } else {
      result.innerHTML = "Chapter not found.";
      showResultArea();
    }
  } catch (error) {
    console.error("Failed to load chapter:", error);
    result.innerHTML = `Error loading chapter: ${error.message}`;
    showResultArea();
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
    // Reset verse selection when moving to next chapter
    document.getElementById('verse').value = '';
    currentVerse = 0;
    updatePillLabels();
    getChapter(currentBook, newChapter);

  } else if (currentIndex < books.length - 1) {
    const nextBook = books[currentIndex + 1];
    // NEW: Update for the next book and reset chapter to 1
    document.getElementById('book').value = nextBook;
    document.getElementById('chapter').value = 1;
    // Reset verse selection when moving to next book
    document.getElementById('verse').value = '';
    currentVerse = 0;
    updatePillLabels();
    getChapter(nextBook, 1);
    
  } else {
    // You are at the end of the Bible
    return; 
  }
  
  // Clean up URL parameters when navigating chapters
  const params = new URLSearchParams(window.location.search);
  params.delete('verse');
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState({}, '', newUrl);
  
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
  
  // Clean up URL parameters when navigating chapters
  const params = new URLSearchParams(window.location.search);
  params.delete('verse');
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState({}, '', newUrl);
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showResultArea() {
  document.getElementById("welcome-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("topics-wrapper").classList.add("hidden");
  
  // Clear translation sample when showing results
  clearTranslationSample();
  
  // Clear the home page flag since we're now showing results
  sessionStorage.removeItem('wasOnHomePage');
  
  // Don't call loadGenesis1() here - it creates an infinite loop!
  // The calling function (getChapter, getVerseFromRef, etc.) will handle loading content
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
  
  // Reset meta tags to default when going home
  resetMetaTagsToDefault();
  
  // Show translation sample when returning home
  showTranslationSample();
  
  // Refresh topics with current translation when returning home
  loadPublicTopics();
  
  // Mark that we're on the home page
  sessionStorage.setItem('wasOnHomePage', 'true');
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
  if (!query || query.trim() === '') return;
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const result = document.getElementById("result");
  showResultArea();
  document.getElementById('search-close-button').classList.remove('hidden');
  
  // Clear the home page flag since we're now searching
  sessionStorage.removeItem('wasOnHomePage');

  query = query.trim().toLowerCase();
  lastSearchQuery = query;
  const filter = document.querySelector('input[name="filter"]:checked').value;
  const currentBookName = document.getElementById("book").value;

  // Show loading state
  result.innerHTML = `
    <div class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent"></div>
      <p class="mt-2 text-theme-subtle-text">Searching for "${query}"...</p>
    </div>
  `;

  // Search in the current translation
  const currentTranslation = localStorage.getItem('preferredTranslation') || 'kjv';
  
  fetch(`/api/search?q=${encodeURIComponent(query)}&translation=${currentTranslation}&filter=${filter}&book=${encodeURIComponent(currentBookName)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.results && data.results.length > 0) {
        // Add translation info to each result
        const resultsWithTranslation = data.results.map(verse => ({
          ...verse,
          translation: currentTranslation.toUpperCase()
        }));
        displaySearchResults(resultsWithTranslation, query);
      } else {
        displaySearchResults([], query);
      }
    })
    .catch(error => {
      console.error('Search error:', error);
      result.innerHTML = `
        <div class="text-center py-8">
          <h3 class="text-lg font-semibold text-theme-text mb-4">Search Error</h3>
          <p class="text-theme-subtle-text">An error occurred while searching. Please try again.</p>
        </div>
      `;
    });
}

function displaySearchResults(results, query) {
  const result = document.getElementById("result");
  
  if (results.length === 0) {
    result.innerHTML = `
      <div class="text-center py-8">
        <h3 class="text-lg font-semibold text-theme-text mb-4">No Results Found</h3>
        <p class="text-theme-subtle-text">No verses found for "${query}".</p>
        <p class="text-theme-subtle-text mt-2">Try different keywords or check your spelling.</p>
      </div>
    `;
    updateMetaTags(null, null, null, null);
    return;
  }

  // Sort results by relevance (exact matches first, then partial matches)
  const sortedResults = results.sort((a, b) => {
    const aExact = a.text.toLowerCase().includes(query.toLowerCase());
    const bExact = b.text.toLowerCase().includes(query.toLowerCase());
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  // Update meta tags for search results
  const firstResult = sortedResults[0];
  updateMetaTags(firstResult.book_name, firstResult.chapter, firstResult.verse, firstResult.text);

  // Render results
  const rendered = sortedResults.map(verse => {
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = verse.text.replace(regex, '<mark>$1</mark>');
    return `
      <div class="mb-4 p-4 border border-theme-border rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-medium text-theme-accent">${verse.book_name} ${verse.chapter}:${verse.verse}</p>
          <span class="text-xs text-theme-subtle-text bg-theme-border px-2 py-1 rounded">${verse.translation}</span>
        </div>
        <p class="text-base leading-relaxed text-theme-text">${highlighted}</p>
      </div>
    `;
  }).join("");

  result.innerHTML = `
    <div class="relative pb-2 mb-4 border-b border-theme-border">
      <h2 class="text-xl font-bold text-theme-text">Search Results</h2>
      <p class="text-sm text-theme-subtle-text">${results.length} verses found for "${query}"</p>
    </div>
    <div class="space-y-2">${rendered}</div>
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

  // Helper function to fetch verse content from API
  async function fetchVerseContent(book, chapter, verse) {
    try {
      const response = await fetch(`/api/verse/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}/${encodeURIComponent(verse)}?translation=${currentTranslation}`);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.text || "(verse not found)";
    } catch (error) {
      console.error(`Error fetching verse ${book} ${chapter}:${verse}:`, error);
      return "(verse not found)";
    }
  }

  // Helper function to fetch verse range content from API
  async function fetchVerseRangeContent(book, chapter, startVerse, endVerse) {
    try {
      let allVersesText = "";
      for (let verse = parseInt(startVerse); verse <= parseInt(endVerse); verse++) {
        const response = await fetch(`/api/verse/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}/${encodeURIComponent(verse)}?translation=${currentTranslation}`);
        if (response.ok) {
          const data = await response.json();
          const verseText = data.text || "";
          allVersesText += (allVersesText ? " " : "") + verseText;
        }
        // Add a small delay between API calls to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return allVersesText || "(verses not found)";
    } catch (error) {
      console.error(`Error fetching verse range ${book} ${chapter}:${startVerse}-${endVerse}:`, error);
      return "(verses not found)";
    }
  }

  // Show topics immediately with loading placeholders, then fetch content asynchronously
  for (let index = 0; index < topics.length; index++) {
    const topic = topics[index];
    console.log(`Processing topic ${index + 1}:`, topic.title, "ID:", topic.id);
    
    const topicVerses = verses.filter(v => v.topic_id === topic.id);
    const topicSubtopics = subtopics?.filter(s => s.topic_id === topic.id) || [];
    
    // Show topic immediately with loading state
    const topicHTML = `
      <div class="rounded p-4 bg-theme-surface">
        <button onclick="toggleTopic('${topic.id}')" class="text-lg font-semibold text-left w-full text-theme-text hover:text-theme-accent flex justify-between items-center">
          <span>${topic.title}</span>
          <span id="toggle-icon-${topic.id}" class="text-xl">+</span>
        </button>
        <div id="topic-${topic.id}" class="ml-4 mt-2 text-sm text-theme-subtle-text hidden overflow-hidden transition-all duration-300 ease-in-out">
          <div class="text-theme-subtle-text italic">Loading verses...</div>
        </div>
      </div>
    `;
    
    container.innerHTML += topicHTML;
  }
  
  // Now fetch all verse content asynchronously and update topics
  await loadAllTopicContent(topics, verses, subtopics);
}

// Efficient function to load all topic content asynchronously
async function loadAllTopicContent(topics, verses, subtopics) {
  console.log("🚀 Starting efficient topic content loading...");
  
  // Create a cache for verse content to avoid duplicate API calls
  const verseCache = new Map();
  
  // Helper function to get cached verse content or fetch it
  async function getVerseContent(book, chapter, verse) {
    const cacheKey = `${book}-${chapter}-${verse}`;
    if (verseCache.has(cacheKey)) {
      return verseCache.get(cacheKey);
    }
    
    try {
      const response = await fetch(`/api/verse/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}/${encodeURIComponent(verse)}?translation=${currentTranslation}`);
      if (response.ok) {
        const data = await response.json();
        const text = data.text || "(verse not found)";
        verseCache.set(cacheKey, text);
        return text;
      } else {
        const errorText = "(verse not found)";
        verseCache.set(cacheKey, errorText);
        return errorText;
      }
    } catch (error) {
      console.error(`Error fetching verse ${book} ${chapter}:${verse}:`, error);
      const errorText = "(verse not found)";
      verseCache.set(cacheKey, errorText);
      return errorText;
    }
  }
  
  // Helper function to get verse range content efficiently
  async function getVerseRangeContent(book, chapter, startVerse, endVerse) {
    const cacheKey = `${book}-${chapter}-${startVerse}-${endVerse}`;
    if (verseCache.has(cacheKey)) {
      return verseCache.get(cacheKey);
    }
    
    try {
      let allVersesText = "";
      const versePromises = [];
      
      // Fetch all verses in the range concurrently
      for (let verse = parseInt(startVerse); verse <= parseInt(endVerse); verse++) {
        versePromises.push(getVerseContent(book, chapter, verse));
      }
      
      const verseTexts = await Promise.all(versePromises);
      allVersesText = verseTexts.join(" ");
      
      verseCache.set(cacheKey, allVersesText);
      return allVersesText;
    } catch (error) {
      console.error(`Error fetching verse range ${book} ${chapter}:${startVerse}-${endVerse}:`, error);
      const errorText = "(verses not found)";
      verseCache.set(cacheKey, errorText);
      return errorText;
    }
  }
  
  // Process all topics concurrently for better performance
  const topicPromises = topics.map(async (topic) => {
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
    let verseList = "";
    for (const subtopic of topicSubtopics) {
      const subtopicName = subtopic.title;
      const subtopicVerses = grouped[subtopicName] || [];
      const items = [];
      
      for (const v of subtopicVerses) {
        // Check if this is a verse range
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${startVerse}-${endVerse}`;
          
          // For ranges, fetch all verses in the range efficiently
          const allVersesText = await getVerseRangeContent(v.book, v.chapter, startVerse, endVerse);
          items.push(`<li><strong>${verseRef}</strong> – ${allVersesText}</li>`);
        } else {
          // For single verses, fetch from cache or API
          const verseText = await getVerseContent(v.book, v.chapter, v.verse);
          const cleanText = verseText.replace(/[¶\[\]‹›]/g, '').trim();
          items.push(`<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${cleanText}</li>`);
        }
      }
      
      verseList += `<h4 class="mt-4 font-semibold text-lg text-theme-text">${subtopicName}</h4><ul class="list-disc pl-5">${items.join("")}</ul>`;
    }
    
    // Add any misc verses that don't belong to a subtopic
    if (grouped["Misc"] && grouped["Misc"].length > 0) {
      const miscItems = [];
      for (const v of grouped["Misc"]) {
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${startVerse}-${endVerse}`;
          
          const allVersesText = await getVerseRangeContent(v.book, v.chapter, startVerse, endVerse);
          miscItems.push(`<li><strong>${verseRef}</strong> – ${allVersesText}</li>`);
        } else {
          const verseText = await getVerseContent(v.book, v.chapter, v.verse);
          const cleanText = verseText.replace(/[¶\[\]‹›]/g, '').trim();
          miscItems.push(`<li><strong>${v.book} ${v.chapter}:${v.verse}</strong> – ${cleanText}</li>`);
        }
      }
      
      verseList += `<ul class="list-disc pl-5">${miscItems.join("")}</ul>`;
    }
    
    return { topicId: topic.id, verseList };
  });
  
  // Wait for all topics to complete and update the UI
  const results = await Promise.all(topicPromises);
  
  // Update each topic with its content
  for (const result of results) {
    const topicElement = document.getElementById(`topic-${result.topicId}`);
    if (topicElement) {
      topicElement.innerHTML = result.verseList;
    }
  }
  
  console.log("✅ All topic content loaded efficiently!");
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
  // Removed duplicate loadPublicTopics() call to prevent duplicate topics
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

// Initialize theme toggle icons based on current theme
function initializeThemeIcons() {
    const sunIcon = document.getElementById('theme-toggle-sun-icon');
    const moonIcon = document.getElementById('theme-toggle-moon-icon');
    
    if (sunIcon && moonIcon) {
        if (localStorage.getItem('color-theme') === 'dark' || 
            (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }
}

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

    let selectedVerses = new Set(); // Track multiple selected verses
    window.selectedVerses = selectedVerses; // Make it globally accessible for URL handling

    const showMenu = () => {
        selectionMenu.classList.remove('hidden');
        
        // Scroll the last clicked verse into view if it's near the bottom
        // Use a small delay to ensure menu is rendered and we can get its height
        setTimeout(() => {
            if (selectedVerses.size > 0) {
                const lastClickedVerse = Array.from(selectedVerses).slice(-1)[0]; // Get the most recently added verse
                if (lastClickedVerse) {
                    const menuHeight = selectionMenu.offsetHeight || 150;
                    const verseRect = lastClickedVerse.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    
                    // Check if the verse is too close to the bottom where the menu would cover it
                    if (verseRect.bottom > (windowHeight - menuHeight - 50)) { // 50px buffer
                        const scrollAmount = verseRect.bottom - (windowHeight - menuHeight) + 100; // Extra space
                        window.scrollBy({ 
                            top: scrollAmount, 
                            behavior: 'smooth' 
                        });
                    }
                }
            }
        }, 10); // Small delay to ensure menu is rendered
    };

    const updateMenuContent = () => {
        if (selectedVerses.size === 0) return;
        
        if (selectedVerses.size === 1) {
            // Single verse selection
            const verse = Array.from(selectedVerses)[0];
            selectedRef.textContent = verse.dataset.verseRef;
        } else {
            // Multiple verse selection
            const verses = Array.from(selectedVerses).map(verse => verse.dataset.verseRef);
            selectedRef.textContent = `${verses.length} verses selected`;
        }
        
        // Check if any selected verse has highlights
        const hasHighlights = Array.from(selectedVerses).some(verse => {
            const textSpan = verse.querySelector('.verse-text');
            return textSpan && Array.from(textSpan.classList).some(c => c.startsWith('highlight-'));
        });
        removeHighlightButton.classList.toggle('hidden', !hasHighlights);
    };

    const hideMenu = () => {
        selectionMenu.classList.add('hidden');
        // Remove menu-selected class from all verses when hiding menu
        const menuSelectedVerses = document.querySelectorAll('.verse-line.menu-selected');
        menuSelectedVerses.forEach(verse => {
            verse.classList.remove('menu-selected');
        });
        selectedVerses.clear(); // Clear selected verses
        // Don't remove verse-selected class here as it's used for the full chapter view
        // The verse-selected class will be managed by the getVerseFromRef function
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
            const isMenuSelected = clickedVerse.classList.contains('menu-selected');

            // Toggle selection: if already selected, deselect it
            if (isMenuSelected) {
                clickedVerse.classList.remove('menu-selected');
                selectedVerses.delete(clickedVerse);
            } else {
                // Add to selection
                clickedVerse.classList.add('menu-selected');
                selectedVerses.add(clickedVerse);
            }

            // Show menu if we have any selections
            if (selectedVerses.size > 0) {
                showMenu();
                updateMenuContent();
            } else {
                hideMenu();
            }

        } else {
            // Case 3: The user clicked anywhere else (not a verse, not the menu)
            hideMenu();
        }
    });
    
    // --- Button Actions (These are unchanged) ---

    highlightColorButtons.addEventListener('click', (e) => {
        if (e.target.dataset.color && selectedVerses.size > 0) {
            const color = e.target.dataset.color;
            const highlights = getSavedHighlights();
            
            selectedVerses.forEach(verse => {
                const textSpan = verse.querySelector('.verse-text');
                if (!textSpan) return;
                textSpan.classList.remove('highlight-yellow', 'highlight-blue', 'highlight-green', 'highlight-pink');
                textSpan.classList.add(`highlight-${color}`);
                const verseRef = verse.dataset.verseRef;
                highlights[verseRef] = color;
            });
            
            saveHighlights(highlights);
            hideMenu(); // Hide menu after highlighting
        }
    });

    removeHighlightButton.addEventListener('click', () => {
        if (selectedVerses.size > 0) {
            const highlights = getSavedHighlights();
            
            selectedVerses.forEach(verse => {
                const textSpan = verse.querySelector('.verse-text');
                if (textSpan) {
                    textSpan.classList.remove('highlight-yellow', 'highlight-blue', 'highlight-green', 'highlight-pink');
                    const verseRef = verse.dataset.verseRef;
                    delete highlights[verseRef];
                }
            });
            
            saveHighlights(highlights);
            hideMenu(); 
        }
    });

    copyButton.addEventListener('click', () => {
        if (selectedVerses.size === 0) return;
        
        let textToCopy = '';
        let shareUrl = '';
        
        if (selectedVerses.size === 1) {
            // Single verse - use existing format
            const verse = Array.from(selectedVerses)[0];
            // Use the displayed verse text instead of trying to access empty bibleData
            let verseText = verse.querySelector('.verse-text').textContent;
            // Remove unwanted symbols for copy
            verseText = verseText.replace(/[¶\[\]‹›]/g, '').trim();
            const verseRef = verse.dataset.verseRef;
            const book = verse.dataset.book;
            const chapter = verse.dataset.chapter;
            const verseNum = verse.dataset.verse;
            const urlParams = new URLSearchParams({ book, chapter, verse: verseNum });
            shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
            textToCopy = `"${verseText}"\n- ${verseRef}\n\n${shareUrl}`;
        } else {
            // Multiple verses - create a combined format
            const verses = Array.from(selectedVerses).map(verse => {
                const book = verse.dataset.book;
                const chapter = parseInt(verse.dataset.chapter);
                const verseNum = parseInt(verse.dataset.verse);
                // Use the displayed verse text instead of trying to access empty bibleData
                let cleanOriginalText = verse.querySelector('.verse-text').textContent;
                // Remove unwanted symbols for copy
                cleanOriginalText = cleanOriginalText.replace(/[¶\[\]‹›]/g, '').trim();
                return `${verse.dataset.verseRef}: "${cleanOriginalText}"`;
            });
            
            const firstVerse = Array.from(selectedVerses)[0];
            const book = firstVerse.dataset.book;
            const chapter = parseInt(firstVerse.dataset.chapter);
            
            // Create URL with all selected verses
            const urlParams = new URLSearchParams({ book, chapter });
            const selectedVerseNumbers = Array.from(selectedVerses).map(verse => verse.dataset.verse).join(',');
            urlParams.set('verses', selectedVerseNumbers);
            shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
            
            textToCopy = verses.join('\n\n') + `\n\n${shareUrl}`;
        }
        
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
    if (selectedVerses.size === 0) return;
    
    let shareText = '';
    let shareUrl = '';
    
    if (selectedVerses.size === 1) {
        // Single verse - use existing format
        const verse = Array.from(selectedVerses)[0];
        let verseText = verse.querySelector('.verse-text').textContent;
        // Remove unwanted symbols for share
        verseText = verseText.replace(/[¶\[\]‹›]/g, '').trim();
        const verseRef = verse.dataset.verseRef;
        const book = verse.dataset.book;
        const chapter = verse.dataset.chapter;
        const verseNum = verse.dataset.verse;
        const urlParams = new URLSearchParams({ book, chapter, verse: verseNum });
        shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
        shareText = `"${verseText}" - ${verseRef}\n${shareUrl}`;
    } else {
        // Multiple verses - create a combined format
        const verses = Array.from(selectedVerses).map(verse => {
            let verseText = verse.querySelector('.verse-text').textContent;
            // Remove unwanted symbols for share
            verseText = verseText.replace(/[¶\[\]‹›]/g, '').trim();
            return `${verse.dataset.verseRef}: "${verseText}"`;
        });
        
        const firstVerse = Array.from(selectedVerses)[0];
        const book = firstVerse.dataset.book;
        const chapter = parseInt(firstVerse.dataset.chapter);
        
        // Create URL with all selected verses
        const urlParams = new URLSearchParams({ book, chapter });
        const selectedVerseNumbers = Array.from(selectedVerses).map(verse => verse.dataset.verse).join(',');
        urlParams.set('verses', selectedVerseNumbers);
        shareUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
        
        shareText = verses.join('\n\n') + `\n\n${shareUrl}`;
    }
    
    if (navigator.share) {
        navigator.share({
            text: shareText, 
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
        // Return to the previous reading position
        const lastReadingState = sessionStorage.getItem('lastReadingState');
        if (lastReadingState) {
            try {
                const readingState = JSON.parse(lastReadingState);
                console.log('🔄 Returning to previous reading position:', readingState);
                
                // Set the form values to the previous reading position
                document.getElementById('book').value = readingState.book || '';
                document.getElementById('chapter').value = readingState.chapter || '';
                document.getElementById('verse').value = readingState.verse || '';
                
                // Update the pill labels
                updatePillLabels();
                
                // Load the chapter or verse that was being read
                if (readingState.verse) {
                    getVerseFromRef(readingState.book, readingState.chapter, readingState.verse);
                } else {
                    getChapter(readingState.book, readingState.chapter);
                }
                
                // Show the result area
                showResultArea();
                
            } catch (error) {
                console.error('Error restoring reading state:', error);
                // Fallback to restoreState if there's an error
                restoreState();
            }
        } else {
            // Fallback to restoreState if no reading state is saved
            restoreState();
        }
    } else {
        // If search started from home, go back to home
        goHome();
    }
    
    // Clean up the search origin flag
    sessionStorage.removeItem('searchOrigin');
    
    // Hide the search close button
    document.getElementById('search-close-button').classList.add('hidden');
    
    // Clear the search results area
    const result = document.getElementById("result");
    if (result) {
        result.innerHTML = `
            <div class="text-center py-8">
                <h2 class="text-xl font-bold text-theme-text">Bible Reading</h2>
                <p class="text-theme-subtle-text mt-2">Select a book, chapter, and verse to begin reading.</p>
            </div>
        `;
    }
}








// Add this entire new function to script.js

function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const book = urlParams.get('book');
  const chapter = urlParams.get('chapter');
  const verse = urlParams.get('verse');
  
  if (book && chapter) {
    console.log('🔗 URL parameters detected:', { book, chapter, verse });
    
    // Find the proper capitalized book name from the books array
    const properBookName = books.find(b => b.toLowerCase() === book.toLowerCase());
    if (!properBookName) {
      console.error('❌ Book not found in books array:', book);
      return false;
    }
    
    console.log('🔗 Using proper book name:', { original: book, proper: properBookName });
    
    // Set the input values with proper capitalization
    document.getElementById('book').value = properBookName;
    document.getElementById('chapter').value = chapter;
    if (verse) {
      document.getElementById('verse').value = verse;
    }
    
    // Update pill labels
    updatePillLabels();
    
    // Load the verse or chapter with proper book name
    if (verse) {
      getVerseFromRef(properBookName, chapter, verse);
    } else {
      getChapter(properBookName, chapter);
    }
    
    return true; // URL was handled
  }
  
  return false; // No URL parameters
}






function getDailyVerse() {
  const today = new Date().toISOString().split("T")[0]; // "2025-07-26"
  const saved = JSON.parse(localStorage.getItem("dailyDevotion")) || {};

  if (saved.date === today && saved.verse) {
    return saved.verse;
  }

  // Use a default verse since we're not loading Bible data locally
  const defaultVerse = {
    date: today,
    verse: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
  };

  localStorage.setItem("dailyDevotion", JSON.stringify(defaultVerse));
  return defaultVerse;
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
    // Use generic description instead of trying to access empty bibleData
    const descriptionContent = `Read ${book} chapter ${chapter} from the Bible on The Living Word Online.`;

    // Update the page title
    document.title = `${book} ${chapter} | The Living Word Online`;

    // Find and update the meta description tag
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        descriptionTag.setAttribute('content', descriptionContent);
    }
}

// Function to update Open Graph meta tags for social sharing
function updateMetaTags(book, chapter, verse, verseText) {
  console.log('🔍 updateMetaTags called with:', { book, chapter, verse, verseText: verseText ? verseText.substring(0, 50) + '...' : 'null' });
  
  // Add null checks to prevent errors
  if (!book || !chapter) {
    console.log('updateMetaTags: Missing book or chapter, skipping meta tag update');
    return;
  }
  
  const currentUrl = window.location.href;
  const cleanedText = verseText ? cleanVerseText(verseText) : '';
  
  // Create a meaningful title
  let title = `The Living Word Online`;
  if (book && chapter) {
    title = `${book} ${chapter}`;
    if (verse) {
      title += `:${verse}`;
    }
  }
  
  // Create a description with the verse text
  let description = 'Search, read, and reflect on verses from the Bible.';
  if (cleanedText) {
    // Truncate verse text to fit in meta description (around 160 characters)
    const maxLength = 140;
    if (cleanedText.length > maxLength) {
      description = cleanedText.substring(0, maxLength).trim() + '...';
    } else {
      description = cleanedText;
    }
  }
  
  // Update page title
  document.title = title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
  
  // Create the verse-specific URL for sharing - use current origin to avoid domain mismatch
  const currentOrigin = window.location.origin;
  const verseUrl = `${currentOrigin}/${book.toLowerCase()}/${chapter}${verse ? `/${verse}` : ''}`;
  
  // Update Open Graph tags with verse-specific URL
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  
  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogUrl) ogUrl.setAttribute('content', verseUrl);
  
  // Update Twitter Card tags with verse-specific URL
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  const twitterUrl = document.querySelector('meta[property="twitter:url"]');
  
  if (twitterTitle) twitterTitle.setAttribute('content', title);
  if (twitterDescription) twitterDescription.setAttribute('content', description);
  if (twitterUrl) twitterUrl.setAttribute('content', verseUrl);
  
  // Update canonical URL to verse-specific URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', verseUrl);
  }
  
  // Update the browser URL to the verse-specific route for sharing
  if (window.history && window.history.pushState) {
    window.history.pushState({}, title, verseUrl);
  }
}

// Function to reset meta tags to default values
function resetMetaTagsToDefault() {
  const defaultTitle = 'The Living Word Online - Bible Study & Scripture Search';
  const defaultDescription = 'Search, read, and reflect on verses from the Bible. Access to 6 different Bible translations including KJV, ASV, RVG, and more.';
  const defaultUrl = window.location.origin;
  
  // Update page title
  document.title = defaultTitle;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', defaultDescription);
  }
  
  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  
  if (ogTitle) ogTitle.setAttribute('content', defaultTitle);
  if (ogDescription) ogDescription.setAttribute('content', defaultDescription);
  if (ogUrl) ogUrl.setAttribute('content', defaultUrl);
  
  // Update Twitter Card tags
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  const twitterUrl = document.querySelector('meta[property="twitter:url"]');
  
  if (twitterTitle) twitterTitle.setAttribute('content', defaultTitle);
  if (twitterDescription) twitterDescription.setAttribute('content', defaultDescription);
  if (twitterUrl) twitterUrl.setAttribute('content', defaultUrl);
  
  // Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', defaultUrl);
  }
  
  // Reset browser URL to home
  if (window.history && window.history.pushState) {
    window.history.pushState({}, defaultTitle, '/');
  }
}

// Initialize the translation dropdown in results section
function initializeResultsTranslationDropdown() {
  const dropdown = document.getElementById('translation-dropdown-results');
  if (dropdown) {
    // Set the current translation
    dropdown.value = currentTranslation;
    
    // Add change event listener
    dropdown.addEventListener('change', function() {
      const newTranslation = this.value;
      console.log('Results dropdown translation changed to:', newTranslation);
      
      // Update the global translation
      currentTranslation = newTranslation;
      localStorage.setItem('preferredTranslation', newTranslation);
      
      // Update the main translation selector if it exists - removed since element no longer exists
      
      // Trigger translation change event
      document.dispatchEvent(new CustomEvent('translationChanged', {
        detail: { translation: newTranslation, verseCount: 0 }
      }));
    });
  }
}

// Update the results translation dropdown value
function updateResultsTranslationDropdown(translation) {
  const dropdown = document.getElementById('translation-dropdown-results');
  if (dropdown) {
    dropdown.value = translation;
  }
}












