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

  // Get the current highest order for this topic
  const { data: currentSubtopics } = await supabase
    .from("subtopics")
    .select("order")
    .eq("topic_id", topicId)
    .order("order", { ascending: false })
    .limit(1);
  
  const nextOrder = currentSubtopics && currentSubtopics.length > 0 ? currentSubtopics[0].order + 1 : 0;
  console.log(`Adding subtopic "${title}" with order ${nextOrder}`);

  const { error } = await supabase.from("subtopics").insert([{ 
    title, 
    topic_id: topicId, 
    order: nextOrder 
  }]);
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
    // Check for verse range format: "Book 1:1-5"
    const rangeMatch = line.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
      const [, book, chapter, startVerse, endVerse] = rangeMatch;
      const start = parseInt(startVerse);
      const end = parseInt(endVerse);
      
      if (start > end) {
        alert(`Invalid range: "${line}". Start verse must be less than or equal to end verse.`);
        continue;
      }
      
      // Store the range as a single entry with special format in the note field
      const rangeNote = note ? `${note} (Range: ${start}-${end})` : `(Range: ${start}-${end})`;
      batch.push({
        topic_id, book, chapter: parseInt(chapter), verse: start, subtopic, note: rangeNote
      });
      continue;
    }
    
    // Check for single verse format: "Book 1:1"
    const singleMatch = line.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (singleMatch) {
      const [, book, chapter, verse] = singleMatch;
      batch.push({
        topic_id, book, chapter: parseInt(chapter), verse: parseInt(verse), subtopic, note
      });
      continue;
    }
    
    // If neither format matches, show error
    alert(`Invalid format: "${line}". Use "BookName 1:1" for single verses or "BookName 1:1-5" for ranges.`);
  }

  if (batch.length === 0) {
    alert("No valid verses to add.");
    return;
  }

  const { error } = await supabase.from("topic_verses").insert(batch);
  if (error) return alert("Error: " + error.message);

  document.getElementById("multi-verse-input").value = "";
  document.getElementById("note").value = "";
  document.getElementById("subtopic").value = "";
  document.getElementById("subtopic-select").value = "";
  document.getElementById("multi-subtopic-select").innerHTML = `<option value="">-- Select subtopic --</option>`;

  alert(`Successfully added ${batch.length} verse(s)!`);
  loadTopics();
}

// Load Topics and Dropdowns
async function loadTopics() {
  console.log("Loading topics...");
  
  try {
    const { data: topics, error: topicsError } = await supabase.from("topics").select("*").order("order", { ascending: true });
    const { data: verses, error: versesError } = await supabase.from("topic_verses").select("*");
    
    // Try to load subtopics with order, but fallback if order field doesn't exist
    let { data: subtopics, error: subtopicsError } = await supabase.from("subtopics").select("*").order("order", { ascending: true });
    
    if (subtopicsError) {
      console.log("Order field might not exist, trying without order:", subtopicsError);
      const { data: subtopicsNoOrder, error: subtopicsNoOrderError } = await supabase.from("subtopics").select("*");
      if (subtopicsNoOrderError) {
        console.error("Error loading subtopics:", subtopicsNoOrderError);
        subtopics = [];
      } else {
        subtopics = subtopicsNoOrder;
      }
    }
    
    if (topicsError) console.error("Topics error:", topicsError);
    if (versesError) console.error("Verses error:", versesError);
    if (subtopicsError) console.error("Subtopics error:", subtopicsError);
    
    console.log("Loaded data:", { 
      topics: topics?.length || 0, 
      verses: verses?.length || 0, 
      subtopics: subtopics?.length || 0 
    });
    
    if (subtopics && subtopics.length > 0) {
      console.log("Subtopics loaded:", subtopics.map(s => ({ id: s.id, title: s.title, order: s.order, topic_id: s.topic_id })));
    }
    
    if (!topics || topics.length === 0) {
      console.log("No topics found");
      document.getElementById("topics-list").innerHTML = "<p class='text-gray-500'>No topics found. Add some topics to get started!</p>";
      return;
    }

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
    console.log(`Processing topic "${topic.title}" with ${topicVerses.length} verses and ${topicSubtopics.length} subtopics`);
    
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
    
    console.log(`Grouped verses for topic "${topic.title}":`, Object.keys(grouped));

    let html = "";
    console.log(`Building HTML for topic "${topic.title}" - subtopics in order:`, topicSubtopics.map(s => ({ title: s.title, order: s.order })));
    
    // Build HTML based on subtopics table order, not verses order
    topicSubtopics.forEach(subtopic => {
      const sub = subtopic.title;
      const verses = grouped[sub] || [];
      
      const title = `<div class="flex items-center justify-between mb-1">
        <strong class="cursor-move" data-item-type="subtopic" data-item-id="${subtopic.id}" data-item-title="${sub}" data-source-topic-id="${topic.id}">${sub}</strong>
        <button onclick="deleteSubtopic('${topic.id}', \`${sub}\`)" class="text-red-500 text-xs ml-2">Remove Subtopic</button>
       </div>`;
      
      const items = verses.map(v => {
        // Check if this is a verse range by looking for "(Range: X-Y)" in the note
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${v.verse}-${endVerse}`;
          const cleanNote = v.note.replace(/\(Range: \d+-\d+\)/, '').trim();
          return `<li class="verse-item cursor-move" data-verse-id="${v.id}">${verseRef} ${cleanNote || ""}
    <button onclick="deleteVerse('${v.id}')" class="text-red-500 text-xs ml-2">Remove</button>
  </li>`;
        }
        
        return `<li class="verse-item cursor-move" data-verse-id="${v.id}">${v.book} ${v.chapter}:${v.verse} ${v.note || ""}
    <button onclick="deleteVerse('${v.id}')" class="text-red-500 text-xs ml-2">Remove</button>
  </li>`;
      }).join("");

      html += `
  <div class="subtopic-item" data-subtopic="${sub}" data-subtopic-id="${subtopic.id}">
    ${title}
    <ul class="ml-4 list-disc">${items}</ul>
  </div>`;
    });
    
    // Add any verses that don't belong to a subtopic (misc)
    if (grouped["__misc__"]) {
      const verses = grouped["__misc__"];
      const items = verses.map(v => {
        // Check if this is a verse range by looking for "(Range: X-Y)" in the note
        const rangeMatch = v.note && v.note.match(/\(Range: (\d+)-(\d+)\)/);
        if (rangeMatch) {
          const [, startVerse, endVerse] = rangeMatch;
          const verseRef = `${v.book} ${v.chapter}:${v.verse}-${endVerse}`;
          const cleanNote = v.note.replace(/\(Range: \d+-\d+\)/, '').trim();
          return `<li class="verse-item cursor-move" data-verse-id="${v.id}">${verseRef} ${cleanNote || ""}
    <button onclick="deleteVerse('${v.id}')" class="text-red-500 text-xs ml-2">Remove</button>
  </li>`;
        }
        
        return `<li class="verse-item cursor-move" data-verse-id="${v.id}">${v.book} ${v.chapter}:${v.verse} ${v.note || ""}
    <button onclick="deleteVerse('${v.id}')" class="text-red-500 text-xs ml-2">Remove</button>
  </li>`;
      }).join("");

      html += `
  <div class="subtopic-item" data-subtopic="__misc__">
    <ul class="ml-4 list-disc">${items}</ul>
  </div>`;
    }

    list.innerHTML += `
  <div class="border p-3 rounded topic-item" data-id="${topic.id}">
    <div class="flex justify-between items-center">
      <h3 class="font-semibold cursor-move" data-item-type="topic" data-item-id="${topic.id}" data-item-title="${topic.title}">${topic.title}</h3>
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
    group: {
      name: "topics",
      pull: true,
      put: true
    }, // Use same group as topics list
    handle: 'strong', // Only drag by subtopic title
    onEnd: async function (evt) {
      const { from, to } = evt;
      
      // If dropped in different container, handle cross-topic drop
      if (from !== to) {
        const item = evt.item;
        const itemType = item.dataset.itemType;
        if (itemType === 'subtopic') {
          await handleSubtopicDrop(item, to);
          return; // Don't update order if it's a cross-topic move
        }
      }
      
      // Normal reordering within same container
      const subtopicDivs = container.querySelectorAll('.subtopic-item');
      console.log("Reordering subtopics, count:", subtopicDivs.length);
      
      // Get the topic ID for this container
      const topicId = container.closest('.topic-item').dataset.id;
      console.log("Topic ID for reordering:", topicId);
      
      for (let i = 0; i < subtopicDivs.length; i++) {
        const subtopicDiv = subtopicDivs[i];
        const subtopicId = subtopicDiv.dataset.subtopicId;
        const subtopicTitle = subtopicDiv.dataset.subtopic;
        
        console.log(`Setting subtopic "${subtopicTitle}" (ID: ${subtopicId}) to order ${i}`);
        
        if (subtopicId) {
          try {
            const { error } = await supabase
              .from("subtopics")
              .update({ order: i })
              .eq("id", subtopicId);
            
            if (error) {
              console.error("Error updating subtopic order:", error);
            } else {
              console.log(`Successfully updated subtopic "${subtopicTitle}" to order ${i}`);
            }
          } catch (error) {
            console.error("Exception updating subtopic order:", error);
          }
        } else {
          console.warn("No subtopic ID found for:", subtopicTitle);
        }
      }
      
      // Verify the order was saved by reloading subtopics for this topic
      console.log("Verifying order was saved...");
      const { data: verifySubtopics } = await supabase
        .from("subtopics")
        .select("id, title, order")
        .eq("topic_id", topicId)
        .order("order", { ascending: true });
      
      console.log("Current subtopic order in database:", verifySubtopics);
    }
  });
});

// Add Sortable functionality for verses
document.querySelectorAll('.subtopic-item ul').forEach(verseList => {
  new Sortable(verseList, {
    animation: 150,
    handle: '.verse-item', // Allow dragging by the entire verse item
    onEnd: async function (evt) {
      try {
        const verseItems = [...evt.to.querySelectorAll('.verse-item')];
        
        // Update verse order in the database (only if order field exists)
        for (let i = 0; i < verseItems.length; i++) {
          const verseId = verseItems[i].dataset.verseId;
          await supabase
            .from("topic_verses")
            .update({ order: i })
            .eq("id", verseId);
        }
      } catch (error) {
        console.error("Error updating verse order:", error);
        // Continue without failing - the visual order is still maintained
      }
    }
  });
});

// Cross-topic drag and drop functionality will be set up after HTML generation





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
  
  // Setup cross-topic drag and drop AFTER the HTML is generated
  setupCrossTopicDragAndDrop();
  } catch (error) {
    console.error("Error loading topics:", error);
    document.getElementById("topics-list").innerHTML = "<p class='text-red-500'>Error loading topics. Please refresh the page.</p>";
  }
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
  
  try {
    // Delete verses under this subtopic
    const { error: verseError } = await supabase
      .from("topic_verses")
      .delete()
      .eq("topic_id", topicId)
      .eq("subtopic", subtopic);
    
    if (verseError) {
      console.error("Error deleting verses:", verseError);
      alert("Error deleting verses: " + verseError.message);
      return;
    }
    
    // Delete the subtopic from the subtopics table
    const { error: subtopicError } = await supabase
      .from("subtopics")
      .delete()
      .eq("topic_id", topicId)
      .eq("title", subtopic);
    
    if (subtopicError) {
      console.error("Error deleting subtopic:", subtopicError);
      alert("Error deleting subtopic: " + subtopicError.message);
      return;
    }
    
    console.log(`Successfully deleted subtopic "${subtopic}" and all its verses`);
    loadTopics();
    
  } catch (error) {
    console.error("Exception deleting subtopic:", error);
    alert("Error deleting subtopic: " + error.message);
  }
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

// Cross-topic drag and drop functionality
function setupCrossTopicDragAndDrop() {
  console.log("Setting up cross-topic drag and drop...");
  const topicsList = document.getElementById("topics-list");
  
  // Make the entire topics list a drop zone for topics only
  new Sortable(topicsList, {
    animation: 150,
    group: {
      name: "topics",
      pull: true,
      put: function(to, from, dragEl) {
        // Only allow topics to be dropped into the main topics list
        return dragEl.dataset.itemType === 'topic';
      }
    },
    onEnd: async function (evt) {
      console.log("Drop event:", evt);
      const { from, to, item } = evt;
      
      // If dropped within the same container, it's just reordering
      if (from === to) return;
      
      const itemType = item.dataset.itemType; // 'topic' or 'subtopic'
      const itemId = item.dataset.itemId;
      
      console.log("Item type:", itemType, "Item ID:", itemId);
      console.log("From:", from, "To:", to);
      
      if (itemType === 'topic') {
        await handleTopicDrop(item, to);
      }
      // Subtopic drops are handled in the subtopic containers
    }
  });
  
  // Note: Subtopic containers are already set up with Sortable in the main loadTopics function
}

async function handleSubtopicDrop(item, targetContainer) {
  console.log("Handling subtopic drop:", item, targetContainer);
  const subtopicId = item.dataset.itemId;
  const subtopicTitle = item.dataset.itemTitle;
  const sourceTopicId = item.dataset.sourceTopicId;
  
  console.log("Subtopic data:", { subtopicId, subtopicTitle, sourceTopicId });
  console.log("Target container classes:", targetContainer.classList.toString());
  console.log("Target container ID:", targetContainer.id);
  
  // Only allow dropping into another topic's subtopics container
  if (targetContainer.classList.contains('subtopics-container')) {
    const targetTopicId = targetContainer.closest('.topic-item').dataset.id;
    console.log("Moving subtopic to topic:", targetTopicId);
    if (targetTopicId !== sourceTopicId) {
      await moveSubtopicToTopic(subtopicId, sourceTopicId, targetTopicId);
    } else {
      console.log("Dropped in same topic - no action needed");
    }
  } else {
    console.log("Invalid drop target - subtopics can only be moved to other topics");
    // Return the item to its original position by refreshing
    loadTopics();
  }
}

async function handleTopicDrop(item, targetContainer) {
  const topicId = item.dataset.itemId;
  const topicTitle = item.dataset.itemTitle;
  
  // Check if dropped into another topic's subtopics container (convert to subtopic)
  if (targetContainer.classList.contains('subtopics-container')) {
    const targetTopicId = targetContainer.closest('.topic-item').dataset.id;
    await convertTopicToSubtopic(topicId, topicTitle, targetTopicId);
  }
}



async function convertTopicToSubtopic(topicId, topicTitle, targetTopicId) {
  try {
    // Create new subtopic
    const { data: newSubtopic, error: subtopicError } = await supabase
      .from("subtopics")
      .insert([{ 
        title: topicTitle, 
        topic_id: targetTopicId 
      }])
      .select()
      .single();
    
    if (subtopicError) throw subtopicError;
    
    // Move all verses from the topic to the new subtopic
    const { error: verseError } = await supabase
      .from("topic_verses")
      .update({ 
        topic_id: targetTopicId, 
        subtopic: topicTitle 
      })
      .eq("topic_id", topicId);
    
    if (verseError) throw verseError;
    
    // Delete the old topic
    await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);
    
    alert(`"${topicTitle}" converted to a subtopic!`);
    loadTopics();
    
  } catch (error) {
    console.error("Error converting topic to subtopic:", error);
    alert("Error converting topic to subtopic: " + error.message);
    loadTopics(); // Refresh to restore original state
  }
}

async function moveSubtopicToTopic(subtopicId, sourceTopicId, targetTopicId) {
  try {
    const subtopicTitle = document.querySelector(`[data-item-id="${subtopicId}"]`).dataset.itemTitle;
    
    // Update the subtopic's topic_id
    const { error: subtopicError } = await supabase
      .from("subtopics")
      .update({ topic_id: targetTopicId })
      .eq("id", subtopicId);
    
    if (subtopicError) throw subtopicError;
    
    // Move all verses from the subtopic to the new topic
    const { error: verseError } = await supabase
      .from("topic_verses")
      .update({ topic_id: targetTopicId })
      .eq("topic_id", sourceTopicId)
      .eq("subtopic", subtopicTitle);
    
    if (verseError) throw verseError;
    
    alert(`"${subtopicTitle}" moved to new topic!`);
    loadTopics();
    
  } catch (error) {
    console.error("Error moving subtopic:", error);
    alert("Error moving subtopic: " + error.message);
    loadTopics(); // Refresh to restore original state
  }
}