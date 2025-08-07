# Bible Study App - Vercel Deployment Guide

## Overview
This app is protected with server-side rendering. Your `kjv.json` and business logic are hidden on the server.

## Files Protected
- ✅ `kjv.json` - Bible data (server-side only)
- ✅ `script.js` - Original logic (replaced with minimal client script)
- ✅ Business logic - All processing happens on server

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Locally
```bash
npm start
```
Visit http://localhost:3000

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Option B: Using GitHub
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Create new project
4. Import your GitHub repository
5. Deploy

### 4. Environment Variables (if needed)
- Add any environment variables in Vercel dashboard
- No sensitive data needed for this setup

## Protection Features

### Server-Side Protection
- All Bible data processing happens on server
- Search algorithms are hidden
- Verse formatting is server-rendered
- Daily devotion logic is protected

### Client-Side (Minimal)
- Only UI interaction functions
- No business logic exposed
- No data processing
- Just API calls to server

## API Endpoints
- `/api/search-results` - Search functionality
- `/api/book-picker` - Book selection
- `/api/chapter-picker` - Chapter selection
- `/api/verse-picker` - Verse selection
- `/api/verse-content/:book/:chapter/:verse` - Specific verse
- `/api/chapter-content/:book/:chapter` - Chapter content
- `/api/daily-devotion` - Daily verse
- `/api/reader-interface` - Reader interface

## Troubleshooting

### Common Issues
1. **404 Errors**: Check Vercel routes in `vercel.json`
2. **API Errors**: Ensure server.js is properly configured
3. **Static Files**: Verify file paths in HTML

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

## Security Notes
- Your `kjv.json` is never sent to the client
- All business logic stays on the server
- Client only sees minimal UI code
- API endpoints are rate-limited by Vercel 