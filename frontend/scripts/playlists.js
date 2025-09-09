document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const playlistsContainer = document.getElementById('playlists-container');
    const videosContainer = document.getElementById('videos-container');
    const sectionTitle = document.getElementById('section-title');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const fallbackElement = document.getElementById('fallback');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');
    const homeBtn = document.getElementById('home-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    const playlistsBtn = document.getElementById('playlists-btn');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const authRequiredModal = document.getElementById('auth-required-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const closeLoginBtn = document.getElementById('close-login');
    const submitLoginBtn = document.getElementById('submit-login');
    const closeSignupBtn = document.getElementById('close-signup');
    const submitSignupBtn = document.getElementById('submit-signup');
    const closeAuthRequiredBtn = document.getElementById('close-auth-required');
    const goToLoginBtn = document.getElementById('go-to-login');
    const playlistsSection = document.getElementById('playlists-section');
    const authSection = document.getElementById('auth-section');
    const heroSection = document.getElementById('hero-section');
    const heroImage = heroSection.querySelector('.hero-image');
    const heroOverlay = heroSection.querySelector('.hero-overlay');
    const heroTitle = heroSection.querySelector('.hero-title');

    let isDarkTheme = true;
    let isLoggedIn = false;
    let currentUser = null;
    let userPlaylists = [];
    let selectedPlaylist = null;

    const urlParams = new URLSearchParams(window.location.search);
    const playlistName = urlParams.get('name');

    const overlayColors = [
        'linear-gradient(to bottom, rgba(255, 0, 0, 0.4), rgba(0, 0, 0, 0.7))', // Red
        'linear-gradient(to bottom, rgba(0, 128, 255, 0.4), rgba(0, 0, 0, 0.7))', // Blue
        'linear-gradient(to bottom, rgba(0, 255, 128, 0.4), rgba(0, 0, 0, 0.7))', // Green
        'linear-gradient(to bottom, rgba(255, 165, 0, 0.4), rgba(0, 0, 0, 0.7))', // Orange
        'linear-gradient(to bottom, rgba(128, 0, 255, 0.4), rgba(0, 0, 0, 0.7))', // Purple
        'linear-gradient(to bottom, rgba(255, 192, 203, 0.4), rgba(0, 0, 0, 0.7))' // Pink
    ];

    function setRandomOverlayColor() {
        const randomIndex = Math.floor(Math.random() * overlayColors.length);
        heroOverlay.style.background = overlayColors[randomIndex];
    }

    function initializePage() {
        checkLoginStatus();
        setRandomOverlayColor();
        themeToggle.addEventListener('click', toggleTheme);
        sidebarToggle.addEventListener('click', toggleSidebar);
        closeSidebar.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        homeBtn.addEventListener('click', () => window.location.href = 'index.html');
        favoritesBtn.addEventListener('click', () => window.location.href = 'favorites.html');
        playlistsBtn.addEventListener('click', () => window.location.href = 'playlists.html');
        createPlaylistBtn.addEventListener('click', createNewPlaylist);
        closeModalButtons.forEach(btn => btn.addEventListener('click', closeAllModals));
        closeLoginBtn.addEventListener('click', () => loginModal.style.display = 'none');
        submitLoginBtn.addEventListener('click', handleLogin);
        closeSignupBtn.addEventListener('click', () => signupModal.style.display = 'none');
        submitSignupBtn.addEventListener('click', handleSignup);
        closeAuthRequiredBtn.addEventListener('click', () => authRequiredModal.style.display = 'none');
        goToLoginBtn.addEventListener('click', () => {
            authRequiredModal.style.display = 'none';
            openLoginModal();
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 991 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target) &&
                sidebar.classList.contains('show')) {
                toggleSidebar();
            }
        });

        if (window.innerWidth <= 991) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            overlay.style.pointerEvents = 'none';
            sidebarToggle.style.display = 'flex';
        } else {
            sidebar.classList.add('show');
            sidebarToggle.style.display = 'none';
        }

        if (playlistName) {
            loadPlaylistVideos(playlistName);
        } else {
            loadPlaylists();
        }
    }

    function checkLoginStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            isLoggedIn = true;
            updateAuthUI();
            try {
                userPlaylists = JSON.parse(localStorage.getItem(`playlists_${currentUser.email}`)) || [];
                renderPlaylists();
            } catch (error) {
                errorElement.style.display = 'block';
                errorElement.textContent = `Error loading playlists: ${error.message}`;
            }
        } else {
            showAuthRequiredModal();
        }
    }

    function updateAuthUI() {
        if (isLoggedIn) {
            authSection.innerHTML = `
                <div class="sidebar-item">
                    <i class="fas fa-user"></i>
                    <span>${currentUser.name}</span>
                </div>
                <div class="sidebar-item" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            authSection.innerHTML = `
                <div class="sidebar-item" id="login-btn">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                </div>
                <div class="sidebar-item" id="signup-btn">
                    <i class="fas fa-user-plus"></i>
                    <span>Sign Up</span>
                </div>
            `;
            document.getElementById('login-btn').addEventListener('click', openLoginModal);
            document.getElementById('signup-btn').addEventListener('click', openSignupModal);
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('show');
        const isSidebarOpen = sidebar.classList.contains('show');
        overlay.classList.toggle('show', isSidebarOpen);
        overlay.style.pointerEvents = isSidebarOpen ? 'auto' : 'none';
        sidebarToggle.style.display = isSidebarOpen ? 'none' : 'flex';
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark', isDarkTheme);
        themeToggle.innerHTML = isDarkTheme ? 
            `<svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>` :
            `<svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;
    }

    function loadPlaylists() {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        fallbackElement.style.display = 'none';
        playlistsContainer.style.display = 'flex';
        videosContainer.style.display = 'none';
        sectionTitle.textContent = 'Your Playlists';
        playlistsContainer.innerHTML = '';

        try {
            userPlaylists = JSON.parse(localStorage.getItem(`playlists_${currentUser.email}`)) || [];
            if (userPlaylists.length === 0) {
                fallbackElement.style.display = 'block';
                fallbackElement.textContent = 'No playlists found. Create a new playlist to get started!';
                heroImage.src = 'https://via.placeholder.com/1200x300?text=Playlists';
                heroSection.querySelector('.hero-background').style.backgroundImage = `url('https://via.placeholder.com/1200x300?text=Playlists')`;
                heroTitle.textContent = 'Playlists';
                setRandomOverlayColor();
                loadingElement.style.display = 'none';
                return;
            }
            displayPlaylists(userPlaylists);
            const lastPlaylist = userPlaylists[userPlaylists.length - 1];
            const lastVideo = lastPlaylist && lastPlaylist.videos[lastPlaylist.videos.length - 1];
            const thumbnail = lastVideo ? lastVideo.thumbnail : 'https://via.placeholder.com/1200x300?text=Playlists';
            heroImage.src = thumbnail;
            heroSection.querySelector('.hero-background').style.backgroundImage = `url('${thumbnail}')`;
            heroTitle.textContent = 'Playlists';
            setRandomOverlayColor();
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error loading playlists: ${error.message}`;
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    function displayPlaylists(playlists) {
        playlists.forEach(playlist => {
            const lastVideo = playlist.videos[playlist.videos.length - 1];
            const thumbnail = lastVideo ? lastVideo.thumbnail : 'https://via.placeholder.com/300x170?text=No+Videos';
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.innerHTML = `
                <div class="playlist-card playlist-stack">
                    <div class="playlist-background"></div>
                    <div class="playlist-thumbnail">
                        <img src="${thumbnail}" alt="${playlist.name}">
                        <div class="playlist-overlay">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                </div>
                <div class="playlist-info">
                    <h3 class="playlist-name">${playlist.name}</h3>
                    <div class="playlist-count">${playlist.videos.length} video${playlist.videos.length !== 1 ? 's' : ''}</div>
                </div>
            `;
            playlistItem.addEventListener('click', () => {
                window.location.href = `playlists.html?name=${encodeURIComponent(playlist.name)}`;
            });
            playlistsContainer.appendChild(playlistItem);
        });
    }

    function loadPlaylistVideos(playlistName) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        fallbackElement.style.display = 'none';
        playlistsContainer.style.display = 'none';
        videosContainer.style.display = 'flex';
        sectionTitle.textContent = `Playlist: ${playlistName}`;
        videosContainer.innerHTML = '';

        try {
            const playlist = userPlaylists.find(p => p.name === playlistName);
            if (!playlist || playlist.videos.length === 0) {
                fallbackElement.style.display = 'block';
                fallbackElement.textContent = 'No videos in this playlist.';
                heroImage.src = 'https://via.placeholder.com/1200x300?text=' + encodeURIComponent(playlistName);
                heroSection.querySelector('.hero-background').style.backgroundImage = `url('https://via.placeholder.com/1200x300?text=${encodeURIComponent(playlistName)}')`;
                heroTitle.textContent = playlistName;
                setRandomOverlayColor();
                loadingElement.style.display = 'none';
                return;
            }
            displayPlaylistVideos(playlist.videos);
            const lastVideo = playlist.videos[playlist.videos.length - 1];
            const thumbnail = lastVideo ? lastVideo.thumbnail : 'https://via.placeholder.com/1200x300?text=' + encodeURIComponent(playlistName);
            heroImage.src = thumbnail;
            heroSection.querySelector('.hero-background').style.backgroundImage = `url('${thumbnail}')`;
            heroTitle.textContent = playlistName;
            setRandomOverlayColor();
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error loading playlist: ${error.message}`;
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    function displayPlaylistVideos(videos) {
        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.innerHTML = `
                <div class="thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="duration"><svg class="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${video.duration}</div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="channel">${video.channel}</div>
                    <div class="stats">
                        <span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>${video.views}</span>
                        <span class="stat-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${video.likes}</span>
                    </div>
                </div>
                <div class="video-actions">
                    <button class="action-btn remove-btn" data-video-id="${video.id}" title="Remove from Playlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/></svg>
                    </button>
                </div>
            `;
            videoCard.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    window.open(video.embedUrl, '_blank');
                }
            });
            const removeBtn = videoCard.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => removeFromPlaylist(video.id, urlParams.get('name')));
            videosContainer.appendChild(videoCard);
        });
    }

    function removeFromPlaylist(videoId, playlistName) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        try {
            const playlist = userPlaylists.find(p => p.name === playlistName);
            if (playlist) {
                playlist.videos = playlist.videos.filter(v => v.id !== videoId);
                playlist.lastUpdated = new Date().toISOString();
                localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
                loadPlaylistVideos(playlistName);
                renderPlaylists();
                alert('Video removed from playlist!');
            }
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error removing video: ${error.message}`;
        }
    }

    function openLoginModal() {
        loginModal.classList.add('show');
    }

    function openSignupModal() {
        signupModal.classList.add('show');
    }

    function showAuthRequiredModal() {
        authRequiredModal.classList.add('show');
        playlistsContainer.style.display = 'none';
        videosContainer.style.display = 'none';
        heroSection.style.display = 'none';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    function handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                currentUser = { name: user.name, email: user.email };
                isLoggedIn = true;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                const playlists = localStorage.getItem(`playlists_${currentUser.email}`);
                if (playlists) {
                    userPlaylists = JSON.parse(playlists);
                    renderPlaylists();
                }
                updateAuthUI();
                loginModal.classList.remove('show');
                alert(`Welcome back, ${user.name}!`);
                heroSection.style.display = 'block';
                if (playlistName) {
                    loadPlaylistVideos(playlistName);
                } else {
                    loadPlaylists();
                }
            } else {
                alert('Invalid email or password.');
            }
        } catch (error) {
            alert(`Error during login: ${error.message}`);
        }
    }

    function handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        if (!name || !email || !password || !confirm) {
            alert('Please fill in all fields.');
            return;
        }
        if (password !== confirm) {
            alert('Passwords do not match.');
            return;
        }
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.email === email)) {
                alert('An account with this email already exists.');
                return;
            }
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = { name, email };
            isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            userPlaylists = [];
            localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
            updateAuthUI();
            signupModal.classList.remove('show');
            alert(`Welcome to TrendTube, ${name}!`);
            heroSection.style.display = 'block';
            if (playlistName) {
                loadPlaylistVideos(playlistName);
            } else {
                loadPlaylists();
            }
        } catch (error) {
            alert(`Error during signup: ${error.message}`);
        }
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            isLoggedIn = false;
            currentUser = null;
            userPlaylists = [];
            updateAuthUI();
            const existingPlaylists = playlistsSection.querySelectorAll('.sidebar-item:not(#create-playlist-btn)');
            existingPlaylists.forEach(item => item.remove());
            alert('You have been logged out.');
            showAuthRequiredModal();
        }
    }

    function createNewPlaylist() {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        const playlistName = prompt('Enter a name for your new playlist:');
        if (playlistName && playlistName.trim()) {
            if (userPlaylists.some(p => p.name === playlistName.trim())) {
                alert('A playlist with this name already exists.');
                return;
            }
            const newPlaylist = {
                name: playlistName.trim(),
                videos: [],
                lastUpdated: new Date().toISOString()
            };
            userPlaylists.push(newPlaylist);
            localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
            renderPlaylists();
            alert(`Playlist "${playlistName}" created!`);
            loadPlaylists();
        }
    }

    function renderPlaylists() {
        const existingPlaylists = playlistsSection.querySelectorAll('.sidebar-item:not(#create-playlist-btn)');
        existingPlaylists.forEach(item => item.remove());
        userPlaylists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'sidebar-item';
            playlistItem.dataset.playlist = playlist.name;
            playlistItem.innerHTML = `
                <i class="fas fa-list-ul"></i>
                <span>${playlist.name}</span>
                <div class="playlist-actions">
                    <button class="playlist-action-btn rename-btn" data-playlist-name="${playlist.name}" title="Rename Playlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="playlist-action-btn delete-btn" data-playlist-name="${playlist.name}" title="Delete Playlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/>
                        </svg>
                    </button>
                </div>
            `;
            playlistItem.addEventListener('click', (e) => {
                if (!e.target.closest('.playlist-action-btn')) {
                    window.location.href = `playlists.html?name=${encodeURIComponent(playlist.name)}`;
                }
            });
            const renameBtn = playlistItem.querySelector('.rename-btn');
            renameBtn.addEventListener('click', () => renamePlaylist(playlist.name));
            const deleteBtn = playlistItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deletePlaylist(playlist.name));
            playlistsSection.insertBefore(playlistItem, createPlaylistBtn);
        });
    }

    function renamePlaylist(oldName) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        const newName = prompt('Enter new playlist name:', oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
            if (userPlaylists.some(p => p.name === newName.trim())) {
                alert('A playlist with this name already exists.');
                return;
            }
            const playlist = userPlaylists.find(p => p.name === oldName);
            if (playlist) {
                playlist.name = newName.trim();
                playlist.lastUpdated = new Date().toISOString();
                localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
                renderPlaylists();
                alert(`Playlist renamed to "${newName.trim()}"`);
                if (urlParams.get('name') === oldName) {
                    window.location.href = `playlists.html?name=${encodeURIComponent(newName.trim())}`;
                }
            }
        }
    }

    function deletePlaylist(playlistName) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        if (confirm(`Are you sure you want to delete the playlist "${playlistName}"?`)) {
            userPlaylists = userPlaylists.filter(p => p.name !== playlistName);
            localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
            renderPlaylists();
            alert(`Playlist "${playlistName}" deleted`);
            if (urlParams.get('name') === playlistName) {
                window.location.href = 'playlists.html';
            }
        }
    }

    initializePage();
});