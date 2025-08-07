// Server-side rendering approach - minimal client-side code
// All business logic stays on the server, client only handles UI interactions

document.addEventListener("DOMContentLoaded", () => {
    // Minimal client-side code - just UI interactions
    setupEventListeners();
    loadInitialState();
});

function setupEventListeners() {
    // Only UI event handlers here
    document.getElementById("verse")?.addEventListener("click", () => {
        // Send request to server for verse picker
        fetch('/api/verse-picker')
            .then(res => res.json())
            .then(data => {
                // Server returns HTML for verse picker
                document.getElementById("verse-picker").innerHTML = data.html;
            });
    });
    
    // Other minimal UI handlers...
}

function loadInitialState() {
    // Server returns initial state as JSON
    fetch('/api/initial-state')
        .then(res => res.json())
        .then(data => {
            // Apply server-rendered content
            document.getElementById("result").innerHTML = data.content;
        });
}

// This approach keeps your business logic completely hidden on the server
// Users can only see these minimal UI interaction functions 