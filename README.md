# The Living Word Online

An online Bible application that allows users to search, read, and reflect on scripture from multiple Bible translations.

## Features

- **Multiple Bible Translations**: Access to 6 different Bible translations
- **Search Functionality**: Search through scripture with filters
- **Verse Highlighting**: Highlight and save important verses
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes
- **Social Sharing**: Share verses with friends and family

## Available Translations

1. **KJV** - King James Version
2. **ASV** - American Standard Version  
3. **RVG** - Reina Valera Gómez
4. **RVG 2004** - Reina Valera Gómez 2004
5. **RV 1909** - Reina Valera 1909
6. **WEB** - World English Bible

## How to Use

### Switching Translations

1. Click the search icon in the top navigation
2. Use the "Bible Translation" dropdown to select your preferred translation
3. The selected translation will be saved and automatically loaded on future visits
4. The current translation is displayed in the navigation bar

### Searching

1. Click the search icon to open the search panel
2. Enter your search terms in the search box
3. Use the filter options to narrow your search:
   - All: Search entire Bible
   - Old Testament: Search only Old Testament
   - New Testament: Search only New Testament
   - Current Book: Search only the currently open book

### Navigation

- Use the navigation pills to jump to specific books, chapters, or verses
- Click on verse numbers to jump to specific verses
- Use the navigation buttons to move between chapters and verses

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Tailwind CSS for styling
- Bible data stored in JSON format
- Translations loaded dynamically based on user preference
- User preferences saved in localStorage

## Running Locally

1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. Open your browser to `http://localhost:3000`

## File Structure

- `script.js` - Main application logic
- `server.js` - Express server for serving files
- `index.html` - Main application interface
- `public/` - Bible translation JSON files and assets
