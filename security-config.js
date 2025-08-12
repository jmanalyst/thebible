// Bible Translation Security Configuration
// This file contains all security rules and configurations

const SECURITY_CONFIG = {
  // Allowed Bible translations
  ALLOWED_TRANSLATIONS: [
    'kjv', 'asv', 'rv_1909', 'rvg_2004', 'rvg', 'web'
  ],
  
  // Blocked file extensions (but allow script.js)
  BLOCKED_EXTENSIONS: ['.json', '.txt', '.md'],
  
  // Blocked directories
  BLOCKED_DIRECTORIES: ['/data/', '/data', '/public/data/'],
  
  // Blocked file patterns (Bible data files only)
  BLOCKED_PATTERNS: [
    'kjv.json', 'asv.json', 'rvg.json', 'web.json', 
    'rv_1909.json', 'rvg_2004.json'
  ],
  
  // Allowed JavaScript files (needed for frontend functionality)
  ALLOWED_JS_FILES: ['script.js', 'script-obfuscated.js', 'script.full-obf.js'],
  
  // Suspicious User-Agent patterns
  SUSPICIOUS_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper', 'harvester', 'collector',
    'curl', 'wget', 'python', 'java', 'perl', 'ruby', 'php'
  ],
  
  // Rate limiting configuration
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS: 500, // Increased from 100 to allow Bible topics to load
    BURST_WINDOW_MS: 30000, // 30 seconds
    MAX_BURST: 200 // Increased from 50 to allow burst loading of topics
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none'
  },
  
  // Cache control for Bible data
  BIBLE_CACHE_CONTROL: 'no-store, no-cache, must-revalidate, private',
  
  // Logging configuration
  LOGGING: {
    BLOCKED_ACCESS: true,
    RATE_LIMIT_VIOLATIONS: true,
    SUSPICIOUS_ACTIVITY: true,
    SUCCESSFUL_REQUESTS: false // Set to true for debugging
  }
};

// Security middleware functions
const SecurityMiddleware = {
  // Check if URL contains blocked patterns
  isBlockedUrl: (url) => {
    const lowerUrl = url.toLowerCase();
    
    // Check blocked directories
    if (SECURITY_CONFIG.BLOCKED_DIRECTORIES.some(dir => lowerUrl.startsWith(dir))) {
      return true;
    }
    
    // Check blocked file patterns (Bible data files)
    if (SECURITY_CONFIG.BLOCKED_PATTERNS.some(pattern => lowerUrl.includes(pattern))) {
      return true;
    }
    
      // Check blocked extensions (but allow API calls and JavaScript files)
  if (SECURITY_CONFIG.BLOCKED_EXTENSIONS.some(ext => lowerUrl.endsWith(ext)) && 
      !lowerUrl.includes('/api/') && 
      !SECURITY_CONFIG.ALLOWED_JS_FILES.some(jsFile => lowerUrl.includes(jsFile))) {
    return true;
  }
  
  // Special case: Always allow JavaScript files that are explicitly allowed
  if (lowerUrl.endsWith('.js') && SECURITY_CONFIG.ALLOWED_JS_FILES.some(jsFile => lowerUrl.includes(jsFile))) {
    return false;
  }
    
    return false;
  },
  
  // Check if User-Agent is suspicious
  isSuspiciousUserAgent: (userAgent) => {
    if (!userAgent) return false;
    const lowerUA = userAgent.toLowerCase();
    return SECURITY_CONFIG.SUSPICIOUS_USER_AGENTS.some(pattern => lowerUA.includes(pattern));
  },
  
  // Validate translation version
  isValidTranslation: (translation) => {
    return SECURITY_CONFIG.ALLOWED_TRANSLATIONS.includes(translation);
  },
  
  // Generate security log message
  logSecurityEvent: (event, details) => {
    if (SECURITY_CONFIG.LOGGING[event]) {
      console.log(`🔒 SECURITY: ${event} - ${details}`);
    }
  }
};

module.exports = {
  SECURITY_CONFIG,
  SecurityMiddleware
};
