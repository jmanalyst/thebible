// Blog functionality for The Living Word Online
console.log('🚀 Blog.js loaded successfully!');

class BlogManager {
    constructor() {
        console.log('🔧 BlogManager constructor called');
        console.log('🔍 Checking if window.supabase exists:', !!window.supabase);
        
        // Initialize retry counter
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Wait for Supabase to be available
        if (!window.supabase) {
            console.error('❌ window.supabase not available yet, waiting...');
            setTimeout(() => this.initializeSupabase(), 100);
            return;
        }
        
        this.initializeSupabase();
    }

    initializeSupabase() {
        console.log('🔧 Initializing Supabase client...');
        
        // Check retry limit
        if (this.retryCount >= this.maxRetries) {
            console.error('❌ Max retries reached. Supabase script failed to load.');
            console.log('🔄 Initializing BlogManager without Supabase...');
            this.initializeBlogManager();
            return;
        }
        
        // Wait a moment for any cleanup, then check if Supabase is available
        setTimeout(() => {
            if (!window.supabase) {
                console.error('❌ Supabase script not loaded after cleanup');
                console.log('🔍 Waiting for Supabase script to load... (Attempt ' + (this.retryCount + 1) + '/' + this.maxRetries + ')');
                
                // Increment retry counter
                this.retryCount++;
                
                // Try again in a moment instead of reloading
                setTimeout(() => this.initializeSupabase(), 1000);
                return;
            }
            
            try {
                // Force create a completely fresh Supabase client
                console.log('🔄 Creating fresh Supabase client...');
                
                // Clear any existing instances
                if (this.supabase) {
                    this.supabase = null;
                }
                
                // Verify window.supabase is the correct function
                if (typeof window.supabase.createClient !== 'function') {
                    throw new Error('window.supabase.createClient is not a function');
                }
                
                // Initialize Supabase client with explicit parameters
                const supabaseUrl = 'https://zotjqpwgsrswaakhwtzl.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdGpxcHdnc3Jzd2Fha2h3dHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM1NjgsImV4cCI6MjA2ODY2OTU2OH0.z2B4Uss7ar1ccRxXOO0oZ3bqpW7Nka5xwbAZh_RRo7s';
                
                console.log('🔍 Creating client with URL:', supabaseUrl);
                console.log('🔍 Creating client with key:', supabaseKey);
                
                this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                
                // Verify the client was created correctly
                if (!this.supabase || !this.supabase.supabaseUrl) {
                    throw new Error('Supabase client creation failed');
                }
                
                // Verify the URL wasn't corrupted
                const expectedUrl = 'https://zotjqpwgsrswaakhwtzl.supabase.co';
                if (this.supabase.supabaseUrl !== expectedUrl) {
                    console.error('❌ URL corruption detected!');
                    console.error('Expected:', expectedUrl);
                    console.error('Got:', this.supabase.supabaseUrl);
                    throw new Error('Supabase URL was corrupted during client creation');
                }
                
                console.log('✅ Supabase client initialized successfully');
                console.log('🔍 Client URL:', this.supabase.supabaseUrl);
                console.log('🔍 Client API Key:', this.supabase.supabaseKey);
                
                // Verify the client is working by testing a simple query
                console.log('🧪 Testing Supabase client...');
                this.testSupabaseClient();
                
            } catch (error) {
                console.error('❌ Error initializing Supabase client:', error);
                console.log('🔄 Continuing without Supabase...');
                this.initializeBlogManager();
            }
        }, 100);
    }

    async testSupabaseClient() {
        try {
            console.log('🧪 Testing Supabase client with a simple query...');
            
            // Test with a simple query to verify the client is working
            const { data, error } = await this.supabase
                .from('blog_categories')
                .select('id')
                .limit(1);
            
            if (error) {
                console.error('❌ Supabase client test failed:', error);
                console.log('🔍 This might be due to missing database tables or permissions');
                console.log('🔄 Continuing with initialization anyway...');
                
                // Don't reload - just continue with initialization
                this.initializeBlogManager();
                return;
            }
            
            console.log('✅ Supabase client test successful:', data);
            
            // Initialize the rest of the BlogManager
            this.initializeBlogManager();
            
        } catch (error) {
            console.error('❌ Error testing Supabase client:', error);
            console.log('🔄 Continuing with initialization anyway...');
            this.initializeBlogManager();
        }
    }

    initializeBlogManager() {
        console.log('🔧 Initializing BlogManager properties...');
        
        this.currentUser = null;
        this.isAuthenticated = false;
        this.posts = [];
        this.categories = [];
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.totalPosts = 0;
        this.currentCategory = null;
        this.currentSearch = '';
        
        // Check if Supabase is available
        if (!this.supabase) {
            console.log('⚠️ Supabase not available - running in offline mode');
            this.supabase = null;
        }
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing blog...');
            
            // Only try to load data if Supabase is available
            if (this.supabase) {
                await this.loadPosts();
                await this.loadCategories();
            } else {
                console.log('📝 Running without database - showing placeholder content');
                this.showOfflineMessage();
            }
            
            this.setupEventListeners();
            this.checkAuthStatus();
            this.setupAuthListener();
            
            // Render UI components
            this.renderPosts();
            this.renderPagination();
            this.renderArchives();
            this.renderSidebarCategories();
            
            console.log('✅ Blog initialization complete');
            
        } catch (error) {
            console.error('❌ Error during blog initialization:', error);
            this.showOfflineMessage();
        }
    }

    showOfflineMessage() {
        const container = document.getElementById('blog-posts-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <h3 class="text-xl font-semibold mb-4">Blog Temporarily Unavailable</h3>
                    <p class="text-gray-600 mb-4">We're experiencing technical difficulties with our database connection.</p>
                    <p class="text-sm text-gray-500">Please try again later or contact support if the issue persists.</p>
                </div>
            `;
        }
    }

    debugAdminElements() {
        console.log('🔍 Debugging admin elements...');
        const adminElements = document.querySelectorAll('.admin-only');
        console.log(`📊 Found ${adminElements.length} elements with admin-only class:`);
        
        adminElements.forEach((element, index) => {
            console.log(`  ${index + 1}. ${element.tagName} (ID: ${element.id || 'none'}) - Classes: ${element.className}`);
        });
        
        // Also check for any elements that might be admin-related but missing the class
        const potentialAdminElements = document.querySelectorAll('[id*="admin"], [id*="edit"], [id*="delete"]');
        console.log(`🔍 Found ${potentialAdminElements.length} potential admin elements without admin-only class:`);
        
        potentialAdminElements.forEach((element, index) => {
            if (!element.classList.contains('admin-only')) {
                console.log(`  ${index + 1}. ${element.tagName} (ID: ${element.id || 'none'}) - Classes: ${element.className}`);
            }
        });
    }

    async checkAuthStatus() {
        console.log('🔐 Checking authentication status...');
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Error getting session:', error);
                // Clear state on error
                this.currentUser = null;
                this.isAuthenticated = false;
                this.hideAdminFeatures();
                this.updateAuthButton();
                return;
            }
            
            console.log('📋 Session data:', session);
            
            if (session && session.user) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                console.log('✅ User authenticated:', this.currentUser.email);
                console.log('👤 Current user object:', this.currentUser);
                this.showAdminFeatures();
                this.updateAuthButton();
                // Re-render posts to show admin buttons
                this.renderPosts();
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('❌ User not authenticated - no session found');
                this.hideAdminFeatures();
                this.updateAuthButton();
                // Re-render posts to hide admin buttons
                this.renderPosts();
            }
        } catch (error) {
            console.error('❌ Error checking auth status:', error);
            // Clear state on any error
            this.currentUser = null;
            this.isAuthenticated = false;
            this.hideAdminFeatures();
            this.updateAuthButton();
        }
    }

    setupAuthListener() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event);
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                console.log('✅ User signed in:', this.currentUser.email);
                this.showAdminFeatures();
                this.updateAuthButton();
                // Re-render posts to show admin buttons
                this.renderPosts();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('❌ User signed out');
                this.hideAdminFeatures();
                this.updateAuthButton();
                // Re-render posts to hide admin buttons
                this.renderPosts();
            }
        });
    }

    showAdminFeatures() {
        console.log('🔓 Showing admin features for authenticated user');
        console.log('🔍 Authentication status:', this.isAuthenticated);
        console.log('👤 Current user:', this.currentUser);
        
        // Only show admin features if user is actually authenticated
        if (!this.isAuthenticated) {
            console.log('❌ User not authenticated, keeping admin features hidden');
            return;
        }
        
        const adminElements = document.querySelectorAll('.admin-only');
        console.log('🔍 Found admin elements:', adminElements.length);
        
        adminElements.forEach((element, index) => {
            console.log(`📝 Processing admin element ${index + 1}:`, element.tagName, element.id, element.className);
            
            // Remove hidden class if present
            if (element.classList.contains('hidden')) {
                element.classList.remove('hidden');
                console.log(`✅ Removed 'hidden' class from element ${index + 1}`);
            }
            
            // Add show class to make element visible
            element.classList.add('show');
            console.log(`✅ Added 'show' class to element ${index + 1}`);
            
            // Special handling for different display types
            if (element.classList.contains('flex')) {
                element.classList.add('flex');
                console.log(`✅ Added 'flex' class to element ${index + 1}`);
            }
        });
        
        console.log('✅ Admin features shown for', adminElements.length, 'elements');
        
        // Force refresh admin buttons to ensure they're visible
        setTimeout(() => {
            this.forceRefreshAdminButtons();
        }, 100);
    }

    hideAdminFeatures() {
        console.log('🔒 Hiding admin features');
        
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            // Remove show class to hide element
            element.classList.remove('show', 'flex', 'inline');
            
            // Add hidden class to ensure elements are hidden
            element.classList.add('hidden');
            
            // Also set display to none as backup
            element.style.display = 'none';
        });
        
        console.log('✅ Admin features hidden for', adminElements.length, 'elements');
    }

    async loadPosts() {
        try {
            console.log('📖 Loading posts...');
            
            // Check if Supabase is available
            if (!this.supabase) {
                console.log('⚠️ Supabase not available - cannot load posts');
                return [];
            }
            
            console.log('🔍 this.supabase object:', this.supabase);
            console.log('🔍 this.supabase.from method:', this.supabase?.from);
            
            if (!this.supabase.from) {
                throw new Error('Supabase client missing .from method');
            }
            
            let query = this.supabase
                .from('blog_posts')
                .select(`
                    *,
                    blog_post_categories(
                        category_id,
                        blog_categories(id, name, slug)
                    )
                `)
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            const start = (this.currentPage - 1) * this.postsPerPage;
            const end = start + this.postsPerPage - 1;
            query = query.range(start, end);

            const { data: posts, error, count } = await query;

            if (error) throw error;

            console.log('✅ Posts loaded:', posts);
            
            this.posts = posts || [];

            return this.posts;

        } catch (error) {
            console.error('❌ Error loading posts:', error);
            this.showMessage('Error loading posts: ' + error.message, 'error');
            return [];
        }
    }

    async loadCategories() {
        try {
            console.log('🏷️ Loading categories...');
            
            // Check if Supabase is available
            if (!this.supabase) {
                console.log('⚠️ Supabase not available - using default categories');
                this.categories = [
                    { id: 'default-1', name: 'General', slug: 'general' },
                    { id: 'default-2', name: 'Bible Study', slug: 'bible-study' },
                    { id: 'default-3', name: 'Devotionals', slug: 'devotionals' }
                ];
                return;
            }
            
            const { data, error } = await this.supabase
                .from('blog_categories')
                .select('id, name, slug')
                .order('name');
            
            if (error) {
                console.error('❌ Error loading categories:', error);
                // Fallback to default categories
                this.categories = [
                    { id: 'default-1', name: 'General', slug: 'general' },
                    { id: 'default-2', name: 'Bible Study', slug: 'bible-study' },
                    { id: 'default-3', name: 'Devotionals', slug: 'devotionals' }
                ];
                return;
            }
            
            this.categories = data || [];
            console.log('✅ Categories loaded:', this.categories);
            
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            // Fallback to default categories
            this.categories = [
                { id: 'default-1', name: 'General', slug: 'general' },
                { id: 'default-2', name: 'Bible Study', slug: 'bible-study' },
                { id: 'default-3', name: 'Devotionals', slug: 'devotionals' }
            ];
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('blog-search-input');
        const searchButton = document.getElementById('blog-search-button');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.trim();
                this.currentPage = 1; // Reset to first page when searching
                this.loadPosts();
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchValue = searchInput ? searchInput.value.trim() : '';
                this.currentSearch = searchValue;
                this.currentPage = 1; // Reset to first page when searching
                this.loadPosts();
            });
        }

        // Category filtering (unified for sidebar categories)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-pill')) {
                e.preventDefault();
                const categoryId = e.target.dataset.category;
                console.log('🏷️ Category clicked:', categoryId);
                
                if (categoryId === 'all') {
                    this.currentCategory = null;
                } else {
                    this.currentCategory = categoryId;
                }
                
                this.currentPage = 1;
                this.loadPosts();
            }
        });

        // Archives filtering
        document.addEventListener('click', (e) => {
            if (e.target.closest('.archives-section') && e.target.tagName === 'A') {
                e.preventDefault();
                const year = e.target.dataset.year;
                console.log('📅 Archive year clicked:', year);
                
                // Filter posts by year
                this.filterPostsByYear(parseInt(year));
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                this.currentPage = page;
                this.loadPosts();
            }
        });

        // Edit and Delete buttons (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-post-btn')) {
                const postId = e.target.dataset.postId;
                const postTitle = e.target.dataset.postTitle;
                const postExcerpt = e.target.dataset.postExcerpt;
                
                // Find the full post content from the posts array
                const post = this.posts.find(p => p.id === postId);
                if (post) {
                    this.editPost(postId, postTitle, postExcerpt, post.content);
                } else {
                    console.error('❌ Post not found for editing:', postId);
                }
            }
            
            if (e.target.classList.contains('delete-post-btn')) {
                const postId = e.target.dataset.postId;
                this.confirmDelete(postId);
            }
        });

        // Admin panel toggle
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                this.toggleAdminPanel();
            });
        }

        // Admin form submissions
        const adminForm = document.getElementById('admin-post-form');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitPost(e);
            });
        }

        const editForm = document.getElementById('edit-post-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePost(e);
            });
        }

        // Cancel edit button
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Close edit modal button
        const closeEditModalBtn = document.getElementById('close-edit-modal');
        if (closeEditModalBtn) {
            closeEditModalBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Initialize rich text toolbar
        this.initializeRichTextToolbar();

        // Authentication button
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            authButton.addEventListener('click', () => {
                if (this.isAuthenticated) {
                    this.logout();
                } else {
                    this.showLoginModal();
                }
            });
        }

        // Create Post button
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                this.showCreatePostModal();
            });
        }

        // Close Create Post modal
        const closeCreateModalBtn = document.getElementById('close-create-modal');
        if (closeCreateModalBtn) {
            closeCreateModalBtn.addEventListener('click', () => {
                this.hideCreatePostModal();
            });
        }

        // Cancel Create Post button
        const cancelCreateBtn = document.getElementById('cancel-create-btn');
        if (cancelCreateBtn) {
            cancelCreateBtn.addEventListener('click', () => {
                this.hideCreatePostModal();
            });
        }

        // Debug Auth button
        const debugAuthBtn = document.getElementById('debug-auth');
        if (debugAuthBtn) {
            debugAuthBtn.addEventListener('click', () => {
                this.debugAuthStatus();
            });
        }

        // Login Modal Controls
        const closeLoginModalBtn = document.getElementById('close-login-modal');
        if (closeLoginModalBtn) {
            closeLoginModalBtn.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        const cancelLoginBtn = document.getElementById('cancel-login-btn');
        if (cancelLoginBtn) {
            cancelLoginBtn.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginForm();
            });
        }

        // YouTube video embedding functionality
        this.initializeYouTubeEmbedding();
        
        // Image upload functionality
        this.initializeImageUploads();
        
        // Debug: Check if image upload elements exist
        console.log('🔍 Checking image upload elements...');
        console.log('📁 Create form image upload:', document.getElementById('image-upload'));
        console.log('📁 Create form upload button:', document.getElementById('upload-image-btn'));
        console.log('📁 Edit form image upload:', document.getElementById('edit-image-upload'));
        console.log('📁 Edit form upload button:', document.getElementById('edit-upload-image-btn'));
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting login with email:', email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('✅ Login successful, user data:', data);
            this.showMessage('Login successful!', 'success');
            
            // The auth state change listener will handle updating the UI
            // But we can also manually refresh to ensure consistency
            setTimeout(() => {
                console.log('🔄 Manual auth refresh after login');
                this.refreshAuth();
                // Force re-render posts to show admin buttons
                this.renderPosts();
            }, 100);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showMessage('Login failed: ' + error.message, 'error');
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (!modal) return;

        // Clear any previous input
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';

        // Show the modal
        modal.classList.remove('hidden');
        
        // Focus on email field
        document.getElementById('login-email').focus();

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLoginModal();
            }
        });
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleLoginForm() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showMessage('Please enter both email and password.', 'error');
            return;
        }

        // Perform login
        this.login(email, password);
        
        // Hide the modal after login attempt
        this.hideLoginModal();
    }

    updateAuthButton() {
        const authButton = document.getElementById('auth-button');
        if (!authButton) return;

        if (this.isAuthenticated) {
            authButton.textContent = 'Logout';
            authButton.className = 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors';
        } else {
            authButton.textContent = 'Login';
            authButton.className = 'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors';
        }
    }

    async logout() {
        try {
            // Check if we actually have a session before trying to sign out
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                // No active session, just clear local state
                console.log('ℹ️ No active session found, clearing local state');
                this.currentUser = null;
                this.isAuthenticated = false;
                this.hideAdminFeatures();
                this.updateAuthButton();
                this.showMessage('Already logged out', 'info');
                return;
            }
            
            // Perform the actual logout
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.showMessage('Logout successful!', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if logout fails, clear local state
            this.currentUser = null;
            this.isAuthenticated = false;
            this.hideAdminFeatures();
            this.updateAuthButton();
            
            this.showMessage('Logout completed (cleared local state)', 'info');
        }
    }

    async refreshAuth() {
        console.log('🔄 Manually refreshing authentication state...');
        await this.checkAuthStatus();
    }

    renderPosts() {
        const container = document.getElementById('blog-posts-container');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">No posts found.</p>';
            return;
        }

        const postsHtml = this.posts.map(post => this.renderPost(post)).join('');
        console.log('🎯 Final posts HTML:', postsHtml.substring(0, 500) + '...');
        container.innerHTML = postsHtml;
        
        // Debug: Check if YouTube embeds are in the DOM
        setTimeout(() => {
            const iframes = container.querySelectorAll('iframe');
            console.log('🔍 Found iframes in DOM:', iframes.length);
            iframes.forEach((iframe, index) => {
                console.log(`🎬 Iframe ${index}:`, iframe.outerHTML.substring(0, 200));
            });
        }, 100);
    }

    renderPost(post) {
        const date = new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const categories = post.categories ? post.categories.map(cat => 
            `<span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">${cat}</span>`
        ).join('') : '';

        console.log('🔍 Rendering post:', post.title);
        console.log('🔐 Authentication status:', this.isAuthenticated);
        console.log('👤 Current user:', this.currentUser);
        
        const adminButtons = this.isAuthenticated ? `
            <div class="admin-buttons-container">
                <button class="edit-post-btn" 
                        data-post-id="${post.id}" data-post-title="${this.escapeHtml(post.title)}" data-post-excerpt="${this.escapeHtml(post.excerpt || '')}">
                    Edit
                </button>
                <button class="delete-post-btn" 
                        data-post-id="${post.id}">
                    Delete
                </button>
            </div>
        ` : '';

        console.log('🔘 Admin buttons HTML:', adminButtons);

        const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedContent = this.formatContent(post.content);
        console.log('🎯 Post content before formatting:', post.content.substring(0, 200) + '...');
        console.log('🎯 Post content after formatting:', formattedContent.substring(0, 200) + '...');
        
        const postHtml = `
            <article class="blog-post bg-white rounded-xl p-6 mb-6 shadow-sm">
                <div class="mb-4">
                    <time class="text-sm text-gray-500">${formattedDate}</time>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3" style="word-wrap: break-word; overflow-wrap: break-word;">${post.title}</h3>
                ${post.excerpt ? `<p class="text-gray-600 mb-4" style="word-wrap: break-word; overflow-wrap: break-word;">${post.excerpt}</p>` : ''}
                
                <!-- Display categories if they exist -->
                ${this.renderPostCategories(post)}
                
                <div class="prose max-w-none" style="word-wrap: break-word; overflow-wrap: break-word;">
                    ${formattedContent}
                </div>
                
                ${adminButtons}
            </article>
        `;

        return postHtml;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatContent(content) {
        if (!content) return '';
        
        console.log('🔍 Formatting content:', content.substring(0, 200) + '...');
        
        // Clean up any existing filename paragraphs from old image embeds
        let cleanedContent = content.replace(/<p class="text-sm text-gray-500 mt-2 text-center">[^<]*<\/p>/g, '');
        console.log('🧹 Cleaned up filename paragraphs');
        
        // Check if content contains HTML (like YouTube embeds or images)
        if (cleanedContent.includes('<div class="youtube-embed') || cleanedContent.includes('<iframe') || cleanedContent.includes('<div class="image-embed') || cleanedContent.includes('<img')) {
            console.log('🎥 Found HTML content (YouTube embed, iframe, or image)');
            
            // Handle YouTube embeds
            if (cleanedContent.includes('<div class="youtube-embed') || cleanedContent.includes('<iframe')) {
                console.log('🎬 Processing YouTube embeds');
                const parts = cleanedContent.split(/(<div class="youtube-embed.*?<\/div>)/s);
                let formattedContent = '';
                
                parts.forEach((part, index) => {
                    if (part.trim().startsWith('<div class="youtube-embed')) {
                        console.log(`🎬 Part ${index} is YouTube embed:`, part.substring(0, 100) + '...');
                        // This is a YouTube embed, keep it as-is
                        formattedContent += part;
                    } else if (part.trim()) {
                        // This is regular text, format it normally
                        const paragraphs = part.split(/\n\n+/);
                        const formattedParagraphs = paragraphs.map(paragraph => {
                            if (paragraph.trim()) {
                                const withBreaks = paragraph.replace(/\n/g, '<br>');
                                return `<p class="mb-4 leading-relaxed" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${withBreaks}</p>`;
                            }
                            return '';
                        }).filter(p => p);
                        formattedContent += formattedParagraphs.join('');
                    }
                });
                
                console.log('✅ Final formatted content with YouTube:', formattedContent.substring(0, 200) + '...');
                return formattedContent;
            }
            
            // Handle image embeds
            if (cleanedContent.includes('<div class="image-embed') || cleanedContent.includes('<img')) {
                console.log('🖼️ Processing image embeds');
                const parts = cleanedContent.split(/(<div class="image-embed.*?<\/div>)/s);
                let formattedContent = '';
                
                parts.forEach((part, index) => {
                    if (part.trim().startsWith('<div class="image-embed')) {
                        console.log(`🖼️ Part ${index} is image embed:`, part.substring(0, 100) + '...');
                        // This is an image embed, keep it as-is
                        formattedContent += part;
                    } else if (part.trim()) {
                        // This is regular text, format it normally
                        const paragraphs = part.split(/\n\n+/);
                        const formattedParagraphs = paragraphs.map(paragraph => {
                            if (paragraph.trim()) {
                                const withBreaks = paragraph.replace(/\n/g, '<br>');
                                return `<p class="mb-4 leading-relaxed" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${withBreaks}</p>`;
                            }
                            return '';
                        }).filter(p => p);
                        formattedContent += formattedParagraphs.join('');
                    }
                });
                
                console.log('✅ Final formatted content with images:', formattedContent.substring(0, 200) + '...');
                return formattedContent;
            }
            
            // Fallback for other HTML content
            console.log('📝 Mixed HTML content, formatting with HTML preservation');
            const parts = cleanedContent.split(/(<[^>]+>.*?<\/[^>]+>)/s);
            let formattedContent = '';
            
            parts.forEach((part, index) => {
                if (part.trim().startsWith('<') && part.trim().endsWith('>')) {
                    console.log(`🔧 Part ${index} is HTML:`, part.substring(0, 100) + '...');
                    // This is HTML, keep it as-is
                    formattedContent += part;
                } else if (part.trim()) {
                    // This is regular text, format it normally
                    const paragraphs = part.split(/\n\n+/);
                    const formattedParagraphs = paragraphs.map(paragraph => {
                        if (paragraph.trim()) {
                            const withBreaks = paragraph.replace(/\n/g, '<br>');
                            return `<p class="mb-4 leading-relaxed" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${withBreaks}</p>`;
                        }
                        return '';
                    }).filter(p => p);
                    formattedContent += formattedParagraphs.join('');
                }
            });
            
            console.log('✅ Final formatted content with mixed HTML:', formattedContent.substring(0, 200) + '...');
            return formattedContent;
        } else {
            console.log('📝 Regular text content, formatting normally');
            // Regular text content, format as before
            const paragraphs = cleanedContent.split(/\n\n+/);
            const formattedParagraphs = paragraphs.map(paragraph => {
                if (paragraph.trim()) {
                    const withBreaks = paragraph.replace(/\n/g, '<br>');
                    return `<p class="mb-4 leading-relaxed" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${withBreaks}</p>`;
                }
                return '';
            }).filter(p => p);
            
            return formattedParagraphs.join('');
        }
    }

    renderPagination() {
        const container = document.getElementById('blog-pagination');
        if (!container) return;

        const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex justify-center space-x-2">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="pagination-link px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors" 
                        data-page="${this.currentPage - 1}">
                    Previous
                </button>
            `;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `
                    <span class="px-3 py-2 bg-theme-accent text-white rounded">
                        ${i}
                    </span>
                `;
            } else {
                paginationHTML += `
                    <button class="pagination-link px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-link px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors" 
                        data-page="${this.currentPage + 1}">
                    Next
                </button>
            `;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }

    toggleAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.toggle('hidden');
        }
    }

    editPost(postId, postTitle, postExcerpt, postContent) {
        console.log('✏️ Editing post:', { postId, postTitle, postExcerpt, postContent });
        
        const editModal = document.getElementById('edit-post-modal');
        const editButton = document.querySelector(`[data-post-id="${postId}"].edit-post-btn`);
        
        if (!editModal || !editButton) {
            console.error('❌ Edit modal or button not found');
            return;
        }

        // Populate form fields
        document.getElementById('edit-post-id').value = postId;
        document.getElementById('edit-post-title').value = postTitle;
        document.getElementById('edit-post-excerpt').value = postExcerpt;
        document.getElementById('edit-post-content').value = postContent;

        // Populate and set categories
        this.populateCategoriesDropdown('edit-post-categories');
        
        // Get current post categories and set them as selected
        this.setSelectedCategories(postId, 'edit-post-categories');

        // Show modal
        editModal.classList.remove('hidden');
        
        // Focus on title field
        document.getElementById('edit-post-title').focus();
    }

    async submitPost(event) {
        event.preventDefault();
        
        if (!this.isAuthenticated) {
            this.showMessage('You must be logged in to create posts.', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const title = formData.get('title');
        const excerpt = formData.get('excerpt');
        const content = formData.get('content');
        const categoriesSelect = document.getElementById('post-categories');
        
        if (!title || !content) {
            this.showMessage('Title and content are required.', 'error');
            return;
        }

        try {
            // Create the blog post
            const { data: post, error: postError } = await this.supabase
                .from('blog_posts')
                .insert({
                    title,
                    excerpt,
                    content,
                    slug: this.createSlug(title),
                    status: 'published',
                    published_at: new Date().toISOString(),
                    author_id: this.currentUser.id
                })
                .select()
                .single();

            if (postError) throw postError;

            // Handle categories if any are selected
            if (categoriesSelect && categoriesSelect.selectedOptions.length > 0) {
                const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);
                
                // Create post-category relationships
                const categoryRelations = selectedCategories.map(categoryId => ({
                    post_id: post.id,
                    category_id: categoryId
                }));

                const { error: categoryError } = await this.supabase
                    .from('blog_post_categories')
                    .insert(categoryRelations);

                if (categoryError) {
                    console.error('❌ Error creating category relationships:', categoryError);
                    // Post was created but categories failed - still show success
                }
            }

            this.showMessage('Post created successfully!', 'success');
            this.hideCreatePostModal();
            this.loadPosts(); // Refresh the posts list
            
        } catch (error) {
            console.error('❌ Error creating post:', error);
            this.showMessage('Error creating post: ' + error.message, 'error');
        }
    }

    async updatePost(event) {
        event.preventDefault();
        
        if (!this.isAuthenticated) {
            this.showMessage('You must be logged in to update posts.', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const postId = formData.get('id');
        const title = formData.get('title');
        const excerpt = formData.get('excerpt');
        const content = formData.get('content');
        const categoriesSelect = document.getElementById('edit-post-categories');
        
        if (!title || !content) {
            this.showMessage('Title and content are required.', 'error');
            return;
        }

        try {
            // Update the blog post
            const { error: postError } = await this.supabase
                .from('blog_posts')
                .update({
                    title,
                    excerpt,
                    content,
                    slug: this.createSlug(title),
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId);

            if (postError) throw postError;

            // Handle categories update
            if (categoriesSelect) {
                // First, remove existing category relationships
                const { error: deleteError } = await this.supabase
                    .from('blog_post_categories')
                    .delete()
                    .eq('post_id', postId);

                if (deleteError) {
                    console.error('❌ Error deleting old category relationships:', deleteError);
                }

                // Then create new category relationships if any are selected
                if (categoriesSelect.selectedOptions.length > 0) {
                    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);
                    
                    const categoryRelations = selectedCategories.map(categoryId => ({
                        post_id: postId,
                        category_id: categoryId
                    }));

                    const { error: categoryError } = await this.supabase
                        .from('blog_post_categories')
                        .insert(categoryRelations);

                    if (categoryError) {
                        console.error('❌ Error creating new category relationships:', categoryError);
                    }
                }
            }

            this.showMessage('Post updated successfully!', 'success');
            
            // Update the local post data immediately
            const postIndex = this.posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.posts[postIndex] = {
                    ...this.posts[postIndex],
                    title,
                    excerpt,
                    content,
                    slug: this.createSlug(title),
                    updated_at: new Date().toISOString()
                };
                console.log('✅ Local post data updated immediately');
            }
            
            // Hide the edit modal
            const editModal = document.getElementById('edit-post-modal');
            if (editModal) {
                editModal.classList.add('hidden');
            }
            
            // Refresh the posts display immediately
            this.renderPosts();
            console.log('✅ Posts display refreshed immediately');
            
        } catch (error) {
            console.error('❌ Error updating post:', error);
            this.showMessage('Error updating post: ' + error.message, 'error');
        }
    }

    cancelEdit() {
        const editModal = document.getElementById('edit-post-modal');
        
        if (editModal) {
            editModal.classList.add('hidden');
        }
        
        // Reset the form
        const editForm = document.getElementById('edit-post-form');
        if (editForm) {
            editForm.reset();
        }
    }

    async confirmDelete(postId) {
        if (!this.isAuthenticated) {
            this.showMessage('You must be logged in to delete posts', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this post?')) {
            try {
                const { error } = await this.supabase
                    .from('blog_posts')
                    .delete()
                    .eq('id', postId);

                if (error) throw error;

                this.showMessage('Post deleted successfully!', 'success');
                this.loadPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                this.showMessage('Error deleting post: ' + error.message, 'error');
            }
        }
    }

    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    showMessage(message, type = 'info') {
        // Simple message display - you can enhance this
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // You could add a toast notification system here
        alert(message);
    }

    // Force refresh admin buttons visibility
    forceRefreshAdminButtons() {
        console.log('🔄 Force refreshing admin buttons visibility');
        
        if (this.isAuthenticated) {
            // Find all admin buttons and force them to be visible
            const adminButtons = document.querySelectorAll('.admin-only.show');
            adminButtons.forEach(button => {
                button.style.display = 'flex';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
                console.log('✅ Force showed admin button:', button);
            });
        }
    }

    // Initialize rich text toolbar functionality
    initializeRichTextToolbar() {
        console.log('🛠️ Initializing rich text toolbar...');
        
        // Add event listeners to all format buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.format-btn')) {
                const button = e.target.closest('.format-btn');
                const format = button.dataset.format;
                const textarea = this.getActiveTextarea();
                
                if (textarea && format) {
                    this.applyFormatting(textarea, format);
                }
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const textarea = this.getActiveTextarea();
                if (!textarea) return;

                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.applyFormatting(textarea, 'bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormatting(textarea, 'italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormatting(textarea, 'underline');
                        break;
                }
            }
        });
    }

    // Get the currently active textarea (create or edit)
    getActiveTextarea() {
        const createTextarea = document.getElementById('post-content');
        const editTextarea = document.getElementById('edit-post-content');
        
        if (editTextarea && !editTextarea.classList.contains('hidden')) {
            return editTextarea;
        }
        if (createTextarea && !createTextarea.classList.contains('hidden')) {
            return createTextarea;
        }
        return null;
    }

    // Apply formatting to selected text
    applyFormatting(textarea, format) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (!selectedText) {
            this.showMessage('Please select some text to format', 'info');
            return;
        }

        let formattedText = '';
        let cursorOffset = 0;

        switch (format) {
            case 'bold':
                formattedText = `<strong>${selectedText}</strong>`;
                cursorOffset = 8; // <strong></strong> = 8 characters
                break;
            case 'italic':
                formattedText = `<em>${selectedText}</em>`;
                cursorOffset = 4; // <em></em> = 4 characters
                break;
            case 'underline':
                formattedText = `<u>${selectedText}</u>`;
                cursorOffset = 3; // <u></u> = 3 characters
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    // Ensure URL has proper protocol
                    let formattedUrl = url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        formattedUrl = 'https://' + url;
                    }
                    formattedText = `<a href="${formattedUrl}" target="_blank">${selectedText}</a>`;
                    cursorOffset = 9 + formattedUrl.length; // <a href="url" target="_blank"></a>
                } else {
                    return;
                }
                break;
            case 'quote':
                formattedText = `<blockquote>${selectedText}</blockquote>`;
                cursorOffset = 13; // <blockquote></blockquote> = 13 characters
                break;
            case 'list':
                formattedText = `<ul><li>${selectedText}</li></ul>`;
                cursorOffset = 9; // <ul><li></li></ul> = 9 characters
                break;
            case 'code':
                formattedText = `<code>${selectedText}</code>`;
                cursorOffset = 6; // <code></code> = 6 characters
                break;
            default:
                return;
        }

        // Replace selected text with formatted text
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);
        textarea.value = beforeText + formattedText + afterText;

        // Set cursor position after the formatted text
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();

        // Show live preview
        this.updateLivePreview(textarea);
        
        console.log(`✅ Applied ${format} formatting to: "${selectedText}"`);
    }

    // Update live preview (optional - could be enhanced with a preview pane)
    updateLivePreview(textarea) {
        // For now, just log the formatted content
        // In the future, this could update a separate preview pane
        console.log('📝 Live preview updated:', textarea.value.substring(0, 100) + '...');
    }

    // Populate categories dropdown with available categories
    populateCategoriesDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        // Clear existing options
        dropdown.innerHTML = '';

        // Add categories from this.categories
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
    }

    // Set selected categories for the edit form
    setSelectedCategories(postId, dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        // Query the junction table to get post categories
        this.supabase
            .from('blog_post_categories')
            .select('category_id')
            .eq('post_id', postId)
            .then(result => {
                if (result.data) {
                    const selectedCategoryIds = result.data.map(item => item.category_id);
                    
                    // Set selected options in dropdown
                    Array.from(dropdown.options).forEach(option => {
                        if (selectedCategoryIds.includes(option.value)) {
                            option.selected = true;
                        }
                    });
                }
            })
            .catch(error => {
                console.error('❌ Error fetching post categories for edit:', error);
            });
    }

    // Modal control methods
    showCreatePostModal() {
        const modal = document.getElementById('create-post-modal');
        if (!modal) return;

        // Populate categories dropdown
        this.populateCategoriesDropdown('post-categories');

        modal.classList.remove('hidden');
        document.getElementById('post-title').focus();

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCreatePostModal();
            }
        });
    }

    hideCreatePostModal() {
        console.log('❌ Hiding create post modal');
        const modal = document.getElementById('create-post-modal');
        if (modal) {
            modal.classList.add('hidden');
            // Clear form
            this.clearCreatePostForm();
        }
    }

    clearCreatePostForm() {
        const form = document.getElementById('admin-post-form');
        if (form) {
            form.reset();
        }
    }

    debugAuthStatus() {
        console.log('🔄 Debugging authentication status...');
        console.log('🔍 Current User:', this.currentUser);
        console.log('🔐 Authentication Status:', this.isAuthenticated);
        this.debugAdminElements();
        
        // Try to manually show admin features
        if (this.isAuthenticated) {
            console.log('🔓 Attempting to manually show admin features...');
            this.showAdminFeatures();
            this.forceRefreshAdminButtons();
        }
    }

    // Render archives based on actual post dates
    renderArchives() {
        const archivesContainer = document.querySelector('.archives-section');
        if (!archivesContainer) return;

        // Extract unique years from posts
        const years = [...new Set(this.posts.map(post => {
            const date = new Date(post.published_at);
            return date.getFullYear();
        }))].sort((a, b) => b - a); // Sort descending (newest first)

        if (years.length === 0) {
            archivesContainer.innerHTML = '<p class="text-theme-subtle-text text-xs md:text-sm">No posts yet</p>';
            return;
        }

        const archivesHtml = years.map(year => 
            `<a href="#" class="text-theme-subtle-text hover:text-theme-accent transition duration-200 text-xs md:text-sm" data-year="${year}">${year}</a>`
        ).join('');

        archivesContainer.innerHTML = archivesHtml;
    }

    // Render categories based on actual post categories
    renderSidebarCategories() {
        const categoriesContainer = document.querySelector('.sidebar-categories-section');
        if (!categoriesContainer) return;

        if (this.categories.length === 0) {
            categoriesContainer.innerHTML = '<p class="text-theme-subtle-text text-xs md:text-sm">No categories yet</p>';
            return;
        }

        // Add "All" category at the beginning
        const allCategory = { id: 'all', name: 'All Posts', slug: 'all' };
        const allCategories = [allCategory, ...this.categories];

        const categoriesHtml = allCategories.map(category => {
            const isActive = (category.id === 'all' && !this.currentCategory) || 
                           (category.id !== 'all' && this.currentCategory === category.id);
            
            return `
                <a href="#" class="category-pill text-theme-subtle-text hover:text-theme-accent transition duration-200 text-xs md:text-sm ${
                    isActive
                        ? 'text-theme-accent font-semibold'
                        : ''
                }" data-category="${category.id}">
                    ${category.name}
                </a>
            `;
        }).join('');

        categoriesContainer.innerHTML = categoriesHtml;
    }

    // Show all posts (clear filters)
    showAllPosts() {
        console.log('🔄 Showing all posts');
        this.currentCategory = null;
        this.currentPage = 1;
        this.loadPosts();
    }

    // Filter posts by year
    filterPostsByYear(year) {
        console.log('📅 Filtering posts by year:', year);
        
        // Filter posts by the selected year
        const filteredPosts = this.posts.filter(post => {
            const postYear = new Date(post.published_at).getFullYear();
            return postYear === year;
        });
        
        // Update the display with filtered posts
        this.renderFilteredPosts(filteredPosts, `Posts from ${year}`);
    }

    // Render filtered posts
    renderFilteredPosts(posts, title) {
        const container = document.getElementById('blog-posts-container');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <h3 class="text-lg font-medium text-gray-500 mb-2">${title}</h3>
                    <p class="text-gray-400">No posts found for this selection.</p>
                </div>
            `;
            return;
        }

        const postsHtml = posts.map(post => this.renderPost(post)).join('');
        container.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-700">${title}</h3>
                <button onclick="blogManager.showAllPosts()" class="text-theme-accent hover:text-theme-accent-hover text-sm font-medium">
                    ← Show All Posts
                </button>
            </div>
            ${postsHtml}
        `;
    }

    renderPostCategories(post) {
        if (!post.blog_post_categories || post.blog_post_categories.length === 0) {
            return '';
        }

        const categoriesHtml = post.blog_post_categories.map(cat => 
            `<span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2 mb-2">${cat.blog_categories.name}</span>`
        ).join('');

        return `<div class="flex flex-wrap items-center gap-2 mb-4">${categoriesHtml}</div>`;
    }

    // YouTube embedding functionality
    initializeYouTubeEmbedding() {
        // Create post form
        const addVideoBtn = document.getElementById('add-video-btn');
        const youtubeUrlInput = document.getElementById('youtube-url');
        
        if (addVideoBtn && youtubeUrlInput) {
            addVideoBtn.addEventListener('click', () => {
                this.addYouTubeVideo('youtube-url', 'post-content');
            });
        }

        // Edit post form
        const editAddVideoBtn = document.getElementById('edit-add-video-btn');
        const editYoutubeUrlInput = document.getElementById('edit-youtube-url');
        
        if (editAddVideoBtn && editYoutubeUrlInput) {
            editAddVideoBtn.addEventListener('click', () => {
                this.addYouTubeVideo('edit-youtube-url', 'edit-post-content');
            });
        }
    }

    addYouTubeVideo(urlInputId, contentTextareaId) {
        const urlInput = document.getElementById(urlInputId);
        const contentTextarea = document.getElementById(contentTextareaId);
        
        if (!urlInput || !contentTextarea) return;

        const youtubeUrl = urlInput.value.trim();
        if (!youtubeUrl) {
            this.showMessage('Please enter a YouTube URL', 'error');
            return;
        }

        // Extract video ID from various YouTube URL formats
        const videoId = this.extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
            this.showMessage('Invalid YouTube URL. Please use a valid YouTube video link.', 'error');
            return;
        }

        // Create embed HTML with fallback
        const embedHtml = `
<div class="youtube-embed my-4">
    <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg"
            loading="lazy"
            title="YouTube video player"
            sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        ></iframe>
        <div class="youtube-fallback absolute top-0 left-0 w-full h-full rounded-lg bg-gray-900 flex items-center justify-center cursor-pointer" 
             style="display: none; background-image: url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg'); background-size: cover; background-position: center;"
             onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
            <div class="bg-black bg-opacity-50 rounded-full p-4">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        </div>
    </div>
</div>
`;

        // Insert the embed HTML at cursor position or at the end
        const cursorPos = contentTextarea.selectionStart;
        const textBefore = contentTextarea.value.substring(0, cursorPos);
        const textAfter = contentTextarea.value.substring(cursorPos);
        
        contentTextarea.value = textBefore + embedHtml + textAfter;
        
        // Clear the URL input
        urlInput.value = '';
        
        // Show success message
        this.showMessage('YouTube video added successfully!', 'success');
        
        // Focus back to content area
        contentTextarea.focus();
        
        // Set cursor position after the embed
        const newCursorPos = cursorPos + embedHtml.length;
        contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
    }

    extractYouTubeVideoId(url) {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
            /youtu\.be\/([^?\n#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    showMessage(message, type = 'info') {
        // Create a simple message display
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Image upload functionality
    initializeImageUploads() {
        console.log('🖼️ Initializing image uploads...');
        
        // Create post form
        const uploadImageBtn = document.getElementById('upload-image-btn');
        const imageUploadInput = document.getElementById('image-upload');
        
        console.log('📁 Create form elements found:', {
            button: uploadImageBtn,
            input: imageUploadInput
        });
        
        if (uploadImageBtn && imageUploadInput) {
            console.log('✅ Adding click listener to create form upload button');
            uploadImageBtn.addEventListener('click', () => {
                console.log('🖼️ Create form upload button clicked!');
                this.handleImageUpload('image-upload', 'post-content');
            });
        } else {
            console.log('❌ Create form image upload elements not found');
        }

        // Edit post form
        const editUploadImageBtn = document.getElementById('edit-upload-image-btn');
        const editImageUploadInput = document.getElementById('edit-image-upload');
        
        console.log('📁 Edit form elements found:', {
            button: editUploadImageBtn,
            input: editImageUploadInput
        });
        
        if (editUploadImageBtn && editImageUploadInput) {
            console.log('✅ Adding click listener to edit form upload button');
            editUploadImageBtn.addEventListener('click', () => {
                console.log('🖼️ Edit form upload button clicked!');
                this.handleImageUpload('edit-image-upload', 'edit-post-content');
            });
        } else {
            console.log('❌ Edit form image upload elements not found');
        }
        
        console.log('🖼️ Image upload initialization complete');
    }

    async handleImageUpload(inputId, textareaId) {
        const fileInput = document.getElementById(inputId);
        const textarea = document.getElementById(textareaId);
        
        if (!fileInput || !textarea) {
            this.showMessage('Image upload elements not found', 'error');
            return;
        }

        const file = fileInput.files[0];
        if (!file) {
            this.showMessage('Please select an image file', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (10MB limit for Supabase Storage)
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('Image file size must be less than 10MB', 'error');
            return;
        }

        try {
            this.showMessage('Uploading image to Supabase Storage...', 'info');
            
            console.log('🖼️ Processing image:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            // Upload to Supabase Storage
            const imageUrl = await this.uploadImageToSupabase(file);
            
            console.log('☁️ Image uploaded to Supabase, URL:', imageUrl);
            
            // Create responsive image HTML
            const imageHtml = this.createImageEmbed(imageUrl, file.name);
            
            console.log('📝 Generated image HTML:', imageHtml.substring(0, 200) + '...');
            
            // Insert the image HTML at cursor position or at the end
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            
            textarea.value = textBefore + imageHtml + textAfter;
            
            console.log('✅ Image HTML inserted into textarea');
            console.log('📋 New textarea content length:', textarea.value.length);
            
            // Clear the file input
            fileInput.value = '';
            
            // Show success message
            this.showMessage('Image uploaded successfully!', 'success');
            
            // Focus back to content area
            textarea.focus();
            
            // Set cursor position after the image
            const newCursorPos = cursorPos + imageHtml.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            this.showMessage('Error uploading image: ' + error.message, 'error');
        }
    }

    async uploadImageToSupabase(file) {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `blog-image-${timestamp}.${fileExtension}`;
        
        console.log('📁 Uploading file:', fileName);
        
        // Upload to Supabase Storage
        const { data, error } = await this.supabase.storage
            .from('blog-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('❌ Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
        
        // Get public URL
        const { data: urlData } = this.supabase.storage
            .from('blog-images')
            .getPublicUrl(fileName);
        
        console.log('🔗 Public URL generated:', urlData.publicUrl);
        return urlData.publicUrl;
    }

    createImageEmbed(imageUrl, filename) {
        return `
<div class="image-embed my-4">
    <img src="${imageUrl}" alt="${filename}" class="w-full max-w-full h-auto rounded-lg shadow-md" loading="lazy">
</div>
`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing BlogManager...');
    window.blogManager = new BlogManager();
});

// Global functions for debugging (can be removed in production)
window.refreshAuth = function() {
    console.log('🔄 Manually refreshing authentication...');
    if (window.blogManager) {
        window.blogManager.refreshAuth();
    } else {
        console.log('❌ BlogManager not found');
    }
};
