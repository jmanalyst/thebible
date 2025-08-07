# Bible Study App - Protected Version

This version of the Bible Study app includes protection measures to prevent users from easily accessing your source code and data.

## Protection Features

1. **Server-Side Data**: Bible data is served through API endpoints instead of direct JSON file access
2. **Code Obfuscation**: JavaScript code is obfuscated to make it harder to read
3. **File Access Control**: Direct access to sensitive files is blocked via .htaccess
4. **API Rate Limiting**: Built-in protection against excessive API calls

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Application
Open your browser and go to `http://localhost:3000`

## File Structure

- `server.js` - Node.js server with API endpoints
- `script-protected.js` - Client-side script that uses API instead of direct file access
- `script-obfuscated.js` - Heavily obfuscated version of the original script
- `.htaccess` - Apache configuration to block direct file access
- `public/kjv.json` - Bible data (now protected from direct access)

## API Endpoints

- `GET /api/bible-data` - Get all Bible verses
- `GET /api/search?q=query` - Search Bible verses
- `GET /api/verse/:book/:chapter/:verse` - Get specific verse
- `GET /api/chapter/:book/:chapter` - Get entire chapter

## Security Notes

- The original `script.js` and `kjv.json` files are still present but should not be served directly
- Users can still see the obfuscated JavaScript, but it's extremely difficult to understand
- The server-side API provides an additional layer of protection
- Consider implementing authentication for additional security

## Deployment

For production deployment:
1. Use a proper hosting service (Heroku, Vercel, etc.)
2. Set up environment variables for sensitive data
3. Consider using a CDN for static assets
4. Implement proper SSL/TLS encryption 