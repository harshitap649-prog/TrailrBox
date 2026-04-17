const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDIzMGFkOWJlNjY3NzFkNjg5MDcwMjNmY2M1MGQ2YiIsIm5iZiI6MTc3NjM1MjE4Ny4xMjMwMDAxLCJzdWIiOiI2OWUwZmJiYjEzMTBhMjE0OWFiODAyODgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wQk9SRcq_k3t-QRA4p0mQyrj241W9g1fE4b_6pNXvpE";
const ADSTERRA_URL = "https://www.profitablecpmratenetwork.com/vd0mz5ay5?key=74b5dbb7604fc1c7564f9954b7231af1";

// PWA Installation Variables
let deferredPrompt;
const installAppBtn = document.getElementById('installAppBtn');

// Local Storage Management
const STORAGE_KEYS = {
    favorites: 'trailrbox_favorites',
    watchHistory: 'trailrbox_watch_history'
};

// Initialize storage with cleanup
let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]');
let watchHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.watchHistory) || '[]');

// Clean up ghost favorites (remove null/undefined entries)
favorites = favorites.filter(id => id !== null && id !== undefined && id !== '');
localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));

async function fetchMovies(query = '') {
    const url = query 
        ? `https://api.themoviedb.org/3/search/movie?query=${query}`
        : 'https://api.themoviedb.org/3/trending/movie/day';

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });
    const data = await response.json();
    
    // Handle search visibility and heading
    if (query.trim()) {
        // Hide favorites and trending sections during search
        document.getElementById('favoritesSection').classList.add('hidden');
        document.getElementById('gridTitle').classList.add('hidden');
        
        // Show search results heading
        document.getElementById('gridTitle').textContent = `Search Results for "${query}"`;
        document.getElementById('gridTitle').classList.remove('hidden');
    } else {
        // Show favorites and trending sections when not searching
        renderFavorites();
        document.getElementById('gridTitle').textContent = 'Trending Now';
        document.getElementById('gridTitle').classList.remove('hidden');
    }
    
    displayMovies(data.results);
}

function displayMovies(movies) {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card relative group cursor-pointer" onclick="playTrailer(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full rounded-lg">
            
            <!-- Rating Badge -->
            <div class="absolute bottom-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded flex items-center gap-1">
                <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-xs text-white">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            
            <!-- Heart Icon for Favorites -->
            <button onclick="toggleFavorite(event, ${movie.id})" class="absolute top-2 right-2 bg-black bg-opacity-75 p-1.5 rounded-full hover:bg-opacity-90 transition-all">
                <svg class="w-4 h-4 ${favorites.includes(movie.id) ? 'text-red-600' : 'text-white'}" fill="${favorites.includes(movie.id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
            </button>
            
            <!-- Info Button -->
            <button onclick="showMovieDetails(event, ${movie.id})" class="absolute bottom-2 right-2 bg-black bg-opacity-75 p-1.5 rounded-full hover:bg-opacity-90 transition-all">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </button>
            
            <p class="text-xs mt-2 truncate font-medium">${movie.title}</p>
        </div>
    `).join('');
}

async function playTrailer(id) {
    // 1. Show Interstitial Overlay
    const overlay = document.getElementById('interstitialOverlay');
    const countdown = document.getElementById('countdown');
    const progressBar = document.getElementById('progressBar');
    
    overlay.classList.remove('hidden');
    
    // 2. Trigger the Ad (Open Adsterra in New Tab)
    window.open(ADSTERRA_URL, '_blank');
    
    // 3. Start Countdown Timer
    let count = 5;
    countdown.textContent = count;
    progressBar.style.width = '0%';
    
    const countdownInterval = setInterval(() => {
        count--;
        countdown.textContent = count;
        progressBar.style.width = `${(5 - count) * 20}%`;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            overlay.classList.add('hidden');
            
            // 4. Fetch and Show Video in Cinema Mode
            showVideoInCinema(id);
        }
    }, 1000);
}

async function showVideoInCinema(id) {
    try {
        // Add to watch history
        addToWatchHistory(id);
        
        // Fetch Video Data from TMDB
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const data = await response.json();
        
        // Find the Official Trailer or any YouTube Video
        const video = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data.results[0];

        if (video && video.key) {
            const cinemaModal = document.getElementById('cinemaModal');
            const cinemaPlayer = document.getElementById('cinemaPlayer');
            
            // Show cinema modal and inject the iFrame
            cinemaModal.classList.remove('hidden');
            cinemaPlayer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&showinfo=0" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media; fullscreen" 
                    allowfullscreen>
                </iframe>`;
        } else {
            alert("Sorry, no trailer available for this movie yet!");
        }
    } catch (error) {
        console.error("Error loading video:", error);
        alert("Error loading trailer. Please try again.");
    }
}

// Cinema Mode Event Listeners
document.getElementById('backToHome').onclick = () => {
    closeCinemaMode();
};

document.getElementById('closeCinema').onclick = () => {
    closeCinemaMode();
};

function closeCinemaMode() {
    const cinemaModal = document.getElementById('cinemaModal');
    const cinemaPlayer = document.getElementById('cinemaPlayer');
    
    cinemaModal.classList.add('hidden');
    cinemaPlayer.innerHTML = '';
}

// Legacy Video Container Event Listeners
document.getElementById('closePlayer').onclick = () => {
    document.getElementById('videoContainer').classList.add('hidden');
    document.getElementById('player').innerHTML = '';
};

// PWA Installation Logic - Enhanced with immediate hiding
window.addEventListener('beforeinstallprompt', (e) => {
    // Only show install button if not already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    
    if (!isStandalone && !isIOSStandalone) {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show the install button only if not already installed
        const wasInstalled = localStorage.getItem('trailrbox_pwa_installed') === 'true';
        if (!wasInstalled) {
            installAppBtn.classList.remove('hidden');
        }
    }
});

// Handle the install button click
installAppBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    
    // Hide the install button immediately
    installAppBtn.classList.add('hidden');
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // If user accepted, store installation status
    if (outcome === 'accepted') {
        localStorage.setItem('trailrbox_pwa_installed', 'true');
    }
});

// Enhanced appinstalled event listener for immediate hiding
window.addEventListener('appinstalled', () => {
    // Hide button immediately without page refresh
    installAppBtn.style.display = 'none';
    installAppBtn.classList.add('hidden');
    
    console.log('PWA was installed successfully - hiding install button immediately');
    
    // Store installation status in localStorage
    localStorage.setItem('trailrbox_pwa_installed', 'true');
    
    // Clean up any remaining install prompt
    deferredPrompt = null;
});

// Comprehensive installation status check
function checkIfAppIsInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    const wasInstalled = localStorage.getItem('trailrbox_pwa_installed') === 'true';
    
    // Hide button immediately if app is installed or running in standalone mode
    if (isStandalone || isIOSStandalone || wasInstalled) {
        installAppBtn.style.display = 'none';
        installAppBtn.classList.add('hidden');
        console.log('App is installed or running in standalone mode - hiding install button');
        return true;
    }
    return false;
}

// Check installation status immediately on page load
document.addEventListener('DOMContentLoaded', () => {
    checkIfAppIsInstalled();
});

// Also check on window load for additional safety
window.addEventListener('load', () => {
    checkIfAppIsInstalled();
});

// Listen for display mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) {
        // App entered standalone mode, hide install button
        installAppBtn.style.display = 'none';
        installAppBtn.classList.add('hidden');
        console.log('App entered standalone mode - hiding install button');
    }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    if (e.target.value.trim() === '') {
        // Clear search and show original sections
        fetchMovies('');
    }
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') fetchMovies(e.target.value);
});

// Favorites System - Single Source of Truth
function toggleFavorite(event, movieId) {
    event.stopPropagation();
    
    // Update favorites array in localStorage
    const index = favorites.indexOf(movieId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movieId);
    }
    
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    
    // Refresh all sections to maintain sync
    renderFavorites();
    renderAllMovieCards();
}

// Refresh favorites section
function renderFavorites() {
    if (favorites.length > 0) {
        document.getElementById('favoritesSection').classList.remove('hidden');
        fetchFavoriteMovies();
    } else {
        document.getElementById('favoritesSection').classList.add('hidden');
    }
}

// Update heart icons across all movie cards
function renderAllMovieCards() {
    // Update trending/search movies
    const movieGridCards = document.querySelectorAll('#movieGrid .movie-card');
    movieGridCards.forEach(card => {
        const heartButton = card.querySelector('button[onclick*="toggleFavorite"]');
        if (heartButton) {
            const movieId = parseInt(heartButton.getAttribute('onclick').match(/\d+/)[0]);
            updateHeartIcon(heartButton, movieId);
        }
    });
    
    // Update favorites section
    const favoritesGridCards = document.querySelectorAll('#favoritesGrid .movie-card');
    favoritesGridCards.forEach(card => {
        const heartButton = card.querySelector('button[onclick*="toggleFavorite"]');
        if (heartButton) {
            const movieId = parseInt(heartButton.getAttribute('onclick').match(/\d+/)[0]);
            updateHeartIcon(heartButton, movieId);
        }
    });
    
    // Update recent section
    const recentGridCards = document.querySelectorAll('#recentGrid .movie-card');
    recentGridCards.forEach(card => {
        const heartButton = card.querySelector('button[onclick*="toggleFavorite"]');
        if (heartButton) {
            const movieId = parseInt(heartButton.getAttribute('onclick').match(/\d+/)[0]);
            updateHeartIcon(heartButton, movieId);
        }
    });
}

// Update individual heart icon based on localStorage
function updateHeartIcon(heartButton, movieId) {
    const heartIcon = heartButton.querySelector('svg');
    const isFavorited = favorites.includes(movieId);
    
    if (isFavorited) {
        heartIcon.classList.add('text-red-600');
        heartIcon.classList.remove('text-white');
        heartIcon.setAttribute('fill', 'currentColor');
    } else {
        heartIcon.classList.remove('text-red-600');
        heartIcon.classList.add('text-white');
        heartIcon.setAttribute('fill', 'none');
    }
}

// Watch History System
function addToWatchHistory(movieId) {
    // Remove if already exists, then add to front
    watchHistory = watchHistory.filter(id => id !== movieId);
    watchHistory.unshift(movieId);
    
    // Keep only last 20 items
    if (watchHistory.length > 20) {
        watchHistory = watchHistory.slice(0, 20);
    }
    
    localStorage.setItem(STORAGE_KEYS.watchHistory, JSON.stringify(watchHistory));
    updateRecentSection();
}

// Movie Details Modal
async function showMovieDetails(event, movieId) {
    event.stopPropagation();
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const movie = await response.json();
        
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const credits = await creditsResponse.json();
        
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        
        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full md:w-48 rounded-lg">
                <div class="flex-1">
                    <h2 class="text-2xl font-bold mb-2">${movie.title}</h2>
                    <div class="flex items-center gap-4 mb-4">
                        <div class="flex items-center gap-1">
                            <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span class="text-white">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                        <span class="text-gray-400">${movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
                        <span class="text-gray-400">${new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    <p class="text-gray-300 mb-4">${movie.overview || 'No overview available.'}</p>
                    <div class="mb-4">
                        <h3 class="text-lg font-semibold mb-2">Cast</h3>
                        <p class="text-gray-300">${cast || 'Cast information not available.'}</p>
                    </div>
                    <button onclick="playTrailer(${movie.id})" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Watch Trailer
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('movieDetailsModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading movie details:', error);
        alert('Error loading movie details. Please try again.');
    }
}

// Update UI Sections
function updateFavoritesSection() {
    const section = document.getElementById('favoritesSection');
    const grid = document.getElementById('favoritesGrid');
    
    if (favorites.length > 0) {
        section.classList.remove('hidden');
        // Fetch and display favorite movies
        fetchFavoriteMovies();
    } else {
        section.classList.add('hidden');
    }
}

function updateRecentSection() {
    const section = document.getElementById('recentSection');
    const grid = document.getElementById('recentGrid');
    
    if (watchHistory.length > 0) {
        section.classList.remove('hidden');
        // Fetch and display recent movies
        fetchRecentMovies();
    } else {
        section.classList.add('hidden');
    }
}

async function fetchFavoriteMovies() {
    const grid = document.getElementById('favoritesGrid');
    const moviePromises = favorites.map(id => 
        fetch(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        }).then(res => res.json())
    );
    
    try {
        const movies = await Promise.all(moviePromises);
        displayMovieGrid(movies, grid);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

async function fetchRecentMovies() {
    const grid = document.getElementById('recentGrid');
    const moviePromises = watchHistory.map(id => 
        fetch(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        }).then(res => res.json())
    );
    
    try {
        const movies = await Promise.all(moviePromises);
        displayMovieGrid(movies, grid);
    } catch (error) {
        console.error('Error fetching recent movies:', error);
    }
}

function displayMovieGrid(movies, gridElement) {
    gridElement.innerHTML = movies.map(movie => `
        <div class="movie-card relative group cursor-pointer" onclick="playTrailer(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full rounded-lg">
            
            <!-- Rating Badge -->
            <div class="absolute bottom-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded flex items-center gap-1">
                <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-xs text-white">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            
            <!-- Heart Icon for Favorites -->
            <button onclick="toggleFavorite(event, ${movie.id})" class="absolute top-2 right-2 bg-black bg-opacity-75 p-1.5 rounded-full hover:bg-opacity-90 transition-all">
                <svg class="w-4 h-4 ${favorites.includes(movie.id) ? 'text-red-600' : 'text-white'}" fill="${favorites.includes(movie.id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
            </button>
            
            <!-- Info Button -->
            <button onclick="showMovieDetails(event, ${movie.id})" class="absolute bottom-2 right-2 bg-black bg-opacity-75 p-1.5 rounded-full hover:bg-opacity-90 transition-all">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </button>
            
            <p class="text-xs mt-2 truncate font-medium">${movie.title}</p>
        </div>
    `).join('');
}

// Modal Event Listeners
document.getElementById('closeDetails').onclick = () => {
    document.getElementById('movieDetailsModal').classList.add('hidden');
};

document.getElementById('searchInput').onkeypress = (e) => {
    if(e.key === 'Enter') fetchMovies(e.target.value);
};

// Initialize UI sections on load
renderFavorites();
updateRecentSection();

fetchMovies();