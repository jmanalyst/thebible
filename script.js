const bibleBooks = [/* same book list here */];

let currentSuggestions = [];
let selectedIndex = -1;

// Load from URL (if you re-enable sharing later)
window.addEventListener("DOMContentLoaded", () => {
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

// Fetch verse/chapter
async function getVerse() {
  const book = document.getElementById('book').value.trim();
  const chapter = document.getElementById('chapter').value.trim();
  const verse = document.getElementById('verse').value.trim();
  const result = document.getElementById('result');

  // ✅ Unfocus inputs to force mobile zoom-out
  document.getElementById('book').blur();
  document.getElementById('chapter').blur();
  document.getElementById('verse').blur();
  document.activeElement.blur();

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

// Enter key = fetch
function submitOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    getVerse();
  }
}

// Autocomplete
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

// Capitalize words
function capitalize(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

// Voice input
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

      // ✅ Force blur before triggering fetch
      document.activeElement.blur();

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
