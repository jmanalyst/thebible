# Deploying to Vercel

This guide will walk you through deploying your Bible Study app to Vercel.

## Prerequisites

1. **GitHub Account**: Your code needs to be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
cd "/Users/joe/HTML Playground/BibleStudy"
git init
git add .
git commit -m "Initial commit for Vercel deployment"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it something like `bible-study-app`
4. Make it public or private (your choice)
5. Don't initialize with README (you already have one)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/bible-study-app.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `bible-study-app` repository

### 2.2 Configure Project
- **Framework Preset**: Other
- **Root Directory**: `./` (leave as default)
- **Build Command**: Leave empty (not needed for Node.js)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 2.3 Environment Variables (Optional)
You can add environment variables in the Vercel dashboard:
- `NODE_ENV`: `production`

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Verify Deployment

1. **Check the URL**: Vercel will give you a URL like `https://your-app.vercel.app`
2. **Test the API**: Visit `https://your-app.vercel.app/api/bible-data` to verify the API works
3. **Test the App**: Visit the main URL to test the full application

## Step 4: Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **API Not Working**: Verify the `vercel.json` configuration
3. **Static Files Not Loading**: Make sure paths in your HTML are correct

### Debug Commands:
```bash
# Test locally first
npm install
npm start

# Check if all files are committed
git status

# Verify package.json has all dependencies
cat package.json
```

## File Structure for Deployment

Your repository should contain:
```
BibleStudy/
├── server.js              # Main server file
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
├── .gitignore            # Git ignore rules
├── index.html            # Main HTML file
├── script-protected.js   # Protected client script
├── style.css             # Styles
└── public/
    └── kjv.json          # Bible data (protected)
```

## Security After Deployment

✅ **Your `kjv.json` file is now protected** - users can't directly access it  
✅ **Your JavaScript is obfuscated** - harder to read and understand  
✅ **All requests go through your server** - with validation and rate limiting  
✅ **HTTPS is automatically enabled** - secure connections  

## Monitoring

- **Vercel Dashboard**: Monitor deployments, performance, and errors
- **Function Logs**: Check serverless function execution logs
- **Analytics**: Track usage and performance metrics

## Updates

To update your deployed app:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel will automatically redeploy when you push to the main branch. 