#!/bin/bash
# Vercel build script to ensure obfuscated script is included

echo "🔧 Vercel build script starting..."

# Copy the obfuscated script to ensure it's available
if [ -f "script-obfuscated.js" ]; then
    echo "📁 Copying obfuscated script..."
    cp script-obfuscated.js /vercel/output/
    echo "✅ Obfuscated script copied successfully"
else
    echo "❌ Obfuscated script not found!"
fi

# Copy other static files
echo "📁 Copying static files..."
cp -r *.html *.css *.ico *.png *.jpg *.jpeg *.gif *.svg *.woff *.woff2 *.ttf *.eot /vercel/output/ 2>/dev/null || true

echo "🏗️ Build script completed"
