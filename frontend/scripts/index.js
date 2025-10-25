document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://youtubetrendanalyzer.onrender.com/api';
    const themeToggle = document.getElementById('theme-toggle');
    const categorySearch = document.getElementById('category-search');
    const categorySuggestions = document.getElementById('category-suggestions');
    const regionSelect = document.getElementById('region');
    const videoTypeSelect = document.getElementById('video-type');
    const videoCount = document.getElementById('video-count');
    const videoNumber = document.getElementById('video-number');
    const incrementVideoBtn = document.getElementById('increment-video');
    const decrementVideoBtn = document.getElementById('decrement-video');
    const categoriesContainer = document.getElementById('categories-container');
    const videosContainer = document.getElementById('videos-container');
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
    const playlistModal = document.getElementById('playlist-modal');
    const authRequiredModal = document.getElementById('auth-required-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const closeLoginBtn = document.getElementById('close-login');
    const submitLoginBtn = document.getElementById('submit-login');
    const closeSignupBtn = document.getElementById('close-signup');
    const submitSignupBtn = document.getElementById('submit-signup');
    const closePlaylistModalBtn = document.getElementById('close-playlist-modal');
    const saveToPlaylistBtn = document.getElementById('save-to-playlist');
    const closeAuthRequiredBtn = document.getElementById('close-auth-required');
    const goToLoginBtn = document.getElementById('go-to-login');
    const newPlaylistCheck = document.getElementById('new-playlist-check');
    const newPlaylistInput = document.getElementById('new-playlist-input');
    const playlistOptions = document.getElementById('playlist-options');
    const playlistsSection = document.getElementById('playlists-section');
    const authSection = document.getElementById('auth-section');

    let categories = [];
    let currentCategory = '';
    let currentRegion = 'US';
    let currentVideoType = 'short';
    let currentVideoCount = 5;
    let isDarkTheme = true;
    let isLoggedIn = false;
    let currentUser = null;
    let userPlaylists = [];
    let currentVideoToAdd = null;

    async function initializePage() {
        checkLoginStatus();
        themeToggle.addEventListener('click', toggleTheme);
        categorySearch.addEventListener('input', filterCategories);
        categorySearch.addEventListener('change', handleCategorySearch);
        regionSelect.addEventListener('change', updateRegion);
        videoTypeSelect.addEventListener('change', updateVideoType);
        videoCount.addEventListener('change', updateVideoCount);
        videoNumber.addEventListener('input', updateVideoNumber);
        incrementVideoBtn.addEventListener('click', incrementVideoCount);
        decrementVideoBtn.addEventListener('click', decrementVideoCount);
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
        closePlaylistModalBtn.addEventListener('click', () => playlistModal.style.display = 'none');
        saveToPlaylistBtn.addEventListener('click', saveToPlaylist);
        closeAuthRequiredBtn.addEventListener('click', () => authRequiredModal.style.display = 'none');
        goToLoginBtn.addEventListener('click', () => {
            authRequiredModal.style.display = 'none';
            openLoginModal();
        });
        newPlaylistCheck.addEventListener('change', toggleNewPlaylistInput);

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

        await fetchCategories();
        fetchTrendingVideos();
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

    // async function fetchCategories() {
    //     try {
    //         // const response = await fetch(`/api/categories?regionCode=${currentRegion}`);
    //         // const response = await fetch(`categories?regionCode=${currentRegion}`)
    //         const response = await fetch(`http://localhost:5000/api/categories?regionCode=${currentRegion}`);
    //         if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
    //         categories = await response.json();
    //         updateCategories();
    //     } catch (error) {
    //         showError(`Error fetching categories: ${error.message}`);
    //     }
    // }
    async function fetchCategories() {
        try {
            const response = await fetch(`${API_BASE}/api/categories?regionCode=${currentRegion}`);
            if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
            categories = await response.json();
            updateCategories();
        } catch (error) {
            showError(`Error fetching categories: ${error.message}`);
        }
    }

    function updateCategories() {
        const searchTerm = categorySearch.value.toLowerCase();
        categoriesContainer.innerHTML = '<div class="category-btn active" data-category="">All Categories</div>';
        categories
            .filter(cat => cat.title.toLowerCase().includes(searchTerm))
            .forEach(cat => {
                const button = document.createElement('div');
                button.className = 'category-btn';
                button.dataset.category = cat.id;
                button.textContent = cat.title;
                button.addEventListener('click', () => selectCategory(button));
                categoriesContainer.appendChild(button);
            });

        categorySuggestions.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.title;
            option.dataset.id = cat.id;
            categorySuggestions.appendChild(option);
        });
    }

    function filterCategories() {
        updateCategories();
    }

    function handleCategorySearch(e) {
        const selectedOption = Array.from(categorySuggestions.options)
            .find(option => option.value === e.target.value);
        if (selectedOption) {
            const categoryId = selectedOption.dataset.id;
            selectCategoryById(categoryId);
            e.target.value = '';
        }
    }

    async function updateRegion() {
        currentRegion = regionSelect.value;
        await fetchCategories();
        fetchTrendingVideos();
    }

    function updateVideoType() {
        currentVideoType = videoTypeSelect.value;
        fetchTrendingVideos();
    }

    function updateVideoCount() {
        currentVideoCount = parseInt(videoCount.value);
        if (isNaN(currentVideoCount) || currentVideoCount < 1) currentVideoCount = 1;
        if (currentVideoCount > 50) currentVideoCount = 50;
        videoNumber.value = currentVideoCount;
        fetchTrendingVideos();
    }

    function updateVideoNumber() {
        let value = parseInt(videoNumber.value);
        if (isNaN(value) || value < 1) {
            value = 1;
            videoNumber.value = 1;
        } else if (value > 50) {
            value = 50;
            videoNumber.value = 50;
        }
        currentVideoCount = value;
        videoCount.value = currentVideoCount;
        fetchTrendingVideos();
    }

    function incrementVideoCount() {
        let value = parseInt(videoNumber.value) + 1;
        if (value > 50) value = 50;
        videoNumber.value = value;
        currentVideoCount = value;
        videoCount.value = currentVideoCount;
        fetchTrendingVideos();
    }

    function decrementVideoCount() {
        let value = parseInt(videoNumber.value) - 1;
        if (value < 1) value = 1;
        videoNumber.value = value;
        currentVideoCount = value;
        videoCount.value = currentVideoCount;
        fetchTrendingVideos();
    }

    function selectCategory(button) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        fetchTrendingVideos();
    }

    function selectCategoryById(categoryId) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryId);
        });
        currentCategory = categoryId;
        fetchTrendingVideos();
    }

    // async function fetchTrendingVideos() {
    //     loadingElement.style.display = 'block';
    //     errorElement.style.display = 'none';
    //     fallbackElement.style.display = 'none';
    //     videosContainer.innerHTML = '';

    //     try {
    //         // const url = `/api/trending?regions=${currentRegion}&maxResults=${currentVideoCount}&categoryId=${currentCategory}&videoType=${currentVideoType}&maxVideos=${currentVideoCount}`;
    //         // const response = await fetch(url);
    //         const url = `http://localhost:5000/api/trending?regions=${currentRegion}&maxResults=${currentVideoCount}&categoryId=${currentCategory}&videoType=${currentVideoType}&maxVideos=${currentVideoCount}`;
    //         const response = await fetch(url);
    //         if (!response.ok) throw new Error(`Failed to fetch videos: ${response.status}`);
    //         const data = await response.json();
    //         displayVideos(data[currentRegion]);
    //     } catch (error) {
    //         showError(`Error fetching videos: ${error.message}`);
    //     } finally {
    //         loadingElement.style.display = 'none';
    //     }
    // }

    async function fetchTrendingVideos() {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        fallbackElement.style.display = 'none';
        videosContainer.innerHTML = '';

        try {
            const url = `${API_BASE}/api/trending?regions=${currentRegion}&maxResults=${currentVideoCount}&categoryId=${currentCategory}&videoType=${currentVideoType}&maxVideos=${currentVideoCount}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch videos: ${response.status}`);
            const data = await response.json();
            displayVideos(data[currentRegion]);
        } catch (error) {
            showError(`Error fetching videos: ${error.message}`);
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    function displayVideos({ videos, fallbackReason }) {
        if (videos.length === 0) {
            fallbackElement.style.display = 'block';
            fallbackElement.textContent = fallbackReason || 'No videos found for the selected filters.';
            return;
        }
        if (fallbackReason) {
            fallbackElement.style.display = 'block';
            fallbackElement.textContent = fallbackReason;
        }
        videos.slice(0, currentVideoCount).forEach(video => {
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
                    <button class="action-btn like-btn" data-video-id="${video.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <button class="action-btn playlist-btn" data-video-id="${video.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                    </button>
                </div>
            `;
            videoCard.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    window.open(video.embedUrl, '_blank');
                }
            });
            const likeBtn = videoCard.querySelector('.like-btn');
            const playlistBtn = videoCard.querySelector('.playlist-btn');
            likeBtn.addEventListener('click', () => addToFavorites(video));
            playlistBtn.addEventListener('click', () => openPlaylistModal(video));
            videosContainer.appendChild(videoCard);
        });
    }

    function addToFavorites(video) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        try {
            let favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.email}`)) || [];
            if (!favorites.some(fav => fav.id === video.id)) {
                favorites.push(video);
                localStorage.setItem(`favorites_${currentUser.email}`, JSON.stringify(favorites));
                alert('Video added to favorites!');
            } else {
                alert('This video is already in your favorites!');
            }
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error adding to favorites: ${error.message}`;
        }
    }

    function openPlaylistModal(video) {
        if (!isLoggedIn) {
            showAuthRequiredModal();
            return;
        }
        currentVideoToAdd = video;
        renderPlaylistOptions();
        playlistModal.classList.add('show');
    }

    function renderPlaylistOptions() {
        playlistOptions.innerHTML = '';
        if (userPlaylists.length === 0) {
            playlistOptions.innerHTML = '<p>You don\'t have any playlists yet.</p>';
            return;
        }
        userPlaylists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            const hasVideo = playlist.videos.some(v => v.id === currentVideoToAdd.id);
            playlistItem.innerHTML = `
                <input type="checkbox" id="playlist-${playlist.name}" 
                    class="playlist-checkbox" ${hasVideo ? 'disabled' : ''}>
                <label for="playlist-${playlist.name}">${playlist.name} (${playlist.videos.length})</label>
            `;
            if (hasVideo) {
                playlistItem.innerHTML += `<span style="margin-left: 10px; color: var(--muted-foreground); font-size: 0.8rem;">Already added</span>`;
            }
            playlistOptions.appendChild(playlistItem);
        });
    }

    function toggleNewPlaylistInput() {
        newPlaylistInput.style.display = newPlaylistCheck.checked ? 'block' : 'none';
    }

    function saveToPlaylist() {
        try {
            if (newPlaylistCheck.checked && newPlaylistInput.value.trim()) {
                const newPlaylistName = newPlaylistInput.value.trim();
                if (userPlaylists.some(p => p.name === newPlaylistName)) {
                    alert('A playlist with this name already exists.');
                    return;
                }
                const newPlaylist = {
                    name: newPlaylistName,
                    videos: [currentVideoToAdd],
                    lastUpdated: new Date().toISOString()
                };
                userPlaylists.push(newPlaylist);
                localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
                renderPlaylists();
            }
            const checkboxes = document.querySelectorAll('.playlist-checkbox:not(#new-playlist-check)');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked && !checkbox.disabled) {
                    const playlistName = checkbox.id.replace('playlist-', '');
                    const playlist = userPlaylists.find(p => p.name === playlistName);
                    if (playlist && !playlist.videos.some(v => v.id === currentVideoToAdd.id)) {
                        playlist.videos.push(currentVideoToAdd);
                        playlist.lastUpdated = new Date().toISOString();
                    }
                }
            });
            localStorage.setItem(`playlists_${currentUser.email}`, JSON.stringify(userPlaylists));
            playlistModal.classList.remove('show');
            newPlaylistCheck.checked = false;
            newPlaylistInput.style.display = 'none';
            newPlaylistInput.value = '';
            alert('Video added to playlist(s)!');
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error saving to playlist: ${error.message}`;
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
            } else {
                alert('Invalid email or password.');
            }
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error during login: ${error.message}`;
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
        } catch (error) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error during signup: ${error.message}`;
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
        }
    }

    function showError(message) {
        errorElement.style.display = 'block';
        errorElement.textContent = message;
        loadingElement.style.display = 'none';
    }

    initializePage();
});