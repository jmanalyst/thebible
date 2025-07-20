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
  "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joe",
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
      <button onclick="prevVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">⏮️ Previous</button>
      <button onclick="readFullChapter()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">📖 Full</button>
      <button onclick="nextVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Next ⏭️</button>
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

async function getVerseFromRef(book, chapter, verse) {
  currentBook = book;
  currentChapter = chapter;
  currentVerse = verse;

  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}?translation=kjv`);
    const data = await res.json();
    if (data.text) {
      result.innerHTML = `
        <p class="font-semibold text-xl mb-2">"${data.text.trim()}"</p>
        <p class="text-sm text-gray-500">– ${data.reference}</p>
      `;
      showPrevNextVerseButtons(data.reference);
    } else {
      result.innerHTML = "Verse not found.";
    }
  } catch (err) {
    result.innerHTML = "Error fetching verse.";
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

  fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`)
    .then(res => res.json())
    .then(data => {
      if (!data.verses || data.verses.length === 0) {
        grid.innerHTML = "<div class='col-span-6 text-gray-500'>No verses found</div>";
        return;
      }

      grid.innerHTML = "";
      data.verses.forEach((v, i) => {
        const btn = document.createElement("button");
        btn.textContent = v.verse;
        btn.className = "bg-gray-100 hover:bg-green-200 rounded px-2 py-1";
        btn.onclick = () => {
  document.getElementById("verse").value = v.verse;
  closeVersePicker();
  maybeAutoFetch();
        

  const bookVal = document.getElementById("book").value.trim();
  const chapterVal = document.getElementById("chapter").value.trim();
  const verseVal = v.verse;

  if (bookVal && chapterVal && verseVal) {
    getVerseFromRef(bookVal, parseInt(chapterVal), parseInt(verseVal));
  }
};




        grid.appendChild(btn);
      });
    })
    .catch(err => {
      console.error("Error loading verses:", err);
      grid.innerHTML = "<div class='col-span-6 text-red-500'>Error loading verses</div>";
    });
}

function closeVersePicker() {
  document.getElementById("verse-picker").classList.add("hidden");
  
}

// Attach openVersePicker on verse field click
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("verse").addEventListener("click", openVersePicker);
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

  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
    const data = await res.json();

    if (data.verses && data.verses.length > 0) {
      const verses = data.verses.map(v => `<strong>${v.verse}</strong>. ${v.text.trim()}`).join("\n\n");

      result.innerHTML = `
        <h2 class="text-xl font-bold mb-4">${data.reference}</h2>
        <pre class="whitespace-pre-wrap font-sans text-base leading-relaxed">${verses}</pre>
        <div class="flex justify-between items-center mt-4">
          <button onclick="prevChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100"${currentChapter === 1 ? ' disabled' : ''}>⏮️ Previous</button>
          <button onclick="nextChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100">Next ⏭️</button>
        </div>
      `;
    } else {
      result.innerHTML = "Chapter not found.";
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = "Error fetching chapter.";
  }
}



function nextChapter() {
  getChapter(currentBook, currentChapter + 1);
}

function prevChapter() {
  if (currentChapter > 1) {
    getChapter(currentBook, currentChapter - 1);
  }
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