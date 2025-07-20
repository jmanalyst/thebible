
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

// Filter and show dropdown
function filterDropdown() {
  const input = document.getElementById("book").value.toLowerCase();
  const dropdown = document.getElementById("custom-dropdown");
  dropdown.innerHTML = "";

  if (!input) {
    dropdown.classList.remove("active");
    return;
  }

  const matches = books.filter(book => book.toLowerCase().startsWith(input));
  matches.forEach(book => {
    const li = document.createElement("li");
    li.textContent = book;
    li.className = "px-2 py-1 hover:bg-gray-100 cursor-pointer";
    li.onclick = () => selectBookFromDropdown(book);
    dropdown.appendChild(li);
  });

  if (matches.length) {
    dropdown.classList.add("active");
  } else {
    dropdown.classList.remove("active");
  }
}

// Dropdown logic
function showDropdown() {
  const dropdown = document.getElementById("custom-dropdown");
  if (dropdown.children.length > 0) dropdown.classList.add("active");
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

function submitOnEnter(e) {
  if (e.key === "Enter") {
    getVerse();
  }
}

async function getVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();
  const result = document.getElementById("result");

  result.innerHTML = "Loading...";

  if (!book || !chapter || !verse) {
    result.innerHTML = "Please fill all fields.";
    return;
  }

  try {
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
  } catch (err) {
    console.error(err);
    result.innerHTML = "Error fetching verse.";
  }
}

async function getChapter(book, chapter) {
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";

  try {
    const res = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
    const data = await res.json();

    if (data.verses) {
      const fullChapter = data.verses.map(v => `<strong>${v.verse}</strong>. ${v.text.trim()}`).join("\n\n");
      result.innerHTML = `
        <h2 class="text-xl font-bold mb-4">${data.reference}</h2>
        <pre class="whitespace-pre-wrap font-sans text-base leading-relaxed">${fullChapter}</pre>
      `;
    } else {
      result.innerHTML = "Chapter not found.";
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = "Error fetching chapter.";
  }
}

// Speech recognition
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

// Utility used by inline script
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

// Preload dropdown so it appears on first focus
document.addEventListener("DOMContentLoaded", () => {
  const bookInput = document.getElementById("book");
  const dropdown = document.getElementById("custom-dropdown");

  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = book;
    li.className = "px-2 py-1 hover:bg-gray-100 cursor-pointer";
    li.onclick = () => selectBookFromDropdown(book);
    dropdown.appendChild(li);
  });
});


// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("custom-dropdown");
  const bookInput = document.getElementById("book");
  if (!dropdown.contains(e.target) && e.target !== bookInput) {
    dropdown.classList.remove("active");
  }
});
