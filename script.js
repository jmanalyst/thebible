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

let currentBook = "";
let currentChapter = 0;

// === DROPDOWN ===
function filterDropdown() {
  const input = document.getElementById("book").value.toLowerCase();
  const dropdown = document.getElementById("custom-dropdown");
  dropdown.innerHTML = "";

  const matches = books.filter(book => book.toLowerCase().startsWith(input));
  matches.forEach(book => {
    const li = document.createElement("li");
    li.textContent = book;
    li.className = "px-2 py-1 hover:bg-gray-100 cursor-pointer";
    li.onclick = () => selectBookFromDropdown(book);
    dropdown.appendChild(li);
  });

  if (matches.length) dropdown.classList.add("active");
  else dropdown.classList.remove("active");
}

function showDropdown() {
  const input = document.getElementById("book").value.trim().toLowerCase();
  const dropdown = document.getElementById("custom-dropdown");
  dropdown.innerHTML = "";

  const matches = books.filter(book => input ? book.toLowerCase().startsWith(input) : true);
  matches.forEach(book => {
    const li = document.createElement("li");
    li.textContent = book;
    li.className = "px-2 py-1 hover:bg-gray-100 cursor-pointer";
    li.onclick = () => selectBookFromDropdown(book);
    dropdown.appendChild(li);
  });

  if (matches.length) dropdown.classList.add("active");
  else dropdown.classList.remove("active");
}

function handleDropdownKeys(e) {
  if (e.key === "Tab") {
    const input = document.getElementById("book");
    const match = books.find(book => book.toLowerCase().startsWith(input.value.toLowerCase()));
    if (match) {
      e.preventDefault();
      input.value = match;
      toggleClearButton();
      document.getElementById("custom-dropdown").classList.remove("active");
      document.getElementById("chapter").focus();
    }
  }
}

function selectBookFromDropdown(book) {
  const bookInput = document.getElementById("book");
  bookInput.value = book;
  document.getElementById("custom-dropdown").classList.remove("active");
  document.getElementById("chapter").focus();
  toggleClearButton();
}

function toggleClearButton() {
  const clearBtn = document.getElementById("clearBtn");
  const bookInput = document.getElementById("book");
  clearBtn.classList.toggle("hidden", bookInput.value.trim() === "");
}

function clearBook() {
  const bookInput = document.getElementById("book");
  const chapterInput = document.getElementById("chapter");
  const verseInput = document.getElementById("verse");

  bookInput.value = "";
  chapterInput.value = "";
  verseInput.value = "";

  toggleClearButton();
  showDropdown();
  bookInput.focus();
}

document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("custom-dropdown");
  const bookInput = document.getElementById("book");
  if (!dropdown.contains(e.target) && e.target !== bookInput) {
    dropdown.classList.remove("active");
  }
});

// === MAIN VERSE FUNCTIONALITY ===
function submitOnEnter(e) {
  if (e.key === "Enter") getVerse();
}

async function getVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();
  const result = document.getElementById("result");

  result.innerHTML = "Loading...";
  window.showResultArea?.(); // Show scripture, hide welcome

  if (!book || !chapter) {
    result.innerHTML = "Please enter both book and chapter.";
    return;
  }

  try {
    if (verse === "") {
      await getChapter(book, chapter);
    } else {
      const res = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}?translation=kjv`);
      const data = await res.json();

      if (data.text) {
        result.innerHTML = `
          <p class="font-semibold text-xl mb-2">"${data.text.trim()}"</p>
          <p class="text-sm text-gray-500">– ${data.reference}</p>
        `;
      } else {
        result.innerHTML = "Verse not found.";
      }
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = "Error fetching verse.";
  }
}

async function getChapter(book, chapter) {
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  window.showResultArea?.(); // Show scripture, hide welcome

  currentBook = book;
  currentChapter = parseInt(chapter);

  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
    const data = await res.json();

    if (data.verses) {
      const verses = data.verses.map(v => `<strong>${v.verse}</strong>. ${v.text.trim()}`).join("\n\n");
      result.innerHTML = `
        <h2 class="text-xl font-bold mb-4">${data.reference}</h2>
        <pre class="whitespace-pre-wrap font-sans text-base leading-relaxed">${verses}</pre>
        <div class="flex justify-between items-center mt-4">
          <button onclick="prevChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100"${currentChapter === 1 ? ' disabled' : ''}>⏮️ Previous</button>
          <button onclick="nextChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100">Next ⏭️</button>
        </div>
      `;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

// === SPEECH RECOGNITION ===
function startListening() {
  const micBtn = document.getElementById("micBtn");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    recognition.stop();
    const transcript = event.results[0][0].transcript.toLowerCase();
    const match = transcript.match(/([a-z0-9 ]+) chapter (\d+)/i);
    if (match) {
      const book = match[1];
      const chapter = match[2];
      document.getElementById("book").value = book;
      document.getElementById("chapter").value = chapter;
      document.getElementById("verse").value = "";
      toggleClearButton();
      getChapter(book, chapter);
    } else {
      document.getElementById("result").innerHTML = "Could not understand. Try saying 'John chapter 1'";
    }
  };

  recognition.onerror = (err) => {
    recognition.stop();
    console.error("Speech error:", err);
    document.getElementById("result").innerHTML = "Error with speech recognition.";
  };

  recognition.start();
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("custom-dropdown");
  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = book;
    li.className = "px-2 py-1 hover:bg-gray-100 cursor-pointer";
    li.onclick = () => selectBookFromDropdown(book);
    dropdown.appendChild(li);
  });

  toggleClearButton();
});
