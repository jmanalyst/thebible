const supabase = window.supabase.createClient("https://zotjqpwgsrswaakhwtzl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdGpxcHdnc3Jzd2Fha2h3dHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM1NjgsImV4cCI6MjA2ODY2OTU2OH0.z2B4Uss7ar1ccRxXOO0oZ3bqpW7Nka5xwbAZh_RRo7s");







// Login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return alert(error.message);

  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("admin-ui").classList.remove("hidden");
  loadTopics();
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  document.getElementById("admin-ui").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

// Add Topic
async function addTopic() {
  const title = document.getElementById("topic-title").value.trim();
  if (!title) return;
  await supabase.from("topics").insert([{ title }]);
  document.getElementById("topic-title").value = "";
  loadTopics();
}

// Add Subtopic
async function addSubtopic() {
  const title = document.getElementById("subtopic-title").value.trim();
  const topicId = document.getElementById("subtopic-topic-select").value;
  if (!title || !topicId) return alert("Enter subtopic and select topic");

  const { data: existing } = await supabase
    .from("subtopics")
    .select("*")
    .eq("topic_id", topicId)
    .eq("title", title);
  if (existing?.length) return alert("That subtopic already exists.");

  const { error } = await supabase.from("subtopics").insert([{ title, topic_id: topicId }]);
  if (error) return alert("Error: " + error.message);

  document.getElementById("subtopic-title").value = "";

  if (document.getElementById("topic-select").value === topicId) {
    await loadSubtopics(topicId);
  }
  alert("Subtopic added.");
}

// Add Single Verse
async function addVerse() {
  const topic_id = document.getElementById("topic-select").value;
  const book = document.getElementById("book").value.trim();
  const chapter = parseInt(document.getElementById("chapter").value);
  const verse = parseInt(document.getElementById("verse").value);
  const subtopic = document.getElementById("subtopic").value.trim();
  const note = document.getElementById("note").value.trim();

  if (!topic_id || !book || isNaN(chapter) || isNaN(verse)) {
    return alert("Please fill in all required fields.");
  }

  const { error } = await supabase.from("topic_verses").insert([
    { topic_id, book, chapter, verse, subtopic, note }
  ]);
  if (error) return alert("Error: " + error.message);

  document.getElementById("book").value = "";
  document.getElementById("chapter").value = "";
  document.getElementById("verse").value = "";
  document.getElementById("note").value = "";
  document.getElementById("subtopic").value = "";
  document.getElementById("subtopic-select").value = "";

  loadTopics();
}

// Add Multiple Verses
async function addMultipleVerses() {
  const topic_id = document.getElementById("multi-topic-select").value;
  const subtopic = document.getElementById("multi-subtopic-select").value.trim();
  const note = document.getElementById("note").value.trim();
  const input = document.getElementById("multi-verse-input").value.trim();
  if (!topic_id || !input) return alert("Please select topic and enter verses.");

  const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
  const batch = [];

  for (const line of lines) {
    const match = line.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return alert(`Invalid format: "${line}". Use "BookName 1:1"`);
    const [, book, chapter, verse] = match;
    batch.push({
      topic_id, book, chapter: parseInt(chapter), verse: parseInt(verse), subtopic, note
    });
  }

  const { error } = await supabase.from("topic_verses").insert(batch);
  if (error) return alert("Error: " + error.message);

  document.getElementById("multi-verse-input").value = "";
  document.getElementById("note").value = "";
  document.getElementById("subtopic").value = "";
  document.getElementById("subtopic-select").value = "";
  document.getElementById("multi-subtopic-select").innerHTML = `<option value="">-- Select subtopic --</option>`;

  loadTopics();
}

// Load Topics and Dropdowns
async function loadTopics() {
  console.log("Loading topics...");
  const { data: topics } = await supabase.from("topics").select("*").order("order", { ascending: true });
  const { data: verses } = await supabase.from("topic_verses").select("*");
  const { data: subtopics } = await supabase.from("subtopics").select("*").order("order", { ascending: true });
  
  console.log("Loaded data:", { topics: topics?.length, verses: verses?.length, subtopics: subtopics?.length });

  const list = document.getElementById("topics-list");
  const topicSelect = document.getElementById("topic-select");
  const subtopicTopicSelect = document.getElementById("subtopic-topic-select");
  const multiTopicSelect = document.getElementById("multi-topic-select");

  list.innerHTML = "";
  topicSelect.innerHTML = `<option value="">-- Select topic --</option>`;
  subtopicTopicSelect.innerHTML = `<option value="">-- Select topic --</option>`;
  multiTopicSelect.innerHTML = `<option value="">-- Select topic --</option>`;

  topics.forEach(topic => {
    topicSelect.innerHTML += `<option value="${topic.id}">${topic.title}</option>`;
    subtopicTopicSelect.innerHTML += `<option value="${topic.id}">${topic.title}</option>`;
    multiTopicSelect.innerHTML += `<option value="${topic.id}">${topic.title}</option>`;

    const grouped = {};
    const topicVerses = verses.filter(v => v.topic_id === topic.id);
    const topicSubtopics = subtopics?.filter(s => s.topic_id === topic.id) || [];
    
    // Group verses by subtopic, using subtopics table for names
    topicVerses.forEach(v => {
      let key = v.subtopic?.trim() || "__misc__";
      
      // If this subtopic exists in the subtopics table, use that name
      // Also check if there's a subtopic with the same name (for renamed subtopics)
      const subtopicData = topicSubtopics.find(s => s.title === v.subtopic);
      if (subtopicData) {
        key = subtopicData.title;
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(v);
    });

    let html = "";
    Object.entries(grouped).forEach(([sub, verses]) => {
      const title = sub === "__misc__"
  ? ""
  : `<div class="flex items-center justify-between mb-1">
      <strong>${sub}</strong>
      <button onclick="deleteSubtopic('${topic.id}', \`${sub}\`)" class="text-red-500 text-xs ml-2">Remove Subtopic</button>
     </div>`;
      const items = verses.map(v => `
  <li>${v.book} ${v.chapter}:${v.verse} ${v.note || ""}
    <button onclick="deleteVerse('${v.id}')" class="text-red-500 text-xs ml-2">Remove</button>
  </li>
`).join("");

html += `
  <div class="subtopic-item" data-subtopic="${sub}">
    ${title}
    <ul class="ml-4 list-disc">${items}</ul>
  </div>`;
    });

    list.innerHTML += `
  <div class="border p-3 rounded topic-item" data-id="${topic.id}">
    <div class="flex justify-between items-center">
      <h3 class="font-semibold">${topic.title}</h3>
      <button onclick="deleteTopic('${topic.id}')" class="text-red-500 text-xs">Delete Topic</button>
    </div>
    <div class="subtopics-container">${html}</div>
  </div>`;
  });


          new Sortable(document.getElementById("topics-list"), {
  animation: 150,
  handle: '.font-semibold',
  onEnd: async function (evt) {
    const items = [...document.querySelectorAll('.topic-item')];
    for (let i = 0; i < items.length; i++) {
      const topicId = items[i].dataset.id;
      await supabase.from("topics").update({ order: i }).eq("id", topicId);
    }
  }
});

document.querySelectorAll('.subtopics-container').forEach(container => {
  new Sortable(container, {
    animation: 150,
    handle: 'strong', // Only drag by subtopic title
    onEnd: async function () {
      const subtopicDivs = container.querySelectorAll('.subtopic-item');
      for (let i = 0; i < subtopicDivs.length; i++) {
        const title = subtopicDivs[i].dataset.subtopic;
        const topicId = container.closest('.topic-item').dataset.id;
        await supabase
          .from("subtopics")
          .update({ order: i })
          .eq("topic_id", topicId)
          .eq("title", title);
      }
    }
  });
});





  topicSelect.onchange = () => {
    const topicId = topicSelect.value;
    if (topicId) {
      loadSubtopics(topicId);
    } else {
      document.getElementById("subtopic-select").innerHTML = `<option value="">-- Select subtopic --</option>`;
      document.getElementById("subtopic").value = "";
    }
  };

  multiTopicSelect.onchange = async () => {
    const topicId = multiTopicSelect.value;
    const multiSubSelect = document.getElementById("multi-subtopic-select");
    multiSubSelect.innerHTML = `<option value="">-- Select subtopic --</option>`;
    document.getElementById("subtopic").value = "";

    if (topicId) {
      const { data: subtopics } = await supabase
        .from("subtopics")
        .select("title")
        .eq("topic_id", topicId);

      if (subtopics) {
        subtopics.forEach(({ title }) => {
          const opt = document.createElement("option");
          opt.value = title;
          opt.textContent = title;
          multiSubSelect.appendChild(opt);
        });
      }
    }
  };

  // Setup rename dropdowns
  setupRenameDropdowns();
}








// Load subtopics
async function loadSubtopics(topicId) {
const { data } = await supabase
  .from("subtopics")
  .select("title")
  .eq("topic_id", topicId)
  .order("order", { ascending: true });

  const dropdown = document.getElementById("subtopic-select");
  dropdown.innerHTML = `<option value="">-- Select subtopic --</option>`;
  if (data) {
    data.forEach(({ title }) => {
      const opt = document.createElement("option");
      opt.value = title;
      opt.textContent = title;
      dropdown.appendChild(opt);
    });
  }

  document.getElementById("subtopic").value = "";
}

function handleSubtopicChange(select) {
  document.getElementById("subtopic").value = select.value;
}

// Deletion
async function deleteVerse(id) {
  await supabase.from("topic_verses").delete().eq("id", id);
  loadTopics();
}

async function deleteSubtopic(topicId, subtopic) {
  if (!confirm(`Delete all verses under "${subtopic}"?`)) return;
  await supabase.from("topic_verses").delete().eq("topic_id", topicId).eq("subtopic", subtopic);
  loadTopics();
}

async function deleteTopic(topicId) {
  if (!confirm("Delete topic and all data?")) return;
  await supabase.from("topic_verses").delete().eq("topic_id", topicId);
  await supabase.from("subtopics").delete().eq("topic_id", topicId);
  await supabase.from("topics").delete().eq("id", topicId);
  loadTopics();
}

// Rename functionality
function setupRenameDropdowns() {
  const typeSelect = document.getElementById("rename-type-select");
  const topicSelect = document.getElementById("rename-topic-select");
  const subtopicSelect = document.getElementById("rename-subtopic-select");

  typeSelect.onchange = async () => {
    const type = typeSelect.value;
    topicSelect.classList.add("hidden");
    subtopicSelect.classList.add("hidden");

    if (type === "topic") {
      topicSelect.classList.remove("hidden");
      await populateRenameTopicSelect();
    } else if (type === "subtopic") {
      subtopicSelect.classList.remove("hidden");
      await populateRenameSubtopicSelect();
    }
  };

  topicSelect.onchange = () => {
    const selectedOption = topicSelect.options[topicSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
      document.getElementById("new-name").value = selectedOption.text;
    }
  };

  subtopicSelect.onchange = () => {
    const selectedOption = subtopicSelect.options[subtopicSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
      document.getElementById("new-name").value = selectedOption.text;
    }
  };
}

async function populateRenameTopicSelect() {
  const { data: topics } = await supabase.from("topics").select("*").order("order", { ascending: true });
  const select = document.getElementById("rename-topic-select");
  
  select.innerHTML = `<option value="">-- Select topic to rename --</option>`;
  topics.forEach(topic => {
    const option = document.createElement("option");
    option.value = topic.id;
    option.textContent = topic.title;
    select.appendChild(option);
  });
}

async function populateRenameSubtopicSelect() {
  const { data: subtopics } = await supabase
    .from("subtopics")
    .select("id, title, topic_id")
    .order("order", { ascending: true });
  
  const { data: topics } = await supabase.from("topics").select("id, title").order("order", { ascending: true });
  const select = document.getElementById("rename-subtopic-select");
  
  select.innerHTML = `<option value="">-- Select subtopic to rename --</option>`;
  
  if (subtopics) {
    subtopics.forEach(subtopic => {
      const topic = topics.find(t => t.id === subtopic.topic_id);
      const option = document.createElement("option");
      option.value = subtopic.id;
      option.textContent = `${subtopic.title} (in ${topic?.title || 'Unknown Topic'})`;
      select.appendChild(option);
    });
  }
}

async function renameItem() {
  const type = document.getElementById("rename-type-select").value;
  const newName = document.getElementById("new-name").value.trim();
  
  if (!type || !newName) {
    return alert("Please select a type and enter a new name.");
  }

  if (type === "topic") {
    const topicId = document.getElementById("rename-topic-select").value;
    if (!topicId) return alert("Please select a topic to rename.");
    
    const { error } = await supabase
      .from("topics")
      .update({ title: newName })
      .eq("id", topicId);
    
    if (error) return alert("Error: " + error.message);
    
  } else if (type === "subtopic") {
    const subtopicId = document.getElementById("rename-subtopic-select").value;
    if (!subtopicId) return alert("Please select a subtopic to rename.");
    
    // First get the current subtopic data before updating
    const { data: currentSubtopic } = await supabase
      .from("subtopics")
      .select("topic_id, title")
      .eq("id", subtopicId)
      .single();
    
    if (!currentSubtopic) return alert("Subtopic not found.");
    
    // Update the subtopic title in the subtopics table
    const { error: subtopicError } = await supabase
      .from("subtopics")
      .update({ title: newName })
      .eq("id", subtopicId);
    
    if (subtopicError) return alert("Error: " + subtopicError.message);
    
    // Then update all verses that reference this subtopic using the old name
    const { error: verseError } = await supabase
      .from("topic_verses")
      .update({ subtopic: newName })
      .eq("topic_id", currentSubtopic.topic_id)
      .eq("subtopic", currentSubtopic.title);
    
    if (verseError) return alert("Error updating verses: " + verseError.message);
  }

  // Clear form
  document.getElementById("rename-type-select").value = "";
  document.getElementById("rename-topic-select").classList.add("hidden");
  document.getElementById("rename-subtopic-select").classList.add("hidden");
  document.getElementById("new-name").value = "";
  
  alert("Successfully renamed!");
  
  // Force immediate refresh and then another after delay
  console.log("Refreshing topics list after rename...");
  await loadTopics();
  
  // Additional refresh after delay to ensure everything is updated
  setTimeout(() => {
    console.log("Second refresh after rename...");
    loadTopics();
  }, 1000);
}

// Auth state handlers
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("admin-ui").classList.remove("hidden");
    loadTopics();
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("admin-ui").classList.remove("hidden");
    loadTopics();
  }
  if (event === 'SIGNED_OUT') {
    document.getElementById("admin-ui").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
  }
});

function handleLogin(event) {
  event.preventDefault();
  login();
}