
const bibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes",
  "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter",
  "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

let currentSuggestions = [];
let selectedIndex = -1;

window.addEventListener("DOMContentLoaded", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const micBtn = document.getElementById("micBtn");
    if (micBtn) {
      micBtn.style.display = "none"; // Reliable mic button hiding
    }
  }

  const params = new URLSearchParams(window.location.search);
  const book = params.get("book");
  const chapter = params.get("chapter");
  const verse = params.get("verse");

  if (book && chapter) {
    document.getElementById("book").value = book;
    document.getElementById("chapter").value = chapter;
    if (verse) document.getElementById("verse").value = verse;
    getVerse();
  }
});

async function getVerse() {
  const book = document.getElementById('book').value.trim();
  const chapter = document.getElementById('chapter').value.trim();
  const verse = document.getElementById('verse').value.trim();
  const result = document.getElementById('result');

  document.getElementById('book').blur();
  document.getElementById('chapter').blur();
  document.getElementById('verse').blur();
  setTimeout(() => document.activeElement.blur(), 0); // Zoom fix

  result.innerHTML = "Loading...";

  if (!book || !chapter) {
    result.innerHTML = "Please enter both book and chapter.";
    return;
  }

  const query = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  try {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);
    const data = await res.json();

    if (data.verses) {
      const formatted = data.verses
        .map(v => `<strong>${v.verse}.</strong> ${v.text.trim()}`)
        .join("<br><br>");

      result.innerHTML = `
        <h2 class="text-xl font-bold mb-4">${data.reference} (KJV)</h2>
        <div class="text-[16px] leading-relaxed font-sans">${formatted}</div>
      `;
    } else {
      result.innerHTML = "Scripture not found.";
    }
  } catch (err) {
    result.innerHTML = "Error fetching scripture.";
    console.error(err);
  }
}

function submitOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    getVerse();
  }
}

function showSuggestions() {
  const input = document.getElementById("book");
  const list = document.getElementById("suggestions");
  const value = input.value.trim().toLowerCase();

  if (!value) {
    list.classList.add("hidden");
    return;
  }

  currentSuggestions = bibleBooks.filter(book =>
    book.toLowerCase().startsWith(value)
  ).slice(0, 5);

  if (currentSuggestions.length === 0) {
    list.classList.add("hidden");
    return;
  }

  list.innerHTML = currentSuggestions.map((book, idx) =>
    `<li class="px-4 py-2 hover:bg-blue-100 cursor-pointer" onclick="selectBook(${idx})">${book}</li>`
  ).join("");

  list.classList.remove("hidden");
  selectedIndex = -1;
}

function selectBook(index) {
  const bookInput = document.getElementById("book");
  const chapterInput = document.getElementById("chapter");

  bookInput.value = currentSuggestions[index];
  document.getElementById("suggestions").classList.add("hidden");
  selectedIndex = -1;

  setTimeout(() => {
    chapterInput.focus();
  }, 0);
}

function autocompleteBook(event) {
  if (event.key === "Tab" && currentSuggestions.length > 0) {
    event.preventDefault();
    selectBook(0);
  }

  if (event.key === "ArrowDown" && currentSuggestions.length > 0) {
    event.preventDefault();
    selectedIndex = (selectedIndex + 1) % currentSuggestions.length;
    highlightSuggestion();
  }

  if (event.key === "ArrowUp" && currentSuggestions.length > 0) {
    event.preventDefault();
    selectedIndex = (selectedIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
    highlightSuggestion();
  }

  if (event.key === "Enter" && selectedIndex >= 0) {
    event.preventDefault();
    selectBook(selectedIndex);
  }
}

function highlightSuggestion() {
  const list = document.getElementById("suggestions").children;
  Array.from(list).forEach((el, i) => {
    el.classList.toggle("bg-blue-100", i === selectedIndex);
  });
}

function capitalize(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    recognition.stop();
    const transcript = event.results[0][0].transcript.toLowerCase();
    const match = transcript.match(/([a-z\s]+)\s+chapter\s+(\d+)/i);

    if (match) {
      const book = capitalize(match[1].trim());
      const chapter = match[2];
      document.getElementById("book").value = book;
      document.getElementById("chapter").value = chapter;
      document.getElementById("verse").value = "";

      document.getElementById('book').blur();
      document.getElementById('chapter').blur();
      document.getElementById('verse').blur();
      setTimeout(() => document.activeElement.blur(), 0);

      getVerse();
    } else {
      document.getElementById("result").innerHTML = "Try saying: 'John chapter 3'";
    }
  };

  recognition.onerror = (err) => {
    recognition.stop();
    console.error("Speech error:", err);
    document.getElementById("result").innerHTML = "Speech recognition error.";
  };

  recognition.start();
}


function showDropdown() {
  const list = document.getElementById("custom-dropdown");
  list.classList.add("active");
  filterDropdown();
}

function hideDropdown() {
  const list = document.getElementById("custom-dropdown");
  list.classList.remove("active");
}

function populateDropdown(books) {
  const list = document.getElementById("custom-dropdown");
  list.innerHTML = books.map((book, i) =>
    `<li onclick="selectBookFromDropdown('${book}')" class="px-4 py-2 hover:bg-blue-100 cursor-pointer">${book}</li>`
  ).join("");
}

function filterDropdown() {
  const value = document.getElementById("book").value.trim().toLowerCase();
  const filtered = bibleBooks.filter(b => b.toLowerCase().startsWith(value));
  populateDropdown(filtered);

  const dropdown = document.getElementById("custom-dropdown");
  if (filtered.length > 0) {
    dropdown.classList.add("active");
  } else {
    dropdown.classList.remove("active");
  }
}

function selectBookFromDropdown(book) {
  document.getElementById("book").value = book;
  document.getElementById("custom-dropdown").classList.remove("active");
  document.getElementById("chapter").focus();
}

document.addEventListener("click", (e) => {
  const bookInput = document.getElementById("book");
  const dropdown = document.getElementById("custom-dropdown");
  if (!bookInput.contains(e.target) && !dropdown.contains(e.target)) {
    hideDropdown();
  }
});

function handleDropdownKeys(e) {
  const dropdown = document.getElementById("custom-dropdown");
  const items = dropdown.querySelectorAll("li");
  if (!dropdown.classList.contains("active") || items.length === 0) {
    filterDropdown(); // Ensure dropdown shows when typing
    return;
  }

  let index = Array.from(items).findIndex(i => i.classList.contains("bg-blue-100"));
  if (e.key === "ArrowDown") {
    e.preventDefault();
    index = (index + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    index = (index - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (index >= 0) items[index].click();
    return;
  } else {
    return;
  }

  items.forEach((item, i) => {
    item.classList.toggle("bg-blue-100", i === index);
  });
}
