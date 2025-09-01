 document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const themeToggle = document.getElementById('themeToggle');
            const menuBtn = document.getElementById('menu-btn');
            const closeSidebar = document.getElementById('close-sidebar');
            const overlay = document.getElementById('overlay');
            const sidebar = document.getElementById('sidebar');
            const categorySearch = document.getElementById('categorySearch');
            const countrySelect = document.getElementById('countrySelect');
            const videoCount = document.getElementById('videoCount');
            const videosGrid = document.getElementById('videosGrid');
            const categoriesGrid = document.getElementById('categoriesGrid');
            const noCategories = document.getElementById('noCategories');
            const loadingVideos = document.getElementById('loadingVideos');
            const errorVideos = document.getElementById('errorVideos');
            const noVideos = document.getElementById('noVideos');
            const newPlaylistInput = document.getElementById('new-playlist-name');
            const createPlaylistBtn = document.getElementById('create-playlist-btn');
            const userPlaylistsContainer = document.getElementById('user-playlists');
            const viewFavorites = document.getElementById('viewFavorites');
            const loginBtn = document.getElementById('login-btn');
            const signupBtn = document.getElementById('signup-btn');
            const authModal = document.getElementById('authModal');
            const closeAuthModal = document.getElementById('closeAuthModal');
            const authTabs = document.querySelectorAll('.auth-tab');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const authSwitchBtn = document.getElementById('auth-switch-btn');
            const authSwitchText = document.getElementById('auth-switch-text');
            const authModalTitle = document.getElementById('authModalTitle');
            const authPromptModal = document.getElementById('authPromptModal');
            const closeAuthPrompt = document.getElementById('closeAuthPrompt');
            const promptLogin = document.getElementById('promptLogin');
            const promptSignup = document.getElementById('promptSignup');
            const videoModal = document.getElementById('videoModal');
            const closeModalBtn = document.getElementById('closeModal');
            const addFavorite = document.getElementById('addFavorite');
            const openYoutube = document.getElementById('openYoutube');

            // State
            let isAuthenticated = false;
            let currentCategory = '';
            let currentRegion = 'US';
            let currentVideoCount = 5;

            // Modal Handling
            const hideModal = (modalId) => {
                document.getElementById(modalId).style.display = 'none';
                if (modalId === 'videoModal') {
                    document.getElementById('modalVideo').src = '';
                }
            };

            const openModal = (modalId) => {
                document.getElementById(modalId).style.display = 'flex';
            };

            // Sidebar Toggle
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                overlay.classList.toggle('show');
            });

            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            // Theme Toggle
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
            });

            // Auth Handling
            loginBtn.addEventListener('click', () => {
                if (isAuthenticated) {
                    isAuthenticated = false;
                    loginBtn.textContent = 'Login';
                    signupBtn.style.display = 'block';
                    alert('Logged out');
                } else {
                    openModal('authModal');
                    authTabs.forEach(t => t.getAttribute('data-tab') === 'login' ? t.classList.add('active') : t.classList.remove('active'));
                    loginForm.style.display = 'flex';
                    signupForm.style.display = 'none';
                    authModalTitle.textContent = 'Login to Your Account';
                    authSwitchText.textContent = "Don't have an account?";
                    authSwitchBtn.textContent = 'Sign up';
                }
            });

            signupBtn.addEventListener('click', () => {
                openModal('authModal');
                authTabs.forEach(t => t.getAttribute('data-tab') === 'signup' ? t.classList.add('active') : t.classList.remove('active'));
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
                authModalTitle.textContent = 'Create an Account';
                authSwitchText.textContent = 'Already have an account?';
                authSwitchBtn.textContent = 'Login';
            });

            closeAuthModal.addEventListener('click', () => hideModal('authModal'));

            authTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabType = tab.getAttribute('data-tab');
                    authTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    if (tabType === 'login') {
                        loginForm.style.display = 'flex';
                        signupForm.style.display = 'none';
                        authModalTitle.textContent = 'Login to Your Account';
                        authSwitchText.textContent = "Don't have an account?";
                        authSwitchBtn.textContent = 'Sign up';
                    } else {
                        loginForm.style.display = 'none';
                        signupForm.style.display = 'flex';
                        authModalTitle.textContent = 'Create an Account';
                        authSwitchText.textContent = 'Already have an account?';
                        authSwitchBtn.textContent = 'Login';
                    }
                });
            });

            authSwitchBtn.addEventListener('click', () => {
                const currentTab = authTabs[0].classList.contains('active') ? 'signup' : 'login';
                authTabs.forEach(t => {
                    if (t.getAttribute('data-tab') === currentTab) t.click();
                });
            });

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    if (response.ok) {
                        isAuthenticated = true;
                        hideModal('authModal');
                        loginBtn.textContent = 'Logout';
                        signupBtn.style.display = 'none';
                        alert('Login successful');
                    } else {
                        alert('Login failed');
                    }
                } catch (error) {
                    alert('Error during login');
                }
            });

            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirm = document.getElementById('signup-confirm').value;
                if (password !== confirm) {
                    alert('Passwords do not match');
                    return;
                }
                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: name, email, password })
                    });
                    if (response.ok) {
                        isAuthenticated = true;
                        hideModal('authModal');
                        loginBtn.textContent = 'Logout';
                        signupBtn.style.display = 'none';
                        alert('Sign up successful');
                    } else {
                        alert('Sign up failed');
                    }
                } catch (error) {
                    alert('Error during sign up');
                }
            });

            closeAuthPrompt.addEventListener('click', () => hideModal('authPromptModal'));

            promptLogin.addEventListener('click', () => {
                hideModal('authPromptModal');
                openModal('authModal');
                authTabs.forEach(t => t.getAttribute('data-tab') === 'login' ? t.classList.add('active') : t.classList.remove('active'));
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';
                authModalTitle.textContent = 'Login to Your Account';
                authSwitchText.textContent = "Don't have an account?";
                authSwitchBtn.textContent = 'Sign up';
            });

            promptSignup.addEventListener('click', () => {
                hideModal('authPromptModal');
                openModal('authModal');
                authTabs.forEach(t => t.getAttribute('data-tab') === 'signup' ? t.classList.add('active') : t.classList.remove('active'));
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
                authModalTitle.textContent = 'Create an Account';
                authSwitchText.textContent = 'Already have an account?';
                authSwitchBtn.textContent = 'Login';
            });

            // Video Modal Handling
            closeModalBtn.addEventListener('click', () => hideModal('videoModal'));
            videoModal.addEventListener('click', (e) => {
                if (e.target === videoModal || e.target.classList.contains('modal-overlay')) {
                    hideModal('videoModal');
                }
            });

            // Categories
            async function loadCategories() {
                try {
                    const response = await fetch('/api/categories');
                    const categories = await response.json();
                    categoriesGrid.innerHTML = categories.map(category => `
                        <button class="category-btn" data-category="${category.id}">${category.name}</button>
                    `).join('');
                    document.querySelectorAll('.category-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            currentCategory = button.dataset.category;
                            categorySearch.value = button.textContent;
                            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                            button.classList.add('active');
                            loadTrendingVideos();
                        });
                    });
                    filterCategories();
                } catch (error) {
                    noCategories.style.display = 'block';
                }
            }

            function filterCategories() {
                const searchTerm = categorySearch.value.toLowerCase();
                const categoryButtons = categoriesGrid.querySelectorAll('.category-btn');
                let visibleCount = 0;
                categoryButtons.forEach(button => {
                    const categoryText = button.textContent.toLowerCase();
                    button.style.display = categoryText.includes(searchTerm) ? 'block' : 'none';
                    if (categoryText.includes(searchTerm)) visibleCount++;
                });
                noCategories.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            // Trending Videos
            async function loadTrendingVideos() {
                loadingVideos.style.display = 'block';
                errorVideos.style.display = 'none';
                noVideos.style.display = 'none';
                videosGrid.innerHTML = '';
                try {
                    const response = await fetch(`/api/trending?category=${encodeURIComponent(currentCategory)}&country=${encodeURIComponent(currentRegion)}&count=${currentVideoCount}`);
                    const videos = await response.json();
                    videosGrid.innerHTML = videos.map(video => `
                        <div class="video-card" data-video-id="${video.videoId}">
                            <div class="video-thumbnail-container">
                                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                ${video.isShort ? '<span class="video-badge">SHORT</span>' : ''}
                                <div class="video-duration">
                                    <svg class="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    ${video.duration}
                                </div>
                            </div>
                            <div class="video-content">
                                <h3 class="video-title">${video.title}</h3>
                                <p class="video-channel">${video.channel}</p>
                                <div class="video-stats">
                                    <span class="stat-item">
                                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        ${video.views}
                                    </span>
                                    <span class="stat-item">
                                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                        </svg>
                                        ${video.likes}
                                    </span>
                                </div>
                                <div class="video-actions">
                                    <button class="action-btn favorite-btn ${video.isFavorited ? 'favorited' : ''}" data-video-id="${video.videoId}">
                                        <i class="fas fa-heart"></i> ${video.isFavorited ? 'Favorited' : 'Favorite'}
                                    </button>
                                    <button class="action-btn add-to-playlist-btn" data-video-id="${video.videoId}">
                                        <i class="fas fa-plus"></i> Add to Playlist
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    document.querySelectorAll('.video-card').forEach(card => {
                        card.querySelector('.video-thumbnail-container').addEventListener('click', () => {
                            const videoId = card.dataset.videoId;
                            openModal('videoModal');
                            document.getElementById('modalVideo').src = `https://www.youtube.com/embed/${videoId}`;
                            document.getElementById('modalTitle').textContent = card.querySelector('.video-title').textContent;
                            document.getElementById('modalChannel').textContent = card.querySelector('.video-channel').textContent;
                            document.getElementById('modalStats').textContent = `${card.querySelector('.video-stats').children[0].textContent} • ${card.querySelector('.video-stats').children[1].textContent}`;
                            openYoutube.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                            addFavorite.dataset.videoId = videoId;
                        });
                    });
                    document.querySelectorAll('.favorite-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                                openModal('authPromptModal');
                                return;
                            }
                            const videoId = button.dataset.videoId;
                            try {
                                const response = await fetch('/api/favorites', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        videoId,
                                        title: button.closest('.video-card').querySelector('.video-title').textContent
                                    })
                                });
                                if (response.ok) {
                                    button.classList.toggle('favorited');
                                    button.innerHTML = button.classList.contains('favorited') ?
                                        '<i class="fas fa-heart"></i> Favorited' :
                                        '<i class="fas fa-heart"></i> Favorite';
                                    alert('Favorite updated');
                                } else {
                                    alert('Failed to update favorite');
                                }
                            } catch (error) {
                                alert('Error updating favorite');
                            }
                        });
                    });
                    document.querySelectorAll('.add-to-playlist-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                                openModal('authPromptModal');
                                return;
                            }
                            const videoId = button.dataset.videoId;
                            const playlistItems = userPlaylistsContainer.querySelectorAll('.playlist-item');
                            if (playlistItems.length === 0) {
                                alert('Please create a playlist first!');
                                return;
                            }
                            const firstPlaylistId = playlistItems[0].dataset.id;
                            try {
                                const response = await fetch(`/api/playlists/${firstPlaylistId}/${videoId}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' }
                                });
                                if (response.ok) {
                                    alert('Added to playlist');
                                } else {
                                    alert('Failed to add to playlist');
                                }
                            } catch (error) {
                                alert('Error adding to playlist');
                            }
                        });
                    });
                    noVideos.style.display = videos.length ? 'none' : 'block';
                    loadingVideos.style.display = 'none';
                } catch (error) {
                    errorVideos.style.display = 'block';
                    loadingVideos.style.display = 'none';
                }
            }

            // Favorites
            viewFavorites.addEventListener('click', async () => {
                if (!isAuthenticated) {
                    openModal('authPromptModal');
                    return;
                }
                try {
                    const response = await fetch('/api/favorites');
                    const favorites = await response.json();
                    videosGrid.innerHTML = favorites.map(video => `
                        <div class="video-card" data-video-id="${video.videoId}">
                            <div class="video-thumbnail-container">
                                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                <div class="video-duration">
                                    <svg class="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    ${video.duration || 'N/A'}
                                </div>
                            </div>
                            <div class="video-content">
                                <h3 class="video-title">${video.title}</h3>
                                <p class="video-channel">${video.channel || 'Unknown'}</p>
                                <div class="video-stats">
                                    <span class="stat-item">
                                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        ${video.views || 'N/A'}
                                    </span>
                                    <span class="stat-item">
                                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                        </svg>
                                        ${video.likes || 'N/A'}
                                    </span>
                                </div>
                                <div class="video-actions">
                                    <button class="action-btn favorite-btn favorited" data-video-id="${video.videoId}">
                                        <i class="fas fa-heart"></i> Favorited
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    document.querySelectorAll('.video-card').forEach(card => {
                        card.querySelector('.video-thumbnail-container').addEventListener('click', () => {
                            const videoId = card.dataset.videoId;
                            openModal('videoModal');
                            document.getElementById('modalVideo').src = `https://www.youtube.com/embed/${videoId}`;
                            document.getElementById('modalTitle').textContent = card.querySelector('.video-title').textContent;
                            document.getElementById('modalChannel').textContent = card.querySelector('.video-channel').textContent;
                            document.getElementById('modalStats').textContent = `${card.querySelector('.video-stats').children[0].textContent} • ${card.querySelector('.video-stats').children[1].textContent}`;
                            openYoutube.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                            addFavorite.dataset.videoId = videoId;
                        });
                    });
                    document.querySelectorAll('.favorite-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const videoId = button.dataset.videoId;
                            try {
                                const response = await fetch(`/api/favorites/${videoId}`, {
                                    method: 'DELETE'
                                });
                                if (response.ok) {
                                    button.closest('.video-card').remove();
                                    alert('Removed from favorites');
                                } else {
                                    alert('Failed to remove from favorites');
                                }
                            } catch (error) {
                                alert('Error removing from favorites');
                            }
                        });
                    });
                } catch (error) {
                    alert('Error loading favorites');
                }
            });

            // Playlists
            createPlaylistBtn.addEventListener('click', async () => {
                if (!isAuthenticated) {
                    openModal('authPromptModal');
                    return;
                }
                const playlistName = newPlaylistInput.value.trim();
                if (!playlistName) {
                    alert('Please enter a playlist name');
                    return;
                }
                try {
                    const response = await fetch('/api/playlists', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: playlistName })
                    });
                    if (response.ok) {
                        newPlaylistInput.value = '';
                        alert('Playlist created');
                        loadPlaylists();
                    } else {
                        alert('Failed to create playlist');
                    }
                } catch (error) {
                    alert('Error creating playlist');
                }
            });

            async function loadPlaylists() {
                try {
                    const response = await fetch('/api/playlists');
                    const playlists = await response.json();
                    userPlaylistsContainer.innerHTML = playlists.map(playlist => `
                        <li class="playlist-item" data-id="${playlist.id}">
                            <span>${playlist.name}</span>
                            <button class="delete-playlist" data-id="${playlist.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </li>
                    `).join('');
                    document.querySelectorAll('.playlist-item').forEach(item => {
                        item.addEventListener('click', async (e) => {
                            if (e.target.closest('.delete-playlist')) return;
                            document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
                            item.classList.add('active');
                            try {
                                const playlistId = item.dataset.id;
                                const response = await fetch(`/api/playlists/${playlistId}`);
                                const playlist = await response.json();
                                videosGrid.innerHTML = playlist.videos.map(video => `
                                    <div class="video-card" data-video-id="${video.videoId}">
                                        <div class="video-thumbnail-container">
                                            <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                            <div class="video-duration">
                                                <svg class="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <polyline points="12 6 12 12 16 14"/>
                                                </svg>
                                                ${video.duration || 'N/A'}
                                            </div>
                                        </div>
                                        <div class="video-content">
                                            <h3 class="video-title">${video.title}</h3>
                                            <p class="video-channel">${video.channel || 'Unknown'}</p>
                                            <div class="video-stats">
                                                <span class="stat-item">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                    ${video.views || 'N/A'}
                                                </span>
                                                <span class="stat-item">
                                                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                                    </svg>
                                                    ${video.likes || 'N/A'}
                                                </span>
                                            </div>
                                            <div class="video-actions">
                                                <button class="action-btn remove-from-playlist" data-playlist-id="${playlistId}" data-video-id="${video.videoId}">
                                                    <i class="fas fa-trash"></i> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('');
                                document.querySelectorAll('.video-card').forEach(card => {
                                    card.querySelector('.video-thumbnail-container').addEventListener('click', () => {
                                        const videoId = card.dataset.videoId;
                                        openModal('videoModal');
                                        document.getElementById('modalVideo').src = `https://www.youtube.com/embed/${videoId}`;
                                        document.getElementById('modalTitle').textContent = card.querySelector('.video-title').textContent;
                                        document.getElementById('modalChannel').textContent = card.querySelector('.video-channel').textContent;
                                        document.getElementById('modalStats').textContent = `${card.querySelector('.video-stats').children[0].textContent} • ${card.querySelector('.video-stats').children[1].textContent}`;
                                        openYoutube.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                                        addFavorite.dataset.videoId = videoId;
                                    });
                                });
                                document.querySelectorAll('.remove-from-playlist').forEach(button => {
                                    button.addEventListener('click', async (e) => {
                                        e.stopPropagation();
                                        const playlistId = button.dataset.playlistId;
                                        const videoId = button.dataset.videoId;
                                        try {
                                            const response = await fetch(`/api/playlists/${playlistId}/${videoId}`, { method: 'DELETE' });
                                            if (response.ok) {
                                                button.closest('.video-card').remove();
                                                alert('Removed from playlist');
                                            } else {
                                                alert('Failed to remove from playlist');
                                            }
                                        } catch (error) {
                                            alert('Error removing from playlist');
                                        }
                                    });
                                });
                            } catch (error) {
                                alert('Error loading playlist');
                            }
                        });
                    });
                    document.querySelectorAll('.delete-playlist').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const playlistId = button.dataset.id;
                            try {
                                const response = await fetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
                                if (response.ok) {
                                    button.closest('.playlist-item').remove();
                                    alert('Playlist deleted');
                                } else {
                                    alert('Failed to delete playlist');
                                }
                            } catch (error) {
                                alert('Error deleting playlist');
                            }
                        });
                    });
                } catch (error) {
                    alert('Error loading playlists');
                }
            }

            // Add to Favorites
            addFavorite.addEventListener('click', async () => {
                if (!isAuthenticated) {
                    openModal('authPromptModal');
                    return;
                }
                const videoId = addFavorite.dataset.videoId;
                try {
                    const response = await fetch('/api/favorites', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            videoId,
                            title: document.getElementById('modalTitle').textContent
                        })
                    });
                    if (response.ok) {
                        alert('Added to favorites');
                    } else {
                        alert('Failed to add to favorites');
                    }
                } catch (error) {
                    alert('Error adding to favorites');
                }
            });

            // Input Listeners
            categorySearch.addEventListener('input', () => {
                filterCategories();
                loadTrendingVideos();
            });
            countrySelect.addEventListener('change', () => {
                currentRegion = countrySelect.value;
                loadTrendingVideos();
            });
            videoCount.addEventListener('change', () => {
                currentVideoCount = parseInt(videoCount.value);
                loadTrendingVideos();
            });

            // Initialize
            countrySelect.value = 'US';
            videoCount.value = 5;
            loadCategories();
            loadPlaylists();
            loadTrendingVideos();
        });